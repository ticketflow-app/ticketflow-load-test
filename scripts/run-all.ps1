<#
.SYNOPSIS
    Runs every load-test scenario sequentially and writes one consolidated PASS/FAIL report.

.DESCRIPTION
    Runs the scenarios one after another (never in parallel), each in its own folder with its own
    CPU/RAM sampling, then cross-checks the anti-oversell invariant and builds a session summary.

    Per scenario it captures:
      - thresholds result (local or sla profile),
      - p95 / p99 latency, throughput and failure rate,
      - peak CPU and RAM of the whole stack,
      - eventId/localityId created in setup,
      - stdout/stderr logs of the run.

    Output:
      results\sessions\<timestamp>\
        01-catalog\...                    one folder per scenario
        06-flash-sale\invariants.log      SQL + Redis verification
        SUMMARY.md                        human-readable consolidated report
        session.json                      machine-readable consolidated report

.PARAMETER Scenarios
    Subset to run, e.g. -Scenarios 01,06. Default: all (01, 04, 05, 06, 07, 08).

.PARAMETER Smoke
    Uses short stages (about 20-30 s per scenario) to validate the pipeline quickly.
    Also lowers the flash-sale stock to 5 so the invariant is still exercised.

.PARAMETER StopOnError
    Stops at the first failing scenario. By default every scenario runs and the verdict is
    reported at the end, which is what you want to see the whole picture.

.EXAMPLE
    .\run-all.ps1
    .\run-all.ps1 -Smoke
    .\run-all.ps1 -Scenarios 01,06 -Profile sla
#>
[CmdletBinding()]
param(
    [string[]]$Scenarios = @('01', '04', '05', '06', '07', '08'),
    [ValidateSet('local', 'sla')][string]$Profile = 'local',
    [switch]$Smoke,
    [int]$IntervalSec = 3,
    [string]$ResultsRoot,
    [switch]$NoPrometheus,
    [switch]$StopOnError,
    [string]$Label
)

$ErrorActionPreference = 'Stop'
$inv = [System.Globalization.CultureInfo]::InvariantCulture

$repo = Split-Path -Parent $PSScriptRoot
if (-not $ResultsRoot) { $ResultsRoot = Join-Path $repo 'results' }

$Scenarios = $Scenarios | ForEach-Object { $_ -split ',' } | Where-Object { $_ -ne '' } | ForEach-Object { $_.Trim() }

$meta = @{
    '01' = @{ Name = '01-catalog';      Title = 'E1  catalogo (listado)';   Smoke = @('5s:2', '10s:5', '5s:0');  Env = $null }
    '04' = @{ Name = '04-availability'; Title = 'E2  disponibilidad';       Smoke = @('5s:2', '10s:4', '5s:0');  Env = $null }
    '05' = @{ Name = '05-event-detail'; Title = 'E1b detalle de evento';    Smoke = @('5s:2', '10s:5', '5s:0');  Env = $null }
    '06' = @{ Name = '06-flash-sale';   Title = 'E3  flash sale';           Smoke = @('5s:6', '20s:10', '5s:0'); Env = 'STOCK=5,BUYERS=5' }
    '07' = @{ Name = '07-confirm';      Title = 'E5  confirmacion';         Smoke = @('5s:4', '15s:6', '5s:0');  Env = $null }
    '08' = @{ Name = '08-degradation';  Title = 'E4  degradacion';          Smoke = @('3s:20', '10s:40', '3s:0'); Env = $null }
}

foreach ($scenario in $Scenarios) {
    if (-not $meta.ContainsKey($scenario)) {
        throw "Unknown scenario '$scenario'. Valid values: $($meta.Keys -join ', ')"
    }
}

$sessionName = Get-Date -Format 'yyyyMMdd-HHmmss'
if ($Label) { $sessionName = "$sessionName-$Label" }
$sessionDir = Join-Path (Join-Path $ResultsRoot 'sessions') $sessionName
New-Item -ItemType Directory -Force -Path $sessionDir | Out-Null
$sessionDir = (Resolve-Path $sessionDir).Path

$runScenario = Join-Path $PSScriptRoot 'run-scenario.ps1'
$verifyScript = Join-Path $PSScriptRoot 'verify-invariants.ps1'

