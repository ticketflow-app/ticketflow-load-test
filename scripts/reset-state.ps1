<#
.SYNOPSIS
    Resets load-test data (reservations + Redis availability counters). Dry run by default.

.DESCRIPTION
    Without -EventId it truncates the whole `reservations` table and clears every
    `inv:stock:*` key. With -EventId it only removes that event's rows and counters.

    Nothing is executed unless -Yes is passed.

.EXAMPLE
    .\reset-state.ps1                          # shows what would happen
    .\reset-state.ps1 -Yes                     # full reset
    .\reset-state.ps1 -EventId 0f0c... -Yes    # only one event
#>
[CmdletBinding()]
param(
    [string]$EventId,
    [switch]$Yes,
    [string]$DbContainer = 'ticketflow-inventory-db',
    [string]$RedisContainer = 'ticketflow-redis'
)

$ErrorActionPreference = 'Stop'

$scope = if ($EventId) { "evento $EventId" } else { 'TODOS los eventos' }

if ($EventId) {
    $parsed = [guid]::Empty
    if (-not [guid]::TryParse($EventId, [ref]$parsed)) { throw "EventId is not a GUID: $EventId" }
    $sql = "DELETE FROM reservations WHERE event_id = '$EventId';"
    $redisPattern = "inv:stock:${EventId}:*"
} else {
    $sql = 'TRUNCATE reservations RESTART IDENTITY;'
    $redisPattern = 'inv:stock:*'
}

Write-Output "Alcance : $scope"
Write-Output "SQL     : $sql"
Write-Output "Redis   : claves '$redisPattern'"

$before = & docker exec $DbContainer psql -U postgres -d inventory -t -A -c 'SELECT count(*) FROM reservations;' 2>&1
Write-Output "Reservas actuales: $before"

if (-not $Yes) {
    Write-Output ''
    Write-Output 'Dry run: nothing executed. Re-run with -Yes to apply.'
    exit 0
}

$sqlResult = & docker exec $DbContainer psql -U postgres -d inventory -c $sql 2>&1
if ($LASTEXITCODE -ne 0) { throw "SQL reset failed: $sqlResult" }

$redisResult = & docker exec $RedisContainer sh -c "redis-cli --scan --pattern '$redisPattern' | xargs -r redis-cli DEL" 2>&1
if ($LASTEXITCODE -ne 0) { throw "Redis reset failed: $redisResult" }

$after = & docker exec $DbContainer psql -U postgres -d inventory -t -A -c 'SELECT count(*) FROM reservations;' 2>&1

Write-Output ''
Write-Output "SQL   : $sqlResult"
Write-Output "Redis : DEL $redisResult"
Write-Output "Reservas despues: $after"
