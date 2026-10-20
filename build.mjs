import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
for (const entry of await fs.readdir(root, { withFileTypes: true })) {
  if (entry.name === 'dist' || entry.name === 'node_modules' || entry.name.endsWith('.zip')) continue;
  await fs.cp(path.join(root, entry.name), path.join(dist, entry.name), { recursive: true });
}
console.log('PurperZone: arquivos estáticos preparados em dist/.');
