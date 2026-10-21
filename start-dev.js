import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('🚀 Iniciando entorno de desarrollo TechStore (Caso 5)...');
console.log('📦 Levantando Backend (:3001) y Frontend (:5173) simultáneamente\n');

// 1. Iniciar Backend
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[BACKEND]\x1b[0m ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[BACKEND ERR]\x1b[0m ${data}`);
});

// 2. Iniciar Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'pipe',
  shell: true
});

frontend.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[35m[FRONTEND]\x1b[0m ${data}`);
});

frontend.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[FRONTEND ERR]\x1b[0m ${data}`);
});

// Control de salida limpia
function cleanup() {
  console.log('\n🛑 Deteniendo servidores...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
