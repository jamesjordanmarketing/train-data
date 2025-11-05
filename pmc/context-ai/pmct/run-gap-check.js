// Simple indexer/matcher to generate gap-report_v2-train.md from fr-checks.json
// Scans Windows absolute paths and matches glob-like patterns with ** and *.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve('C:/Users/james/Master/BrightHub/brun/train-data');
const SRC_DIR = path.join(ROOT, 'src');
const MIGRATIONS_DIR = path.join(ROOT, 'supabase', 'migrations');
const SUPABASE_FUNCS_DIR = path.join(SRC_DIR, 'supabase', 'functions');
const PMCT_DIR = path.join(ROOT, 'pmc', 'context-ai', 'pmct');
const CHECKS_PATH = path.join(PMCT_DIR, 'fr-checks.json');
const GENERATED_CHECKS_PATH = path.join(PMCT_DIR, 'fr-checks.generated.json');
const REPORT_PATH = path.join(PMCT_DIR, 'gap-report_v2-train.md');
const WIREFRAME_SRC_DIR = path.join(ROOT, 'train-wireframe', 'src');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function isIgnoredDir(p) {
  const rel = path.relative(ROOT, p).toLowerCase();
  return (
    rel.includes('node_modules') ||
    rel.startsWith('.git') ||
    rel.startsWith('.swc') ||
    rel.startsWith('archive') ||
    rel.startsWith('train-wireframe' + path.sep + 'node_modules')
  );
}

function listFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch (e) {
      continue;
    }
    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (!isIgnoredDir(full)) stack.push(full);
      } else if (ent.isFile()) {
        // Restrict to relevant extensions
        const ext = path.extname(ent.name).toLowerCase();
        if ([".ts", ".tsx", ".js", ".jsx", ".sql", ".md", ".json"].includes(ext)) {
          out.push(path.normalize(full));
        }
      }
    }
  }
  return out;
}

function escapeRegex(s) {
  return s.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
}

function globToRegExp(glob) {
  // Normalize to forward slashes to simplify regex building across platforms
  let s = String(glob).replace(/\\/g, '/');
  // Replace wildcards first, then escape regex meta, then restore replacements
  s = s.replace(/\*\*/g, '___DOUBLE___');
  s = s.replace(/\*/g, '___SINGLE___');
  s = escapeRegex(s);
  // ** followed by a slash should allow zero or more nested dirs
  s = s.replace(/___DOUBLE___\//g, '(?:.*\/)?');
  // Remaining ** -> match across directories
  s = s.replace(/___DOUBLE___/g, '.*');
  // * -> match within a segment (no forward slash)
  s = s.replace(/___SINGLE___/g, '[^/]*');
  return new RegExp('^' + s + '$', 'i');
}

function anyPathMatches(patterns, filePath) {
  const fp = path.normalize(filePath).replace(/\\/g, '/');
  return patterns.some((p) => {
    try {
      const re = globToRegExp(p);
      return re.test(fp);
    } catch (e) {
      return false;
    }
  });
}

function fileContainsAnySymbols(filePath, symbols) {
  if (!symbols || symbols.length === 0) return true; // No symbol expectations
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return symbols.some((sym) => {
      try {
        const re = new RegExp(sym, 'i');
        return re.test(data);
      } catch (e) {
        return data.toLowerCase().includes(String(sym).toLowerCase());
      }
    });
  } catch (e) {
    return false;
  }
}

function buildIndex() {
  const files = [];
  files.push(...listFiles(SRC_DIR));
  files.push(...listFiles(MIGRATIONS_DIR));
  files.push(...listFiles(SUPABASE_FUNCS_DIR));
  files.push(...listFiles(WIREFRAME_SRC_DIR));
  return files;
}

