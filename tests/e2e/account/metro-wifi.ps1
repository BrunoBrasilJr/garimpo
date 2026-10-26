param([switch]$Remove)
$ErrorActionPreference = 'Stop'
$principal = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Open PowerShell as Administrator, then run this script again.'
}
$wifiAddress = '192.168.0.93'
$wslAddress = '172.30.246.124'
$ruleName = 'Garimpo-Metro-8081'
if ($Remove) {
    netsh interface portproxy delete v4tov4 listenaddress=$wifiAddress listenport=8081
    if ($LASTEXITCODE -ne 0) { throw 'Could not remove the exact test forwarding entry.' }
    Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule
    Write-Host 'Temporary Metro Wi-Fi forwarding removed.'
    exit
}
$currentWifi = @(Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4 | Select-Object -ExpandProperty IPAddress)
$wslOutput = wsl -d Ubuntu -- hostname -I
if ($LASTEXITCODE -ne 0) { throw 'Could not inspect Ubuntu WSL.' }
$currentWsl = @($wslOutput.Trim() -split '\s+')
if ($wifiAddress -notin $currentWifi -or $wslAddress -notin $currentWsl) {
    throw 'IP addresses changed. Ask the agent to recheck before changing forwarding.'
}
if (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue) {
    throw 'The named rule already exists. Reuse it after inspection; do not overwrite it.'
}
netsh interface portproxy add v4tov4 listenaddress=$wifiAddress listenport=8081 connectaddress=$wslAddress connectport=8081
if ($LASTEXITCODE -ne 0) { throw 'Could not prepare Metro forwarding.' }
New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8081 -LocalAddress $wifiAddress -InterfaceAlias 'Wi-Fi' -RemoteAddress LocalSubnet -Profile Any | Out-Null
Write-Host 'Metro limited to Wi-Fi and LocalSubnet. API/database were not forwarded.'
Write-Host 'After the phone test, run this script with -Remove.'
