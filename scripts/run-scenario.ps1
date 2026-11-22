<#
.SYNOPSIS
    Runs one k6 scenario with CPU/RAM sampling and writes a self-contained results folder.

.DESCRIPTION
    Orchestrates: results folder -> resource sampler -> k6 (mounted scripts) -> sampler stop ->
    resource summary. One command per scenario, nothing else to remember.

    Scenarios and default stages (overridable with -Stages):
      Gateway (test-api-gateway):
      01  catalog listing      20s:5   60s:25  20s:0
      04  availability         20s:4   60s:8   20s:0
      05  event detail         20s:5   60s:25  20s:0
      06  flash sale           10s:15  100s:15 10s:0
      07  confirmation         10s:8   50s:8   10s:0
      08  degradation          5s:40   50s:40  5s:0
      Inventory directo (test-inventory, salta el API Gateway):
      i1  calibracion          30s:10  30s:25  30s:50  30s:75  30s:0
      i2  disponibilidad       20s:5   80s:20  20s:0
      i3  flash sale           10s:15  100s:15 10s:0
      i4  confirmacion         10s:10  50s:10  10s:0
      i5  estres               5s:45   55s:45  5s:0

.PARAMETER Scenario
    Scenario id (01, 04, 05, 06, 07, 08, i1, i2, i3, i4, i5).

.PARAMETER Stages
    Override the default stages, e.g. -Stages 10s:5,30s:10,10s:0

.PARAMETER Profile
    local (default) = regression thresholds for a shared machine.
    sla             = thresholds from the platform test plan.

.PARAMETER NoSampler
    Skip the CPU/RAM sampler (useful for a very short smoke run).

.PARAMETER ReplayJson
    Also emit k6 per-request events to results/<run>/requests.json. This is the input for
    scripts/generate-replay.js. Off by default because a full run can exceed 300k requests.

.PARAMETER ThinkTime
    Seconds each k6 iteration sleeps. 0 (default) = per-scenario value: 06 uses 2 s so the
    inventory traffic stays under the gateway rate limit (10 req/s), the rest use 1 s.

.PARAMETER RunDir
    Exact output folder. When omitted, results\\<scenario>\\<timestamp> is used.
    run-all.ps1 uses it to keep every scenario under one session folder.

.EXAMPLE
    .\run-scenario.ps1 -Scenario 01
    .\run-scenario.ps1 -Scenario 06 -Profile sla
    .\run-scenario.ps1 -Scenario 04 -Stages 10s:4,20s:8,10s:0 -NoSampler
    .\run-scenario.ps1 -Scenario 06 -Stages 5s:6,20s:10,5s:0 -NoSampler -ReplayJson
#>
[CmdletBinding()]
param(
    [ValidateSet('01', '04', '05', '06', '07', '08', 'i1', 'i2', 'i3', 'i4', 'i5')][string]$Scenario = '01',
    [string[]]$Stages,
    [ValidateSet('local', 'sla')][string]$Profile = 'local',
    [int]$ThinkTime = 0,
    [int]$IntervalSec = 3,
    [object]$Env,
    [switch]$NoSampler,
    [switch]$NoPrometheus,
    [switch]$ReplayJson,
    [string]$ResultsRoot,
    [string]$RunDir,
    [string]$BaseUrl = 'http://ticketflow-api-gateway:8080',
    [string]$Network = 'ticketflow-api-gateway_default'
)

$ErrorActionPreference = 'Stop'
$inv = [System.Globalization.CultureInfo]::InvariantCulture

$repo = Split-Path -Parent $PSScriptRoot
if (-not $ResultsRoot) { $ResultsRoot = Join-Path $repo 'results' }

# Base URL por defecto del contenedor de inventory en la red Docker (salta el API Gateway).
# Puede sobrescribirse con -BaseUrl o con -e BASE_URL=... a nivel de k6.
$defaultInventoryBaseUrl = 'http://ticketflow-inventory-service:8082'

