import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
for(const file of fs.readdirSync(root)){if(file.endsWith('.html')){const p=path.join(root,file);let s=fs.readFileSync(p,'utf8');s=s.replace(/\s{2,}/g,' ');fs.writeFileSync(p,s)}}
console.log('PurperZone static build complete.');