# Start-Process joins -ArgumentList with spaces without quoting, so paths with spaces must be quoted here.
function Quote([string]$value) {
    if ($value -match '\s') { return '"' + $value + '"' }
    return $value
}

# Uses System.Diagnostics.Process instead of Start-Process: -PassThru does not expose a reliable
# ExitCode here, and the child's exit code is the whole point (PASS/FAIL).
function Invoke-Logged {
    param(
        [Parameter(Mandatory = $true)][string]$StdOutLog,
        [Parameter(Mandatory = $true)][string]$StdErrLog,
        [Parameter(Mandatory = $true)][string]$ArgumentLine,
        [string]$Label = 'ejecutando'
    )

    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = 'powershell.exe'
    $startInfo.Arguments = $ArgumentLine
    $startInfo.UseShellExecute = $false
    $startInfo.CreateNoWindow = $true
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    [void]$process.Start()
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()

    $timer = [System.Diagnostics.Stopwatch]::StartNew()
    while (-not $process.HasExited) {
        Start-Sleep -Milliseconds 1500
        if (-not $process.HasExited) {
            Write-Host ("`r    {0}... {1,3} s" -f $Label, [int]$timer.Elapsed.TotalSeconds) -NoNewline
        }
    }
    $process.WaitForExit()

    if ($stdoutTask.Result) { Set-Content -LiteralPath $StdOutLog -Value $stdoutTask.Result -Encoding UTF8 }
    if ($stderrTask.Result) { Set-Content -LiteralPath $StdErrLog -Value $stderrTask.Result -Encoding UTF8 }

    Write-Host ("`r    {0}... {1,3} s" -f $Label, [int]$timer.Elapsed.TotalSeconds) -NoNewline
    Write-Host ''
    return [int]$process.ExitCode
}

function Format-Duration([double]$seconds) {
    $ts = [TimeSpan]::FromSeconds($seconds)
    if ($ts.TotalMinutes -ge 1) {
        return ('{0} min {1} s' -f [int][math]::Floor($ts.TotalMinutes), $ts.Seconds)
    }
    return ('{0} s' -f [math]::Round($ts.TotalSeconds, 0))
}

function Format-Cell($value, [string]$suffix) {
    if ($null -eq $value -or $value -eq '') { return 'n/d' }
    if ($value -is [double] -or $value -is [int] -or $value -is [decimal]) {
        return ([double]$value).ToString('0.0', $inv) + $suffix
    }
    return [string]$value
}

$sessionStart = Get-Date
$results = @()

Write-Host ''
Write-Host ('=' * 78) -ForegroundColor Cyan
Write-Host ' TicketFlow - sesion de pruebas de carga' -ForegroundColor Cyan
Write-Host (" Escenarios : $($Scenarios -join ', ')") -ForegroundColor Cyan
Write-Host (" Perfil     : $Profile" + $(if ($Smoke) { ' (smoke)' } else { '' })) -ForegroundColor Cyan
Write-Host (" Resultados : $sessionDir") -ForegroundColor Cyan
Write-Host ('=' * 78) -ForegroundColor Cyan