$scenarios = @{
    # --- Gateway (test-api-gateway) -------------------------------------------------
    '01' = @{ File = '01-catalog-test.js';      Name = '01-catalog';      Stages = @('20s:5', '60s:25', '20s:0'); Folder = 'test-api-gateway'; BaseUrl = 'http://ticketflow-api-gateway:8080' }
    '04' = @{ File = '04-availability-test.js'; Name = '04-availability'; Stages = @('20s:4', '60s:8', '20s:0'); Folder = 'test-api-gateway'; BaseUrl = 'http://ticketflow-api-gateway:8080' }
    '05' = @{ File = '05-event-detail-test.js'; Name = '05-event-detail'; Stages = @('20s:5', '60s:25', '20s:0'); Folder = 'test-api-gateway'; BaseUrl = 'http://ticketflow-api-gateway:8080' }
    '06' = @{ File = '06-flash-sale-test.js';   Name = '06-flash-sale';   Stages = @('10s:15', '100s:15', '10s:0'); ThinkTime = 2; Folder = 'test-api-gateway'; BaseUrl = 'http://ticketflow-api-gateway:8080' }
    '07' = @{ File = '07-confirm-test.js';      Name = '07-confirm';      Stages = @('10s:8', '50s:8', '10s:0'); Folder = 'test-api-gateway'; BaseUrl = 'http://ticketflow-api-gateway:8080' }
    '08' = @{ File = '08-degradation-test.js';  Name = '08-degradation';  Stages = @('5s:40', '50s:40', '5s:0'); Folder = 'test-api-gateway'; BaseUrl = 'http://ticketflow-api-gateway:8080' }
    # --- Inventory directo (test-inventory, sin API Gateway) ------------------------
    'i1' = @{ File = '01-inv-calibration-test.js'; Name = '01-inv-calibration'; Stages = @('30s:10', '30s:25', '30s:50', '30s:75', '30s:0'); ThinkTime = 0; Folder = 'test-inventory'; BaseUrl = $defaultInventoryBaseUrl }
    'i2' = @{ File = '02-inv-availability-test.js'; Name = '02-inv-availability'; Stages = @('20s:5', '80s:20', '20s:0'); ThinkTime = 1; Folder = 'test-inventory'; BaseUrl = $defaultInventoryBaseUrl }
    'i3' = @{ File = '03-inv-flash-sale-test.js'; Name = '03-inv-flash-sale'; Stages = @('10s:15', '100s:15', '10s:0'); ThinkTime = 1; Folder = 'test-inventory'; BaseUrl = $defaultInventoryBaseUrl }
    'i4' = @{ File = '04-inv-confirm-test.js'; Name = '04-inv-confirm'; Stages = @('10s:10', '50s:10', '10s:0'); ThinkTime = 1; Folder = 'test-inventory'; BaseUrl = $defaultInventoryBaseUrl }
    'i5' = @{ File = '05-inv-stress-test.js'; Name = '05-inv-stress'; Stages = @('5s:45', '55s:45', '5s:0'); ThinkTime = 0; Folder = 'test-inventory'; BaseUrl = $defaultInventoryBaseUrl }
}

$selected = $scenarios[$Scenario]
$tests    = Join-Path $repo $selected.Folder
$effectiveStages = if ($Stages) { $Stages } else { $selected.Stages }
# 0 = use the scenario default. E3/i3 stays under the gateway rate limit for inventory (10 req/s).
$effectiveThinkTime = if ($ThinkTime -gt 0) { $ThinkTime } elseif ($null -ne $selected.ThinkTime) { $selected.ThinkTime } else { 1 }
$effectiveBaseUrl = if ($PSBoundParameters.ContainsKey('BaseUrl')) { $BaseUrl } else { $selected.BaseUrl }
# Accept both -Stages 20s:5,60s:25,20s:0 (one string) and an array of stages.
$effectiveStages = $effectiveStages | ForEach-Object { $_ -split ',' } | Where-Object { $_ -ne '' }

