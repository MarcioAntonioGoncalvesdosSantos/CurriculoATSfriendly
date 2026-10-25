import { writeFile } from 'node:fs/promises';
import { CV_SAMPLE, JOB_SAMPLE } from '../src/lib/fixtures';
import { analyze } from '../src/lib/score';
import { rewriteCv } from '../src/lib/rewrite';
import { buildDocxBlob, buildPdfArrayBuffer, buildTxt } from '../src/lib/export';

const analysis = analyze(CV_SAMPLE, JOB_SAMPLE);
const rewrite = rewriteCv(CV_SAMPLE, analysis);

const outDir = process.argv[2] ?? '/tmp';

await writeFile(`${outDir}/exemplo.txt`, buildTxt(rewrite), 'utf8');
await writeFile(`${outDir}/exemplo.pdf`, new Uint8Array(buildPdfArrayBuffer(rewrite)));
const docx = await buildDocxBlob(rewrite);
await writeFile(`${outDir}/exemplo.docx`, new Uint8Array(await docx.arrayBuffer()));

console.log(`nota=${analysis.score} secoes=${rewrite.sections.length} mudancas=${rewrite.changes.length}`);
console.log(`arquivos em ${outDir}: exemplo.txt, exemplo.pdf, exemplo.docx`);