foreach ($scenario in $Scenarios) {
    $info = $meta[$scenario]
    $runDir = Join-Path $sessionDir $info.Name
    New-Item -ItemType Directory -Force -Path $runDir | Out-Null

    Write-Host ''
    Write-Host ('-' * 78) -ForegroundColor DarkCyan
    Write-Host (" [$scenario] $($info.Title)") -ForegroundColor Cyan
    Write-Host ('-' * 78) -ForegroundColor DarkCyan

    $childArgs = @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass',
        '-File', (Quote $runScenario),
        '-Scenario', $scenario,
        '-Profile', $Profile,
        '-IntervalSec', "$IntervalSec",
        '-RunDir', (Quote $runDir)
    )
    if ($Smoke -and $info.Smoke) { $childArgs += @('-Stages', (Quote ($info.Smoke -join ','))) }
    if ($Smoke -and $info.Env) { $childArgs += @('-Env', (Quote $info.Env)) }
    if ($NoPrometheus) { $childArgs += '-NoPrometheus' }

    $timer = [System.Diagnostics.Stopwatch]::StartNew()
    $exitCode = Invoke-Logged -Label "escenario $scenario" `
        -StdOutLog (Join-Path $runDir 'console.out.log') `
        -StdErrLog (Join-Path $runDir 'console.err.log') `
        -ArgumentLine ($childArgs -join ' ')
    $timer.Stop()

    $run = $null
    $runJsonPath = Join-Path $runDir 'run.json'
    if (Test-Path $runJsonPath) {
        try { $run = Get-Content $runJsonPath -Raw | ConvertFrom-Json } catch { $run = $null }
    }

    # Compact k6 report so the user sees the numbers without opening files.
    $summaryMd = Join-Path $runDir "$($info.Name)-summary.md"
    if (Test-Path $summaryMd) {
        Write-Host ''
        Get-Content $summaryMd | ForEach-Object { Write-Host ('    ' + $_) }
    }
    $resourcesMd = Join-Path $runDir 'resources-summary.md'
    if (Test-Path $resourcesMd) {
        Get-Content $resourcesMd | Where-Object { $_ -match '^- (RAM|CPU) total' } | ForEach-Object { Write-Host ('    ' + $_) }
    }
    if (-not $run) {
        Write-Host ''
        Write-Host '    (sin run.json) ultimas lineas del error:' -ForegroundColor Red
        if (Test-Path (Join-Path $runDir 'console.err.log')) {
            Get-Content (Join-Path $runDir 'console.err.log') -Tail 15 | ForEach-Object { Write-Host ('    ' + $_) -ForegroundColor DarkRed }
        }
    }

    # Anti-oversell invariant: only the flash-sale scenario consumes scarce stock.
    $invariant = $null
    if ($scenario -eq '06' -and $run -and $run.eventId -and $run.localityId) {
        $stock = if ($run.stock) { [int]$run.stock } else { 100 }
        Write-Host ''
        Write-Host ("    verificando invariante (stock esperado $stock)...") -ForegroundColor DarkCyan
        $invariantExit = Invoke-Logged -Label 'invariante' `
            -StdOutLog (Join-Path $runDir 'invariants.log') `
            -StdErrLog (Join-Path $runDir 'invariants.err.log') `
            -ArgumentLine (@(
                '-NoProfile', '-ExecutionPolicy', 'Bypass',
                '-File', (Quote $verifyScript),
                '-EventId', $run.eventId,
                '-LocalityId', $run.localityId,
                '-ExpectedStock', "$stock"
            ) -join ' ')
        if (Test-Path (Join-Path $runDir 'invariants.log')) {
            Get-Content (Join-Path $runDir 'invariants.log') | ForEach-Object { Write-Host ('    ' + $_) }
        }
        $invariant = ($invariantExit -eq 0)
    }

    $reasons = @()
    if (-not $run) {
        $reasons += 'sin run.json'
    } else {
        if ($run.exitCode -ne 0) { $reasons += "k6 exit $($run.exitCode)" }
        if ($run.thresholdsOk -ne $true) { $reasons += 'umbrales' }
    }
    if ($invariant -eq $false) { $reasons += 'invariante' }
    $passed = ($reasons.Count -eq 0)

    $results += [pscustomobject]@{
        Id           = $scenario
        Name         = $info.Name
        Title        = $info.Title
        Passed       = $passed
        Reasons      = ($reasons -join ', ')
        ExitCode     = if ($run) { $run.exitCode } else { $exitCode }
        ThresholdsOk = if ($run) { $run.thresholdsOk } else { $null }
        P95          = if ($run -and $run.latencyMs) { $run.latencyMs.p95 } else { $null }
        P99          = if ($run -and $run.latencyMs) { $run.latencyMs.p99 } else { $null }
        Requests     = if ($run -and $run.requests) { $run.requests.total } else { $null }
        ReqPerSecond = if ($run -and $run.requests) { $run.requests.rate_per_s } else { $null }
        FailedRate   = if ($run -and $run.requests) { $run.requests.failed_rate } else { $null }
        ChecksRate   = if ($run -and $run.checks) { $run.checks.rate } else { $null }
        PeakMemMiB   = if ($run -and $run.resources) { $run.resources.peakMemMiB } else { $null }
        PeakCpu      = if ($run -and $run.resources) { $run.resources.peakCpuPercent } else { $null }
        Invariant    = $invariant
        EventId      = if ($run) { $run.eventId } else { $null }
        LocalityId   = if ($run) { $run.localityId } else { $null }
        Stock        = if ($run) { $run.stock } else { $null }
        DurationSec  = [math]::Round($timer.Elapsed.TotalSeconds, 1)
        Folder       = $runDir
    }

    Write-Host ''
    if ($passed) {
        Write-Host " [$scenario] PASS" -ForegroundColor Green
    } else {
        Write-Host " [$scenario] FAIL -> $($reasons -join ', ')" -ForegroundColor Red
        if ($StopOnError) { break }
    }
}

