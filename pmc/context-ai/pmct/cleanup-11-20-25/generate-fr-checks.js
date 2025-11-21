// Parses pmc/product/03-bmo-functional-requirements.md to auto-generate FR checks
// based on "FRx.y.z" headings and Code Reference entries.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('C:/Users/james/Master/BrightHub/brun/train-data');
const DOC_PATH = path.join(ROOT, 'pmc', 'product', '03-bmo-functional-requirements.md');
const PMCT_DIR = path.join(ROOT, 'pmc', 'context-ai', 'pmct');
const OUT_PATH = path.join(PMCT_DIR, 'fr-checks.generated.json');

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function classifyArtifactType(p) {
  const s = p.toLowerCase();
  if (s.includes('/app/api/')) return 'route';
  if (s.includes('/components/')) return 'component';
  if (s.includes('/supabase/migrations/') || s.endsWith('.sql')) return 'migration';
  return 'service';
}

function toAbsolute(p) {
  // Normalize relative doc paths to absolute forward-slash paths
  let rel = p.replace(/\\/g, '/');
  if (rel.startsWith('/')) rel = rel.slice(1);
  if (rel.startsWith('src/')) return `${ROOT}/${rel}`;
  if (rel.startsWith('train-wireframe/')) return `${ROOT}/${rel}`;
  if (rel.startsWith('supabase/')) return `${ROOT}/${rel}`;
  // Fallback: assume relative to ROOT
  return `${ROOT}/${rel}`;
}

function parseFRs(md) {
  const lines = md.split(/\r?\n/);
  const frs = [];
  let current = null;

  const frHeaderRe = /^- \*\*FR(\d+\.\d+\.\d+):\*\*\s*(.+)$/;
  const codeRefLineRe = /Code Reference:/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(frHeaderRe);
    if (m) {
      // Start a new FR block
      if (current) frs.push(current);
      const idNum = m[1];
      const title = m[2].trim();
      current = {
        fr_id: `FR${idNum} — ${title}`,
        artifacts: [],
        threshold: 1,
        notes: `Auto-generated from 03-bmo-functional-requirements.md`
      };
      continue;
    }

    if (current && codeRefLineRe.test(line)) {
      // Extract code blocks within backticks on this line and possibly the next few lines
      const codeMatches = [];
      let j = i;
      // Collect up to 3 lines to catch multiple references separated by commas
      for (let k = 0; k < 3 && j + k < lines.length; k++) {
        const segment = lines[j + k];
        const re = /`([^`]+)`/g;
        let mm;
        while ((mm = re.exec(segment)) !== null) {
          codeMatches.push(mm[1]);
        }
      }
      // Turn each code reference into an artifact
      for (const cm of codeMatches) {
        // Support formats like: src/lib/types.ts:26-46
        const parts = cm.split(':');
        const relPath = parts[0].trim();
        if (!relPath) continue;
        const absPath = toAbsolute(relPath);
        const type = classifyArtifactType(relPath);
        current.artifacts.push({
          type,
          path_patterns: [absPath],
          symbol_patterns: [],
          required: false
        });
      }
    }
  }
  if (current) frs.push(current);
  return frs;
}

function main() {
  if (!fs.existsSync(DOC_PATH)) {
    console.error('Functional requirements document not found at', DOC_PATH);
    process.exit(1);
  }
  const md = readFile(DOC_PATH);
  const checks = parseFRs(md);
  const json = { checks };
  fs.writeFileSync(OUT_PATH, JSON.stringify(json, null, 2), 'utf8');
  console.log('Generated checks written to', OUT_PATH, 'count=', checks.length);
}

main();