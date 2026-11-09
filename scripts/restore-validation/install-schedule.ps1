param([string]$LinuxProject = '/home/brasi/.local/share/garimpo/validation/task002-20261101')
$ErrorActionPreference = 'Stop'
if ($LinuxProject -notmatch '^/home/[a-zA-Z0-9_.-]+/(?:[a-zA-Z0-9_.-]+/)*[a-zA-Z0-9_.-]+$' -or $LinuxProject -match '(?:^|/)\.\.?(/|$)') {
  throw 'Invalid Linux project path.'
}
$taskName = 'Garimpo-MonthlyRestoreValidation'
$sid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$now = Get-Date
$start = Get-Date -Year $now.Year -Month $now.Month -Day 1 -Hour 4 -Minute 0 -Second 0 -Millisecond 0
if ($start -le $now) { $start = $start.AddMonths(1) }
$boundary = $start.ToString('yyyy-MM-ddTHH:mm:ss')
$exe = [Security.SecurityElement]::Escape("$env:WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe")
$launcher = Join-Path $PSScriptRoot 'launch.ps1'
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing -and $existing.Actions.Arguments -notlike '*restore-validation*launch.ps1*') {
  throw 'Refusing to replace an unrelated scheduled task.'
}
$arguments = [Security.SecurityElement]::Escape("-NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$launcher`" -LinuxProject $LinuxProject")
$xml = @"
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo><Description>Garimpo isolated monthly backup restore validation.</Description></RegistrationInfo>
  <Triggers><CalendarTrigger><StartBoundary>$boundary</StartBoundary><Enabled>true</Enabled>
    <ScheduleByMonth><DaysOfMonth><Day>1</Day></DaysOfMonth><Months>
      <January/><February/><March/><April/><May/><June/><July/><August/><September/><October/><November/><December/>
    </Months></ScheduleByMonth>
  </CalendarTrigger></Triggers>
  <Principals><Principal id="Author"><UserId>$sid</UserId><LogonType>InteractiveToken</LogonType><RunLevel>LeastPrivilege</RunLevel></Principal></Principals>
  <Settings><MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy><StartWhenAvailable>true</StartWhenAvailable>
    <ExecutionTimeLimit>PT2H</ExecutionTimeLimit><Enabled>true</Enabled></Settings>
  <Actions Context="Author"><Exec><Command>$exe</Command><Arguments>$arguments</Arguments></Exec></Actions>
</Task>
"@
Register-ScheduledTask -TaskName $taskName -Xml $xml -Force | Out-Null
Write-Output 'Monthly restore validation scheduled for day 1 at 04:00 local time, with catch-up.'
