import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, 'resources', 'js');

const emojiMap = {
  '✏️': 'pencil',
  '🗑️': 'trash',
  '👀': 'eye',
  '👁️': 'eye',
  '✓': 'check',
  '✅': 'check',
  '❌': 'x',
  '🚪': 'log-out',
  '🛒': 'shopping-cart',
  '💳': 'credit-card',
  '👥': 'users',
  '👤': 'user',
  '🏨': 'building',
  '📅': 'calendar',
  '📋': 'clipboard-list',
  '💰': 'circle-dollar-sign',
  '⚡': 'zap',
  '⚙️': 'settings',
};

function getIconClass(emoji) {
  // Default sizes and spacing
  let cls = 'w-5 h-5 inline-block mr-1';
  
  if (['✏️', '🗑️', '👀', '👁️'].includes(emoji)) {
    cls = 'w-4 h-4 inline-block'; // Smaller for action buttons
  } else if (['📋', '📅', '🏨', '👥', '🛒', '💳', '💰', '⚡', '⚙️'].includes(emoji)) {
    cls = 'w-6 h-6 inline-block mr-2 text-gray-700'; // Headers / Dashboard stats
  } else if (['✓', '✅', '❌', '🚪'].includes(emoji)) {
    cls = 'w-4 h-4 inline-block mr-1'; // Button icons
  } else if (['👤'].includes(emoji)) {
    cls = 'w-5 h-5 inline-block mr-2 text-gray-500'; // List icons
  }
  
  return cls;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace each emoji
  for (const [emoji, iconName] of Object.entries(emojiMap)) {
    const regex = new RegExp(emoji, 'g');
    if (regex.test(content)) {
      const cls = getIconClass(emoji);
      content = content.replace(regex, `<Icon name="${iconName}" class="${cls}" />`);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated emojis in ${filePath}`);
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

traverse(srcDir);
