import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsDir = path.join(__dirname, 'resources', 'js', 'views');

function getRelativePath(fromFile, toDir) {
  let rel = path.relative(path.dirname(fromFile), toDir).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (!content.includes('alert(') && !content.includes('confirm(')) return;

  // Add import and toast instance if not present
  if (!content.includes('useToastStore')) {
    const storesDir = path.join(__dirname, 'resources', 'js', 'stores');
    const relPath = getRelativePath(filePath, storesDir) + '/toast';
    
    // insert import
    content = content.replace(/<script setup>/, `<script setup>\nimport { useToastStore } from '${relPath}';`);
    
    // insert const toast = useToastStore(); after imports (heuristic: find first empty line or first const)
    content = content.replace(/(import .*;\n)+/, (match) => `${match}\nconst toast = useToastStore();\n`);
  }

  // Replace alert()
  content = content.replace(/alert\((.*?)\)/g, (match, msg) => {
    const lower = msg.toLowerCase();
    let type = 'success';
    if (lower.includes('error') || lower.includes('fall')) type = 'error';
    else if (lower.includes('selecciona') || lower.includes('debes') || lower.includes('obligatorio') || lower.includes('no se puede') || lower.includes('no encontrado')) type = 'warning';
    
    return `toast.${type}(${msg})`;
  });

  // Replace confirm()
  content = content.replace(/confirm\((.*?)\)/g, 'await toast.confirm($1)');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.vue')) {
      processFile(fullPath);
    }
  }
}

traverse(viewsDir);