function ConvertTo-Seconds([string]$value) {
    if ($value -match '^(\d+)(ms|s|m|h)$') {
        $amount = [int]$Matches[1]
        switch ($Matches[2]) {
            'ms' { return $amount / 1000.0 }
            's'  { return [double]$amount }
            'm'  { return [double]($amount * 60) }
            'h'  { return [double]($amount * 3600) }
        }
    }
    throw "Invalid stage duration: $value (use 30s, 1m, ...)"
}

$totalSeconds = 0.0
foreach ($stage in $effectiveStages) {
    $parts = $stage -split ':'
    if ($parts.Count -ne 2) { throw "Invalid stage '$stage' (expected duration:target, e.g. 20s:5)" }
    $totalSeconds += ConvertTo-Seconds $parts[0]
}

if (-not (Test-Path $tests)) {
    throw "Scenario folder not found: $tests"
}
if (-not (Test-Path (Join-Path $tests $selected.File))) {
    throw "Script not found: $(Join-Path $tests $selected.File)"
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if ($RunDir) {
    $runDir = $RunDir
} else {
    $runDir = Join-Path (Join-Path $ResultsRoot $selected.Name) $stamp
}
New-Item -ItemType Directory -Force -Path $runDir | Out-Null
$runDir = (Resolve-Path $runDir).Path

$mountTests   = ($tests  -replace '\\', '/')
$mountResults = ($runDir -replace '\\', '/')
$samplerCsv   = Join-Path $runDir 'resources.csv'

Write-Output "scenario : $($selected.Name)"
Write-Output "stages   : $($effectiveStages -join ' -> ')"
Write-Output "profile  : $Profile"
Write-Output "think    : $effectiveThinkTime s"
Write-Output "results  : $runDir"

# --- resource sampler ---------------------------------------------------------
$sampler = $null
if (-not $NoSampler) {
    $samplerScript = Join-Path $PSScriptRoot 'sample-resources.ps1'
    $samplerArgs = @(
        '-NoProfile', '-ExecutionPolicy', 'Bypass',
        '-File', "`"$samplerScript`"",
        '-OutFile', "`"$samplerCsv`"",
        '-IntervalSec', $IntervalSec,
        '-DurationSec', ([int]$totalSeconds + 60)
    )
    $sampler = Start-Process -FilePath 'powershell.exe' -ArgumentList $samplerArgs -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 2
    if (Test-Path $samplerCsv) {
        Write-Output "sampler  : pid $($sampler.Id) -> resources.csv"
    } else {
        Write-Warning "sampler did not start (no resources.csv). Continuing without CPU/RAM data."
    }
}

# --- k6 run -------------------------------------------------------------------
$ErrorActionPreference = 'Continue'
if (docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq 'ticketflow-k6' }) {
    docker rm -f ticketflow-k6 | Out-Null
}
$ErrorActionPreference = 'Stop'

$dockerArgs = @(
    'run', '--rm', '--name', 'ticketflow-k6',
    '--network', $Network,
    '-v', "${mountTests}:/scripts",
    '-v', "${mountResults}:/results",
    '-e', "BASE_URL=$effectiveBaseUrl",
    '-e', "PROFILE=$Profile",
    '-e', "THINK_TIME=$effectiveThinkTime",
    '-e', 'RESULTS_DIR=/results'
)

# Los escenarios de inventory llaman directo a user-service y catalog-service en setup().
if ($selected.Folder -eq 'test-inventory') {
    $dockerArgs += @('-e', 'USER_URL=http://ticketflow-user-service:8081')
    $dockerArgs += @('-e', 'CATALOG_URL=http://ticketflow-catalog-service:8082')
}

$k6OutputArgs = @()
if (-not $NoPrometheus) {
    $dockerArgs += @('-e', 'K6_PROMETHEUS_RW_SERVER_URL=http://ticketflow-prometheus:9090/api/v1/write')
    $k6OutputArgs = @('-o', 'experimental-prometheus-rw')
}