# --- consolidated report ------------------------------------------------------
$sessionEnd = Get-Date
$totalSeconds = ($sessionEnd - $sessionStart).TotalSeconds
$failed = @($results | Where-Object { -not $_.Passed })
$globalPass = ($failed.Count -eq 0 -and $results.Count -eq $Scenarios.Count)

$lines = @()
$lines += '# Sesion de pruebas de carga'
$lines += ''
$lines += "- Perfil: ``$Profile``" + $(if ($Smoke) { ' (smoke)' } else { '' })
$lines += "- Escenarios: $($results.Count) de $($Scenarios.Count)"
$lines += "- Inicio: $($sessionStart.ToString('yyyy-MM-dd HH:mm:ss', $inv))"
$lines += "- Duracion total: $(Format-Duration $totalSeconds)"
$lines += "- Resultado global: **$(if ($globalPass) { 'PASS' } else { 'FAIL' })**"
if (-not $globalPass) {
    $lines += "- Fallidos: $((@($failed | ForEach-Object { $_.Id })) -join ', ')"
}
$lines += ''
$lines += '| Escenario | Resultado | Umbrales | p95 ms | req/s | Fallidas | RAM pico MiB | CPU pico % | Invariante | Duracion |'
$lines += '|---|---|---|---|---|---|---|---|---|---|'

