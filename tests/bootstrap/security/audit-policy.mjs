const approvedUrl = 'https://github.com/advisories/GHSA-86w9-cpqp-85rv';
const knownPackages = new Set(['node-forge', '@expo/code-signing-certificates', '@expo/cli', 'expo']);

export function validateAuditReport(report) {
  if (report.error || !report.vulnerabilities || !report.metadata?.vulnerabilities) {
    throw new Error('Incomplete audit report.');
  }
  const vulnerabilities = report.vulnerabilities;
  if (report.metadata.vulnerabilities.total !== Object.keys(vulnerabilities).length) {
    throw new Error('Audit counts are inconsistent.');
  }
  function approvedOrigin(name, visiting = new Set()) {
    if (!knownPackages.has(name) || visiting.has(name)) return false;
    const entry = vulnerabilities[name];
    if (!entry || !entry.via?.length) return false;
    const next = new Set(visiting).add(name);
    return entry.via.every(origin => typeof origin === 'string'
      ? approvedOrigin(origin, next)
      : origin.name === 'node-forge' && origin.url === approvedUrl);
  }
  for (const name of Object.keys(vulnerabilities)) {
    if (!approvedOrigin(name)) throw new Error(`New or unmitigated advisory: ${name}.`);
  }
  return Object.keys(vulnerabilities).length;
}