# Per-request JSON is the source for the interactive replay viewer. It is opt-in because a full
# local run produces hundreds of thousands of lines.
if ($ReplayJson) {
    $k6OutputArgs += @('-o', 'json=/results/requests.json')
}

if ($Env) {
    # Accepts -Env STOCK=5,BUYERS=5 (command line) or -Env @{ STOCK='5' } (in-session).
    $pairs = @()
    if ($Env -is [System.Collections.IDictionary]) {
        foreach ($key in $Env.Keys) { $pairs += "$key=$($Env[$key])" }
    } else {
        foreach ($item in @($Env)) {
            $pairs += ($item -split ',') | Where-Object { $_ -ne '' }
        }
    }
    foreach ($pair in $pairs) {
        if ($pair -notmatch '^[A-Za-z_][A-Za-z0-9_]*=') {
            throw "Invalid -Env value '$pair' (expected KEY=VALUE)"
        }
        $dockerArgs += @('-e', $pair)
    }
}

$dockerArgs += @('grafana/k6', 'run')
$dockerArgs += $k6OutputArgs
foreach ($stage in $effectiveStages) {
    $dockerArgs += @('--stage', $stage)
}
$dockerArgs += "/scripts/$($selected.File)"

# En PowerShell 5.1, $ErrorActionPreference = 'Stop' convierte cualquier salida por stderr
# de un comando nativo (como console.log() en k6) en una excepción terminante.
# Cambiamos temporalmente a 'Continue' durante la ejecución de docker.
$exitCode = 0
$k6Error = $null
try {
    $ErrorActionPreference = 'Continue'
    & docker @dockerArgs
    $exitCode = $LASTEXITCODE
    if ($null -eq $exitCode) { $exitCode = 0 }
} catch {
    $k6Error = $_.Exception.Message
    $exitCode = if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { $LASTEXITCODE } else { -1 }
} finally {
    $ErrorActionPreference = 'Continue'
    if ($sampler -and -not $sampler.HasExited) {
        Stop-Process -Id $sampler.Id -Force -ErrorAction SilentlyContinue
    }
    if (docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq 'ticketflow-k6' }) {
        docker rm -f ticketflow-k6 | Out-Null
    }
    $ErrorActionPreference = 'Stop'
}

if ($exitCode -ne 0) {
    if (-not $k6Error) { $k6Error = "k6/docker salio con codigo $exitCode" }
    Write-Warning "k6/docker fallo: $k6Error. Se escribira run.json con los datos disponibles."
}