foreach ($r in $results) {
    $failRate = if ($null -ne $r.FailedRate) { ([double]$r.FailedRate * 100).ToString('0.00', $inv) + ' %' } else { 'n/d' }
    $invariantCell = if ($null -eq $r.Invariant) { '-' } elseif ($r.Invariant) { 'PASS' } else { 'FAIL' }
    $lines += ('| {0} - {1} | {2} | {3} | {4} | {5} | {6} | {7} | {8} | {9} | {10} |' -f `
        $r.Id, $r.Title,
        $(if ($r.Passed) { 'PASS' } else { 'FAIL' }),
        $(if ($r.ThresholdsOk -eq $true) { 'OK' } elseif ($null -eq $r.ThresholdsOk) { 'n/d' } else { 'FALLO' }),
        (Format-Cell $r.P95 ''), (Format-Cell $r.ReqPerSecond ''), $failRate,
        (Format-Cell $r.PeakMemMiB ''), (Format-Cell $r.PeakCpu ''), $invariantCell,
        (Format-Cell $r.DurationSec ' s'))
}

$lines += ''
$lines += '## Detalle'
foreach ($r in $results) {
    $lines += ''
    $lines += "### $($r.Id) - $($r.Title) - $(if ($r.Passed) { 'PASS' } else { 'FAIL' })"
    $lines += ''
    $lines += "- Carpeta: ``$($r.Folder)``"
    if (-not $r.Passed) { $lines += "- Motivo: $($r.Reasons)" }
    $lines += "- k6 exit code: $($r.ExitCode)"
    $lines += "- Peticiones: $(Format-Cell $r.Requests '') a $(Format-Cell $r.ReqPerSecond '') req/s"
    $lines += "- Latencia: p95 $(Format-Cell $r.P95 '') ms - p99 $(Format-Cell $r.P99 '') ms"
    if ($null -ne $r.FailedRate) { $lines += "- Fallidas: $(([double]$r.FailedRate * 100).ToString('0.00', $inv)) %" }
    if ($null -ne $r.ChecksRate) { $lines += "- Checks: $(([double]$r.ChecksRate * 100).ToString('0.00', $inv)) %" }
    $lines += "- RAM pico del stack: $(Format-Cell $r.PeakMemMiB '') MiB - CPU pico: $(Format-Cell $r.PeakCpu '') %"
    if ($r.EventId) { $lines += "- eventId: ``$($r.EventId)`` / localityId: ``$($r.LocalityId)``" }
    if ($null -ne $r.Invariant) { $lines += "- Invariante anti-sobreventa: $(if ($r.Invariant) { 'PASS' } else { 'FAIL' }) (stock $($r.Stock))" }
    $lines += "- Archivos: summary.json, summary.md, resources.csv, resources-summary.md, console.out.log, console.err.log, invariants.log"
}

$lines += ''
$lines += '## Como leerlo'
$lines += ''
$lines += '- **Umbrales**: gates de regresion. `local` es el perfil de este equipo; `sla` usa los valores del plan de plataforma.'
$lines += '- **Invariante**: solo E3. Contrasta el resultado de k6 con PostgreSQL y Redis (`verify-invariants.ps1`).'
$lines += '- **RAM/CPU pico**: suma de todos los contenedores `ticketflow-*` muestreados cada N segundos durante ese escenario.'
$lines += '- Un escenario FAIL no invalida los demas: cada uno tiene su propia carpeta y su propio veredicto.'

$reportPath = Join-Path $sessionDir 'SUMMARY.md'
$lines | Set-Content -Path $reportPath -Encoding UTF8

@{
    startedAt   = $sessionStart.ToString('yyyy-MM-dd HH:mm:ss', $inv)
    finishedAt  = $sessionEnd.ToString('yyyy-MM-dd HH:mm:ss', $inv)
    durationSec = [math]::Round($totalSeconds, 1)
    profile     = $Profile
    smoke       = [bool]$Smoke
    globalPass  = $globalPass
    scenarios   = $results
} | ConvertTo-Json -Depth 6 | Set-Content -Path (Join-Path $sessionDir 'session.json') -Encoding UTF8

Write-Host ''
Write-Host ('=' * 78) -ForegroundColor Cyan
Write-Host ' RESUMEN DE LA SESION' -ForegroundColor Cyan
Write-Host ('=' * 78) -ForegroundColor Cyan
Write-Host ''
Write-Host ('{0,-25} {1,-9} {2,7} {3,7} {4,8} {5,11} {6,10} {7,10}' -f 'Escenario', 'Resultado', 'p95 ms', 'req/s', 'fallidas', 'RAM pico', 'CPU pico', 'invariante')
foreach ($r in $results) {
    $failRate = if ($null -ne $r.FailedRate) { ([double]$r.FailedRate * 100).ToString('0.00', $inv) + '%' } else { 'n/d' }
    $invariantCell = if ($null -eq $r.Invariant) { '-' } elseif ($r.Invariant) { 'PASS' } else { 'FAIL' }
    $line = ('{0,-25} {1,-9} {2,7} {3,7} {4,8} {5,11} {6,10} {7,10}' -f `
        ($r.Id + ' ' + ($r.Name -replace '^\d+-', '')), $(if ($r.Passed) { 'PASS' } else { 'FAIL' }),
        (Format-Cell $r.P95 ''), (Format-Cell $r.ReqPerSecond ''), $failRate,
        ((Format-Cell $r.PeakMemMiB '') + ' MiB'), ((Format-Cell $r.PeakCpu '') + ' %'), $invariantCell)
    if ($r.Passed) {
        Write-Host $line -ForegroundColor Green
    } else {
        Write-Host $line -ForegroundColor Red
        Write-Host ("    motivo: $($r.Reasons)") -ForegroundColor Red
    }
}

Write-Host ''
if ($globalPass) {
    Write-Host " RESULTADO GLOBAL: PASS ($($results.Count)/$($results.Count))" -ForegroundColor Green
} else {
    Write-Host " RESULTADO GLOBAL: FAIL ($($failed.Count) de $($results.Count) fallidos)" -ForegroundColor Red
}
Write-Host (" Duracion: $(Format-Duration $totalSeconds)")
Write-Host (" Resultados: $sessionDir")
Write-Host (" Resumen:    $reportPath")
Write-Host ''

if (-not $globalPass) { exit 1 }
exit 0
