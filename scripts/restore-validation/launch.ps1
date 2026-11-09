param([Parameter(Mandatory=$true)][string]$LinuxProject)
$ErrorActionPreference = 'Stop'
if ($LinuxProject -notmatch '^/home/[a-zA-Z0-9_.-]+/(?:[a-zA-Z0-9_.-]+/)*[a-zA-Z0-9_.-]+$' -or $LinuxProject -match '(?:^|/)\.\.?(/|$)') {
  throw 'Invalid Linux project path.'
}
$taskProcess = Start-Process -FilePath "$env:WINDIR\System32\wsl.exe" -ArgumentList @('-d','Ubuntu','--','bash',"$LinuxProject/scripts/restore-validation/monthly.sh") -WindowStyle Hidden -Wait -PassThru
exit $taskProcess.ExitCode
