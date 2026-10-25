const [major, minor, patch] = process.versions.node.split('.').map(Number);
const supported = major === 24 && (minor > 22 || (minor === 22 && patch >= 1));
if (!supported || process.platform !== 'linux') {
  console.error('Garimpo requer Node Linux >=24.22.1 <25 no Ubuntu WSL; consulte docs/architecture/execution.md.');
  process.exit(1);
}
