param(
  [string]$LinuxProject = "/home/brasi/.local/share/garimpo/validation/task002-20261101",
  [switch]$Remove
)
$ErrorActionPreference = "Stop"
$taskName = "Garimpo-DailyBackup"
if ($Remove) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
  Write-Output "Agendamento de backup removido."
  exit
}
if ($LinuxProject -notmatch '^/home/[a-zA-Z0-9_.-]+/(?:[a-zA-Z0-9_.-]+/)*[a-zA-Z0-9_.-]+$') {
  throw "Caminho Linux do projeto inválido."
}
$action = New-ScheduledTaskAction -Execute "$env:WINDIR\System32\wsl.exe" -Argument "-d Ubuntu -- bash $LinuxProject/scripts/backup/daily.sh"
$trigger = New-ScheduledTaskTrigger -Daily -At "03:00"
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2)
$principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description "Backup diário privado do Garimpo, às 03h, com execução ao retornar." -Force | Out-Null
Write-Output "Backup agendado às 03h com execução ao retornar. Requer sessão do Windows aberta."
