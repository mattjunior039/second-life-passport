# Second Life Passport · Health Check (Windows, PowerShell)
# Reads battery data from Windows (WMI, the same source as `powercfg /batteryreport`)
# and opens the Repair Station pre-filled. Run: powershell -ExecutionPolicy Bypass -File windows.ps1
$site = if ($env:SLP_SITE) { $env:SLP_SITE } else { "https://mattjunior039.github.io/second-life-passport/" }

$static = Get-CimInstance -Namespace root\wmi -ClassName BatteryStaticData -ErrorAction SilentlyContinue | Select-Object -First 1
$full   = Get-CimInstance -Namespace root\wmi -ClassName BatteryFullChargedCapacity -ErrorAction SilentlyContinue | Select-Object -First 1
$cycle  = Get-CimInstance -Namespace root\wmi -ClassName BatteryCycleCount -ErrorAction SilentlyContinue | Select-Object -First 1
$model  = (Get-CimInstance Win32_ComputerSystemProduct).Version
if (-not $model) { $model = (Get-CimInstance Win32_ComputerSystem).Model }

if (-not $static -or -not $full) {
  Write-Host "Couldn't read battery data. Run: powercfg /batteryreport  and enter the numbers by hand."
  exit 1
}

$design = $static.DesignedCapacity
$fullCap = $full.FullChargedCapacity
$cycles = if ($cycle) { $cycle.CycleCount } else { 0 }
$health = [math]::Round($fullCap / $design * 100, 1)

Write-Host "Model:        $model"
Write-Host "Design:       $design mWh"
Write-Host "Full charge:  $fullCap mWh"
Write-Host "Health:       $health %"
Write-Host "Cycles:       $cycles"

Add-Type -AssemblyName System.Web
$m = [System.Web.HttpUtility]::UrlEncode($model)
$s = [System.Web.HttpUtility]::UrlEncode("Windows battery report (powercfg)")
$url = "${site}create/?model=$m&source=$s&design=$design&full=$fullCap&cycles=$cycles&unit=mWh"
Write-Host "Opening Repair Station: $url"
Start-Process $url
