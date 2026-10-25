import { readFile, writeFile } from 'node:fs/promises';
import { CV_SAMPLE, JOB_SAMPLE } from '../src/lib/fixtures';
import { analyze } from '../src/lib/score';
import { rewriteCv } from '../src/lib/rewrite';
import { buildDocxBlob, buildPdfArrayBuffer, buildTxt } from '../src/lib/export';

const outDir = process.argv[2] ?? '/tmp';
const cvPath = process.argv[3];
const jobPath = process.argv[4];

const cvText = cvPath ? await readFile(cvPath, 'utf8') : CV_SAMPLE;
const jobText = !jobPath ? JOB_SAMPLE : jobPath === 'none' ? '' : await readFile(jobPath, 'utf8');

const analysis = analyze(cvText, jobText);
const rewrite = rewriteCv(cvText, analysis);

const fonts = {
  regularBase64: (await readFile('src/assets/fonts/Roboto-Regular.ttf')).toString('base64'),
  boldBase64: (await readFile('src/assets/fonts/Roboto-Bold.ttf')).toString('base64'),
};

await writeFile(`${outDir}/exemplo.txt`, buildTxt(rewrite), 'utf8');
await writeFile(`${outDir}/exemplo.pdf`, new Uint8Array(await buildPdfArrayBuffer(rewrite, fonts)));
const docx = await buildDocxBlob(rewrite);
await writeFile(`${outDir}/exemplo.docx`, new Uint8Array(await docx.arrayBuffer()));

console.log(`nota=${analysis.score} secoes=${rewrite.sections.length} mudancas=${rewrite.changes.length}`);
console.log(`arquivos em ${outDir}: exemplo.txt, exemplo.pdf, exemplo.docx`);
