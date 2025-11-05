const path = require('path');

function escapeRegex(s) {
  return s.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
}

function globToRegExp(glob) {
  let s = String(glob).replace(/\\/g, '/');
  s = s.replace(/\*\*/g, '___DOUBLE___');
  s = s.replace(/\*/g, '___SINGLE___');
  s = escapeRegex(s);
  s = s.replace(/___DOUBLE___\//g, '(?:.*\/)?');
  s = s.replace(/___DOUBLE___/g, '.*');
  s = s.replace(/___SINGLE___/g, '[^/]*');
  return new RegExp('^' + s + '$', 'i');
}

const pattern = 'C:/Users/james/Master/BrightHub/brun/train-data/src/components/upload/**/*.ts*';
const fp = path.normalize('C:/Users/james/Master/BrightHub/brun/train-data/src/components/upload/upload-dropzone.tsx').replace(/\\/g, '/');

const re = globToRegExp(pattern);
console.log('regex:', re);
console.log('fp:', fp);
console.log('test:', re.test(fp));