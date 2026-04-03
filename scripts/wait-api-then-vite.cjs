/**
 * Waits until the API writes ../.dev-api-port, then starts Vite with VITE_API_URL set.
 * Avoids EADDRINUSE when port 5000 is already taken (server bumps port in dev).
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = path.join(__dirname, '..');
const portFile = path.join(root, '.dev-api-port');
const deadline = Date.now() + 90_000;
const isWin = process.platform === 'win32';

function readPort() {
  try {
    const s = fs.readFileSync(portFile, 'utf8').trim();
    return /^\d+$/.test(s) ? Number(s) : null;
  } catch {
    return null;
  }
}

function startVite(port) {
  const env = {
    ...process.env,
    VITE_API_URL: `http://127.0.0.1:${port}`,
  };
  // Use npm workspace so Vite resolves whether hoisted to root or under client/
  const npmCmd = isWin ? 'npm.cmd' : 'npm';
  const child = spawn(npmCmd, ['run', 'dev', '-w', 'client'], {
    cwd: root,
    env,
    stdio: 'inherit',
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
}

function poll() {
  const port = readPort();
  if (port != null) {
    startVite(port);
    return;
  }
  if (Date.now() > deadline) {
    console.error('[dev] Timed out waiting for .dev-api-port. Is the API server running?');
    process.exit(1);
  }
  setTimeout(poll, 120);
}

poll();
