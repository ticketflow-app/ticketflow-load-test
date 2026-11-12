<#
.SYNOPSIS
    Verifies the anti-oversell invariant for one event (PostgreSQL + Redis).

.DESCRIPTION
    Reads the real state after a load run and fails (exit 1) when:
      - the reserved quantity does not match the locality stock,
      - the Redis counter is not zero,
      - the Redis counter went negative,
      - the stored capacity does not match the expected stock.

    Run it right after scripts\run-scenario.ps1 -Scenario 06, using the eventId/localityId
    printed by the scenario setup (also visible in the k6 log).

.EXAMPLE
    .\verify-invariants.ps1 -EventId 0f0c... -LocalityId 9a1b... -ExpectedStock 100
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$EventId,
    [Parameter(Mandatory = $true)][string]$LocalityId,
    [int]$ExpectedStock = 100,
    [string]$DbContainer = 'ticketflow-inventory-db',
    [string]$RedisContainer = 'ticketflow-redis'
)

$ErrorActionPreference = 'Stop'

$parsed = [guid]::Empty
if (-not [guid]::TryParse($EventId, [ref]$parsed)) { throw "EventId is not a GUID: $EventId" }
if (-not [guid]::TryParse($LocalityId, [ref]$parsed)) { throw "LocalityId is not a GUID: $LocalityId" }

function Invoke-Sql([string]$query) {
    $output = & docker exec $DbContainer psql -U postgres -d inventory -t -A -F ',' -c $query 2>&1
    if ($LASTEXITCODE -ne 0) { throw "psql failed: $output" }
    return ($output | Where-Object { $_ -ne '' } | Select-Object -First 1)
}

$where = "event_id = '$EventId' AND locality_id = '$LocalityId'"

$reservedRaw  = Invoke-Sql "SELECT coalesce(sum(quantity), 0) FROM reservations WHERE $where AND status IN ('PENDING','CONFIRMED');"
$rowsRaw      = Invoke-Sql "SELECT count(*) FROM reservations WHERE $where;"
$pendingRaw   = Invoke-Sql "SELECT count(*) FROM reservations WHERE $where AND status = 'PENDING';"
$confirmedRaw = Invoke-Sql "SELECT count(*) FROM reservations WHERE $where AND status = 'CONFIRMED';"

$stockRaw    = (& docker exec $RedisContainer redis-cli GET "inv:stock:${EventId}:${LocalityId}" 2>&1 | Out-String).Trim()
$capacityRaw = (& docker exec $RedisContainer redis-cli GET "inv:stock:${EventId}:${LocalityId}:capacity" 2>&1 | Out-String).Trim()

$reserved  = [int]$reservedRaw
$stock     = if ($stockRaw -eq '(nil)' -or $stockRaw -eq '') { $null } else { [int]$stockRaw }
$capacity  = if ($capacityRaw -eq '(nil)' -or $capacityRaw -eq '') { $null } else { [int]$capacityRaw }

$checks = @(
    [pscustomobject]@{ Name = 'Cupos reservados == stock esperado'; Ok = ($reserved -eq $ExpectedStock); Detail = "reservados=$reserved esperado=$ExpectedStock" }
    [pscustomobject]@{ Name = 'Contador Redis existe'; Ok = ($null -ne $stock); Detail = "inv:stock:*=$stockRaw" }
    [pscustomobject]@{ Name = 'Contador Redis == 0'; Ok = ($null -ne $stock -and $stock -eq 0); Detail = "stock=$stock" }
    [pscustomobject]@{ Name = 'Contador Redis no negativo'; Ok = ($null -ne $stock -and $stock -ge 0); Detail = "stock=$stock" }
    [pscustomobject]@{ Name = 'Capacidad almacenada == stock esperado'; Ok = ($null -ne $capacity -and $capacity -eq $ExpectedStock); Detail = "capacity=$capacity esperado=$ExpectedStock" }
    [pscustomobject]@{ Name = 'Hay reservas registradas'; Ok = ([int]$rowsRaw -gt 0); Detail = "filas=$rowsRaw" }
)

Write-Output ''
Write-Output "Evento    : $EventId"
Write-Output "Localidad : $LocalityId"
Write-Output "Reservas  : $rowsRaw (PENDING=$pendingRaw, CONFIRMED=$confirmedRaw)"
Write-Output "Redis     : stock=$stockRaw capacity=$capacityRaw"
Write-Output ''
Write-Output '| Verificacion | Resultado | Detalle |'
Write-Output '|---|---|---|'
foreach ($check in $checks) {
    $label = if ($check.Ok) { 'PASS' } else { 'FAIL' }
    Write-Output ('| {0} | {1} | {2} |' -f $check.Name, $label, $check.Detail)
}

$failed = @($checks | Where-Object { -not $_.Ok })
Write-Output ''
if ($failed.Count -gt 0) {
    Write-Output "RESULTADO: FAIL ($($failed.Count) verif. fallidas)"
    exit 1
}
Write-Output 'RESULTADO: PASS'
exit 0
