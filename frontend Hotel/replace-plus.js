import fs from 'fs';
import path from 'path';

const files = [
  'resources/js/views/servicios/Index.vue',
  'resources/js/views/reservas/Index.vue',
  'resources/js/views/pisos/Index.vue',
  'resources/js/views/huespedes/Index.vue',
  'resources/js/views/hoteles/Index.vue',
  'resources/js/views/habitaciones/Index.vue',
  'resources/js/views/empleados/Index.vue'
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/➕/g, '<Icon name="plus" class="w-4 h-4 inline-block mr-1" />');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Replaced in ${file}`);
  }
});