# --- resource summary ---------------------------------------------------------
$summaryLines = @()
$resourceStats = $null
try {
    $summaryLines += "# Recursos - $($selected.Name)"
    $summaryLines += ''
    $summaryLines += "- Perfil: $Profile"
    $summaryLines += "- Stages: $($effectiveStages -join ', ')"
    $summaryLines += "- Muestreo: cada $IntervalSec s"
    $summaryLines += "- k6 exit code: $exitCode"
    $summaryLines += ''

    if (Test-Path $samplerCsv) {
        $rows = Import-Csv $samplerCsv -ErrorAction SilentlyContinue
        if ($null -ne $rows -and $rows.Count -gt 0) {
            $samples = ($rows | Group-Object Timestamp).Count
            $summaryLines += "- Muestras: $samples"
            $summaryLines += ''
            $summaryLines += '| Contenedor | CPU media % | CPU max % | RAM media MiB | RAM max MiB |'
            $summaryLines += '|---|---|---|---|---|'

            $perContainer = $rows | Group-Object Container | ForEach-Object {
                $cpu = $_.Group | ForEach-Object { [double]::Parse($_.CpuPercent, $inv) }
                $mem = $_.Group | ForEach-Object { [double]::Parse($_.MemMiB, $inv) }
                [pscustomobject]@{
                    Name   = $_.Name
                    CpuAvg = ($cpu | Measure-Object -Average).Average
                    CpuMax = ($cpu | Measure-Object -Maximum).Maximum
                    MemAvg = ($mem | Measure-Object -Average).Average
                    MemMax = ($mem | Measure-Object -Maximum).Maximum
                }
            } | Sort-Object -Property CpuMax -Descending

            foreach ($item in $perContainer) {
                $summaryLines += ('| {0} | {1} | {2} | {3} | {4} |' -f $item.Name,
                    $item.CpuAvg.ToString('F2', $inv), $item.CpuMax.ToString('F2', $inv),
                    $item.MemAvg.ToString('F1', $inv), $item.MemMax.ToString('F1', $inv))
            }

            $memTotals = @()
            $cpuTotals = @()
            foreach ($sample in ($rows | Group-Object Timestamp)) {
                $memSum = 0.0
                $cpuSum = 0.0
                foreach ($row in $sample.Group) {
                    $memSum += [double]::Parse($row.MemMiB, $inv)
                    $cpuSum += [double]::Parse($row.CpuPercent, $inv)
                }
                $memTotals += $memSum
                $cpuTotals += $cpuSum
            }

            $resourceStats = @{
                samples        = $samples
                avgMemMiB      = [math]::Round((($memTotals | Measure-Object -Average).Average), 1)
                peakMemMiB     = [math]::Round((($memTotals | Measure-Object -Maximum).Maximum), 1)
                avgCpuPercent  = [math]::Round((($cpuTotals | Measure-Object -Average).Average), 2)
                peakCpuPercent = [math]::Round((($cpuTotals | Measure-Object -Maximum).Maximum), 2)
            }

            $summaryLines += ''
            $summaryLines += "- RAM total del stack: media $($resourceStats.avgMemMiB) MiB, pico $($resourceStats.peakMemMiB) MiB"
            $summaryLines += "- CPU total del stack: media $($resourceStats.avgCpuPercent) %, pico $($resourceStats.peakCpuPercent) %"
        }
    }
    if ($summaryLines.Count -eq 0 -or ($summaryLines[-1] -ne '- Sin muestreo de recursos (sampler desactivado o sin datos).' -and $null -eq $resourceStats)) {
        if (-not (Test-Path $samplerCsv) -or $null -eq $resourceStats) {
            $hasNote = $summaryLines | Where-Object { $_ -eq '- Sin muestreo de recursos (sampler desactivado o sin datos).' }
            if ($hasNote.Count -eq 0) {
                $summaryLines += '- Sin muestreo de recursos (sampler desactivado o sin datos).'
            }
        }
    }
} catch {
    $summaryLines += '- Error al procesar muestreo de recursos: ' + $_.Exception.Message
}

$summaryPath = Join-Path $runDir 'resources-summary.md'
$summaryLines | Set-Content -Path $summaryPath -Encoding UTF8