function evaluateFR(fr, allFiles) {
  const res = {
    fr_id: fr.fr_id,
    status: 'missing',
    confidence: 0,
    evidence: [],
    gaps: []
  };

  const artifacts = fr.artifacts || [];
  const requiredArtifacts = artifacts.filter(a => a.required);
  const optionalArtifacts = artifacts.filter(a => !a.required);

  let requiredMatched = 0;
  let optionalMatched = 0;
  let symbolHits = 0;
  let matchedArtifactsCount = 0;

  for (const art of artifacts) {
    const { type, path_patterns = [], symbol_patterns = [], required } = art;
    const matchedPaths = allFiles.filter(fp => anyPathMatches(path_patterns, fp));

    if (matchedPaths.length > 0) {
      matchedArtifactsCount++;
      // Check symbols within matched paths (if specified)
      let symbolFound = false;
      if (symbol_patterns && symbol_patterns.length > 0) {
        for (const mp of matchedPaths) {
          if (fileContainsAnySymbols(mp, symbol_patterns)) {
            symbolFound = true;
            symbolHits++;
            break;
          }
        }
      }
      // Record evidence
      res.evidence.push({ type, paths: matchedPaths.slice(0, 5) });
      if (required) requiredMatched++; else optionalMatched++;
    } else {
      res.gaps.push({ type, expected: path_patterns });
    }
  }

  const requiredCount = requiredArtifacts.length;
  const threshold = fr.threshold || requiredCount || 1;

  if (requiredMatched === requiredCount && matchedArtifactsCount >= threshold) {
    res.status = 'implemented';
  } else if (requiredMatched > 0 || matchedArtifactsCount >= Math.max(1, Math.floor(threshold / 2))) {
    res.status = 'partial';
  } else {
    res.status = 'missing';
  }

  // Confidence heuristic
  const requiredScore = requiredCount > 0 ? (requiredMatched / requiredCount) * 0.8 : 0;
  const optionalScore = Math.min(optionalMatched, 2) * 0.1; // cap optional influence
  const symbolScore = Math.min(symbolHits, 3) * 0.05; // small boost per symbol
  res.confidence = Math.min(1, +(requiredScore + optionalScore + symbolScore).toFixed(2));

  return res;
}

function renderReport(results, allFiles) {
  const counts = { implemented: 0, partial: 0, missing: 0 };
  for (const r of results) counts[r.status]++;
  const total = results.length || 1;
  const pct = (n) => ((n / total) * 100).toFixed(1);

  let out = '';
  out += `# Gap Report v2 — Train Data\n\n`;
  out += `## Summary\n`;
  out += `- Implemented: ${counts.implemented} (${pct(counts.implemented)}%)\n`;
  out += `- Partial: ${counts.partial} (${pct(counts.partial)}%)\n`;
  out += `- Missing: ${counts.missing} (${pct(counts.missing)}%)\n\n`;

  out += `## Per-FR Details\n`;
  for (const r of results) {
    out += `\n### ${r.fr_id}\n`;
    out += `- Status: ${r.status}\n`;
    out += `- Confidence: ${r.confidence}\n`;
    // Find FR check to print expected artifacts
    out += `- Expected Artifacts:\n`;
    const fr = checks.find(c => c.fr_id === r.fr_id);
    if (fr) {
      for (const art of fr.artifacts || []) {
        out += `  - ${art.type}: ${art.path_patterns.join(', ')}\n`;
      }
    }
    out += `- Found Evidence:\n`;
    if (r.evidence.length === 0) {
      out += `  - None\n`;
    } else {
      for (const ev of r.evidence) {
        out += `  - ${ev.type}:\n`;
        for (const p of ev.paths) out += `    - ${p}\n`;
      }
    }
    out += `- Missing:\n`;
    if (r.gaps.length === 0) {
      out += `  - None\n`;
    } else {
      for (const gap of r.gaps) {
        out += `  - ${gap.type}: expected ${gap.expected.join(', ')}\n`;
      }
    }
    out += `- Manual Review:\n`;
    if (r.fr_id === 'FR-TRAIN-USER-CONTEXT-001') {
      out += `  - Verify read/write flows scope by userId/ownerId and persist correctly.\n`;
    } else if (r.fr_id === 'FR-IMPORT-EXPORT-UI-TRIGGER-009') {
      out += `  - Confirm UI triggers exist and connect to export routes/services.\n`;
    } else if (r.fr_id === 'FR-CHUNKS-UPLOAD-002') {
      out += `  - Confirm upload UI wires to chunk-service and any chunks API route.\n`;
    } else {
      out += `  - Assess integration points and domain-appropriate usage.\n`;
    }
  }

  out += `\n## Appendix: Artifact Index Snapshot\n`;
  out += `- Files scanned: ${allFiles.length}\n`;
  out += `- Directories:\n`;
  out += `  - ${SRC_DIR}\n`;
  out += `  - ${MIGRATIONS_DIR}\n`;
  out += `  - ${SUPABASE_FUNCS_DIR}\n`;
  out += `  - ${WIREFRAME_SRC_DIR}\n`;

  return out;
}

// Main
if (!fs.existsSync(CHECKS_PATH)) {
  console.error('fr-checks.json not found at', CHECKS_PATH);
  process.exit(1);
}
const baseChecks = readJson(CHECKS_PATH).checks || [];
let generatedChecks = [];
if (fs.existsSync(GENERATED_CHECKS_PATH)) {
  try {
    generatedChecks = readJson(GENERATED_CHECKS_PATH).checks || [];
  } catch (e) {
    generatedChecks = [];
  }
}
const checks = baseChecks.concat(generatedChecks);
const allFiles = buildIndex();
const results = checks.map((fr) => evaluateFR(fr, allFiles));
const report = renderReport(results, allFiles);
fs.writeFileSync(REPORT_PATH, report, 'utf8');
console.log('Gap report written to', REPORT_PATH);