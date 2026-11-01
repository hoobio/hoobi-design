#Requires -Version 7.0
[CmdletBinding(DefaultParameterSetName = 'Name')]
param(
    [Parameter(Mandatory, ParameterSetName = 'Name', Position = 0)]
    [string] $Name,

    [Parameter(Mandatory, ParameterSetName = 'Id')]
    [int] $Id,

    [ValidateRange(1, 3600)]
    [int] $IntervalSeconds = 5,

    [ValidateRange(1, 10000)]
    [int] $Samples = 12
)

$ErrorActionPreference = 'Stop'

$process = if ($PSCmdlet.ParameterSetName -eq 'Id') { Get-Process -Id $Id } else { Get-Process -Name $Name | Select-Object -First 1 }

$rows = foreach ($sample in 1..$Samples) {
    $process.Refresh()
    $perf = Get-CimInstance -ClassName Win32_PerfFormattedData_PerfProc_Process -Filter "IDProcess = $($process.Id)"
    [pscustomobject]@{
        Sample            = $sample
        Time              = Get-Date -Format 'HH:mm:ss'
        PrivateWorkingSet = [math]::Round($perf.WorkingSetPrivate / 1MB, 1)
        WorkingSet        = [math]::Round($process.WorkingSet64 / 1MB, 1)
        PrivateBytes      = [math]::Round($process.PrivateMemorySize64 / 1MB, 1)
    }
    if ($sample -lt $Samples) {
        Start-Sleep -Seconds $IntervalSeconds
    }
}

"$($process.ProcessName) ($($process.Id)), MB"
$rows | Format-Table -AutoSize

$summary = foreach ($counter in 'PrivateWorkingSet', 'WorkingSet', 'PrivateBytes') {
    $values = @($rows.$counter | Sort-Object)
    $middle = [math]::Floor($values.Count / 2)
    [pscustomobject]@{
        Counter = $counter
        Min     = $values[0]
        Median  = if ($values.Count % 2) { $values[$middle] } else { ($values[$middle - 1] + $values[$middle]) / 2 }
        Max     = $values[-1]
    }
}

$summary | Format-Table -AutoSize