# --- machine-readable run record ---------------------------------------------
# k6 reports the measured load window through requests/rate; the elapsed wall clock also includes
# the post-run requests.json dump and is kept separately for transparency.
$wallStart = [datetime]::ParseExact($stamp, 'yyyyMMdd-HHmmss', $inv)
$wallDurationSec = [math]::Round(((Get-Date) - $wallStart).TotalSeconds, 1)
$measuredDurationSec = $null
$mainRequests = $null
$mainRate = $null
$mainWindowSec = $null
try {
    $scenarioSummaryPath = Join-Path $runDir "$($selected.Name)-summary.json"
    $scenarioSummary = $null
    if (Test-Path $scenarioSummaryPath) {
        try {
            $scenarioSummary = Get-Content $scenarioSummaryPath -Raw | ConvertFrom-Json
        } catch {
            $scenarioSummary = $null
        }
    }

    $thresholdsOk = $null
    $latency = $null
    $requests = $null
    $checks = $null
    $counters = $null
    $eventId = $null
    $localityId = $null
    $stock = $null
    if ($scenarioSummary) {
        $thresholdsOk = $scenarioSummary.thresholds_ok
        $latency = $scenarioSummary.latency_ms
        $requests = $scenarioSummary.requests
        if ($requests -and $requests.rate_per_s -gt 0) {
            $measuredDurationSec = [math]::Round($requests.total / $requests.rate_per_s, 2)
        }
        $checks = $scenarioSummary.checks
        $counters = $scenarioSummary.counters
        if ($scenarioSummary.setup_data) {
            $eventId = $scenarioSummary.setup_data.eventId
            $localityId = $scenarioSummary.setup_data.localityId
            $stock = $scenarioSummary.setup_data.stock
        }
    }

    # k6's http_reqs includes setup(). Derive load metrics from phase=main only so they match
    # what the replay shows by default and what the configured stages actually measure.
    if ($ReplayJson) {
        $requestsJsonPath = Join-Path $runDir 'requests.json'
        if (Test-Path $requestsJsonPath) {
            $count = 0
            $firstTicks = $null
            $lastTicks = 0
            $reader = [System.IO.StreamReader]::new($requestsJsonPath)
            try {
                while (($line = $reader.ReadLine()) -ne $null) {
                    if (-not $line) { continue }
                    try { $row = $line | ConvertFrom-Json } catch { continue }
                    if ($row.type -ne 'Point' -or $row.metric -ne 'http_reqs' -or -not $row.data) { continue }
                    if ($row.data.tags -and $row.data.tags.phase -eq 'setup') { continue }
                    $ticks = [datetimeoffset]::Parse($row.data.time, $inv).UtcDateTime.Ticks
                    $count += 1
                    if ($null -eq $firstTicks -or $ticks -lt $firstTicks) { $firstTicks = $ticks }
                    if ($ticks -gt $lastTicks) { $lastTicks = $ticks }
                }
            } finally {
                $reader.Dispose()
            }
            if ($count -gt 0 -and $null -ne $firstTicks -and $lastTicks -gt $firstTicks) {
                $mainRequests = $count
                $mainWindowSec = [math]::Round(($lastTicks - $firstTicks) / 10000000.0, 2)
                if ($mainWindowSec -gt 0) { $mainRate = [math]::Round($mainRequests / $mainWindowSec, 2) }
            }
        }
    }

    $runRecord = @{
        scenario     = $selected.Name
        file         = $selected.File
        profile      = $Profile
        stages       = $effectiveStages
        baseUrl      = $effectiveBaseUrl
        exitCode     = $exitCode
        startedAt           = $stamp
        finishedAt          = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss', $inv)
        measuredDurationSec = $measuredDurationSec
        wallDurationSec     = $wallDurationSec
        mainRequests        = $mainRequests
        mainRate            = $mainRate
        mainWindowSec       = $mainWindowSec
        resultsDir          = $runDir
        thresholdsOk        = $thresholdsOk
        latencyMs    = $latency
        requests     = $requests
        checks       = $checks
        counters     = $counters
        eventId      = $eventId
        localityId   = $localityId
        stock        = $stock
        resources    = $resourceStats
        k6Error      = $k6Error
    }
    $runRecord | ConvertTo-Json -Depth 6 | Set-Content -Path (Join-Path $runDir 'run.json') -Encoding UTF8
} catch {
    try {
        @{
            scenario     = $selected.Name
            file         = $selected.File
            profile      = $Profile
            stages       = $effectiveStages
            baseUrl      = $effectiveBaseUrl
            exitCode     = $exitCode
            startedAt           = $stamp
            finishedAt          = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss', $inv)
            measuredDurationSec = $null
            wallDurationSec     = $wallDurationSec
            mainRequests        = $null
            mainRate            = $null
            mainWindowSec       = $null
            resultsDir          = $runDir
            thresholdsOk        = $false
            latencyMs    = $null
            requests     = $null
            checks       = $null
            counters     = $null
            eventId      = $null
            localityId   = $null
            stock        = $null
            resources    = $null
            k6Error      = $k6Error
        } | ConvertTo-Json -Depth 3 | Set-Content -Path (Join-Path $runDir 'run.json') -Encoding UTF8
    } catch {
    }
}

Write-Output ''
$summaryLines | Write-Output
Write-Output ''
Write-Output "results: $runDir"
exit $exitCode