const fs = require('fs');
const { spawnSync } = require('child_process');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function checkFileSyntax(filePath) {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(`../${filePath}`);
}

function checkEmbeddedScript() {
  const html = fs.readFileSync('index.html', 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>/);

  assert(match, 'Embedded browser script not found in index.html');
  // eslint-disable-next-line no-new-func
  new Function(match[1]);
}

function checkModuleSyntax(filePath) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    encoding: 'utf8'
  });

  assert(result.status === 0, result.stderr || result.stdout || `Syntax check failed for ${filePath}`);
}

try {
  checkFileSyntax('api/submit-property.js');
  checkModuleSyntax('worker.mjs');
  checkEmbeddedScript();
  console.log('Lint checks passed.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
