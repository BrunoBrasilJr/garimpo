param([Parameter(Mandatory=$true)][string]$Directory)
$ErrorActionPreference = 'Stop'
$bridge = Get-Content -LiteralPath (Join-Path $Directory 'bridge.json') -Raw | ConvertFrom-Json
if ($bridge.origin -notmatch '^https://localhost:\d{1,5}$') { throw 'Only isolated localhost bridge accepted' }
$client = Join-Path $PSScriptRoot 'windows-client.mjs'
& node $client $Directory probe
if ($LASTEXITCODE -ne 0) { throw 'Browser trust negative control failed' }
$certificate = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(,[Convert]::FromBase64String($bridge.ca))
if ($certificate.HasPrivateKey) { throw 'Only a public test CA is accepted' }
$store = New-Object System.Security.Cryptography.X509Certificates.X509Store('Root','CurrentUser')
$added = $false
try {
  $store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)
  $existing = $store.Certificates.Find([System.Security.Cryptography.X509Certificates.X509FindType]::FindByThumbprint,$certificate.Thumbprint,$false)
  if ($existing.Count -eq 0) { $store.Add($certificate); $added = $true }
  & node $client $Directory run
  if ($LASTEXITCODE -ne 0) { throw 'Windows browser acceptance failed; inspect the private result' }
} finally {
  if ($added) { $store.Remove($certificate) }
  $store.Close()
  if ($added -and (Get-Item -LiteralPath ('Cert:\CurrentUser\Root\' + $certificate.Thumbprint) -ErrorAction SilentlyContinue)) { throw 'Test CA cleanup failed' }
}
Write-Output 'Windows browser acceptance finished. Temporary test CA removed.'
