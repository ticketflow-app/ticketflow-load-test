<#
.SYNOPSIS
    Samples CPU and memory of the TicketFlow containers and appends them to a CSV.

.DESCRIPTION
    Runs `docker stats --no-stream` every N seconds and records one row per container.
    Designed to run next to a k6 scenario (run-scenario.ps1 starts it automatically).

.PARAMETER OutFile
    CSV path. Created (with header) if missing, appended otherwise.

.PARAMETER IntervalSec
    Seconds between samples. Default 3. `docker stats` itself takes ~1 s per call.

.PARAMETER DurationSec
    0 = run until the process is killed (default). Any other value stops after N seconds.

.PARAMETER Include
    Container name prefixes to record. Default: ticketflow- (covers every stack container).

.EXAMPLE
    .\sample-resources.ps1 -OutFile .\results\06-flash-sale\resources.csv -IntervalSec 2
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)][string]$OutFile,
    [int]$IntervalSec = 3,
    [int]$DurationSec = 0,
    [string[]]$Include = @('ticketflow-')
)

$ErrorActionPreference = 'Stop'
$inv = [System.Globalization.CultureInfo]::InvariantCulture
$memFactor = @{ 'B' = 1.0 / 1MB; 'KiB' = 1.0 / 1024; 'MiB' = 1.0; 'GiB' = 1024.0; 'TiB' = 1048576.0 }
$memRegex = '^(?<v>[\d\.,]+)\s*(?<u>[KMGTP]?i?B)\s*/\s*(?<lv>[\d\.,]+)\s*(?<lu>[KMGTP]?i?B)$'

function ConvertTo-Number([string]$text) {
    if ([string]::IsNullOrWhiteSpace($text)) { return 0.0 }
    $normalized = $text.Trim().Replace(',', '.')
    return [double]::Parse($normalized, $inv)
}

function Format-Number([double]$value, [int]$decimals) {
    return $value.ToString('F' + $decimals, $inv)
}

$directory = Split-Path -Parent $OutFile
if ($directory -and -not (Test-Path $directory)) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}
if (-not (Test-Path $OutFile)) {
    'Timestamp,ElapsedSec,Container,CpuPercent,MemMiB,MemLimitMiB,Pids' | Set-Content -Path $OutFile -Encoding UTF8
}

$start = Get-Date
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
Write-Output "sampler: writing $OutFile every $IntervalSec s"

while ($true) {
    $elapsed = [math]::Round($stopwatch.Elapsed.TotalSeconds, 1)
    if ($DurationSec -gt 0 -and $stopwatch.Elapsed.TotalSeconds -ge $DurationSec) { break }

    $raw = & docker stats --no-stream --format '{{json .}}' 2>$null
    $timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss', $inv)

    foreach ($line in $raw) {
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        try {
            $row = $line | ConvertFrom-Json
        } catch {
            continue
        }

        $name = [string]$row.Name
        $matchesPrefix = $false
        foreach ($prefix in $Include) {
            if ($name.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
                $matchesPrefix = $true
                break
            }
        }
        if (-not $matchesPrefix) { continue }

        $cpu = ConvertTo-Number ([string]$row.CPUPerc).Replace('%', '')

        $memMiB = 0.0
        $limitMiB = 0.0
        $memMatch = [regex]::Match([string]$row.MemUsage, $memRegex)
        if ($memMatch.Success) {
            $memMiB = (ConvertTo-Number $memMatch.Groups['v'].Value) * $memFactor[$memMatch.Groups['u'].Value]
            $limitMiB = (ConvertTo-Number $memMatch.Groups['lv'].Value) * $memFactor[$memMatch.Groups['lu'].Value]
        }

        $pids = 0
        if ($row.PIDs) { $pids = [int]$row.PIDs }

        $csvRow = @(
            $timestamp,
            (Format-Number $elapsed 1),
            $name,
            (Format-Number $cpu 2),
            (Format-Number $memMiB 1),
            (Format-Number $limitMiB 1),
            $pids
        ) -join ','
        Add-Content -Path $OutFile -Value $csvRow -Encoding UTF8
    }

    Start-Sleep -Seconds $IntervalSec
}

Write-Output "sampler: finished after $([math]::Round($stopwatch.Elapsed.TotalSeconds, 1)) s"
