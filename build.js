/**
 * GUIA DE MANUTENÇÃO — build.js
 * Objetivo: Rotinas auxiliares de build do frontend.
 * Como modificar: Agrupa a preparação dos arquivos de produção. Confira package.json e README antes de mudar o comando utilizado pelo ambiente de publicação.
 * Convenções: mantenha funções pequenas, use nomes claros, trate erros de rede e nunca exponha segredos no frontend.
 */

import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
for(const file of fs.readdirSync(root)){if(file.endsWith('.html')){const p=path.join(root,file);let s=fs.readFileSync(p,'utf8');s=s.replace(/\s{2,}/g,' ');fs.writeFileSync(p,s)}}
console.log('PurperZone static build complete.');
