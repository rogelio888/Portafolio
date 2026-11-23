export async function recordSession({
  page,
  currentPos,
  durationsData,
  sessionStartTime,
  smoothClick,
  smoothMove,
  smoothType,
  playbackRate = 1.2,
}) {
  const sceneSlices = [];

  // ==================================================================
  // ESCENA 1: El Problema + Tienda Pública y Combos (~10s)
  // "Preparar perfumes al ojo te hace regalar esencia y perder ganancia en cada frasco. Mira cómo tus clientes arman sus combos desde el celular en segundos."
  // ==================================================================
  console.log('\n[Grabando Escena 1] Tienda Pública & Combos de Fragancias...');
  await page.waitForSelector('header', { state: 'visible', timeout: 7000 });
  await page.waitForTimeout(400);

  const scene1StartWall = Date.now();
  const scene1StartOffsetSec = (scene1StartWall - sessionStartTime) / 1000;
  const scene1TargetSec = durationsData['scene_01'].visualDuration * playbackRate;

  // 1. Hover sobre hero de L'ATELIER
  await smoothMove(page, currentPos, 600, 320, 18);
  await page.waitForTimeout(600);

  // 2. Scroll suave hacia el catálogo
  await page.evaluate(() => {
    const el = document.getElementById('catalogo');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollBy({ top: 600, behavior: 'smooth' });
  });
  await page.waitForTimeout(700);

  // 3. Clic en filtro Unisex
  const btnUnisex = page.locator('button:has-text("Unisex")').first();
  if (await btnUnisex.isVisible().catch(() => false)) {
    await smoothClick(page, currentPos, 'button:has-text("Unisex")', { waitAfter: 600 });
  }

  // 4. Hover sobre la primera tarjeta de perfume
  await smoothMove(page, currentPos, 400, 560, 16);
  await page.waitForTimeout(500);

  // 5. Clic para ver detalles y notas olfativas
  const cardPerfume = page.locator('div:has-text("30% Parfum")').first();
  if (await cardPerfume.isVisible().catch(() => false)) {
    await smoothClick(page, currentPos, 'div:has-text("30% Parfum")', { waitAfter: 900 });
    
    // Cerrar modal de notas olfativas
    const btnCerrar = page.locator('button:has(svg.lucide-x)').first();
    if (await btnCerrar.isVisible().catch(() => false)) {
      await smoothClick(page, currentPos, 'button:has(svg.lucide-x)', { waitAfter: 500 });
    }
  }

  // 6. Scroll a sección de Colecciones & Combos
  await page.evaluate(() => {
    const el = document.getElementById('combos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollBy({ top: 900, behavior: 'smooth' });
  });
  await page.waitForTimeout(800);

  // 7. Clic en botón de Colección dentro de la sección combos
  const btnComboCard = page.locator('#combos button:has-text("Colección"), #combos button:has-text("50ml")').first();
  if (await btnComboCard.isVisible().catch(() => false)) {
    await smoothClick(page, currentPos, '#combos button:has-text("Colección"), #combos button:has-text("50ml")', { waitAfter: 600 });
  }

  // 8. Clic en "Agregar Colección al Pedido" para abrir el Drawer
  const btnAgregar = page.locator('button:has-text("Agregar Colección al Pedido")').first();
  if (await btnAgregar.isVisible().catch(() => false)) {
    await smoothClick(page, currentPos, 'button:has-text("Agregar Colección al Pedido")', { waitAfter: 800 });
  }

  // Completar tiempo exacto de Escena 1
  const elapsed1 = Date.now() - scene1StartWall;
  if (elapsed1 < scene1TargetSec * 1000) {
    await page.waitForTimeout(scene1TargetSec * 1000 - elapsed1);
  }
  sceneSlices.push({
    id: 'scene_01',
    startOffsetSec: scene1StartOffsetSec,
    durationSec: scene1TargetSec,
  });

  // ==================================================================
  // ESCENA 2: Generación Real del Ticket QR (~7s)
  // "El sistema genera al instante un ticket con código QR listo para pasar por tienda o pedir por delivery sin hacer fila."
  // ==================================================================
  console.log('\n[Grabando Escena 2] Generación de Ticket QR Instantáneo...');
  const scene2StartWall = Date.now();
  const scene2StartOffsetSec = (scene2StartWall - sessionStartTime) / 1000;
  const scene2TargetSec = durationsData['scene_02'].visualDuration * playbackRate;

  // 1. Escribir nombre del cliente
  const inputNombre = page.locator('input[placeholder*="Juan Pérez"]').first();
  if (await inputNombre.isVisible().catch(() => false)) {
    await smoothType(page, currentPos, 'input[placeholder*="Juan Pérez"]', 'Carlos Mendoza', { waitAfter: 300 });
  }

  // 2. Escribir WhatsApp del cliente
  const inputTel = page.locator('input[placeholder*="71234567"]').first();
  if (await inputTel.isVisible().catch(() => false)) {
    await smoothType(page, currentPos, 'input[placeholder*="71234567"]', '70044556', { waitAfter: 400 });
  }

  // 3. Clic en "Generar Ticket de Retiro (PDF + QR)"
  await smoothClick(page, currentPos, 'button:has-text("Generar Ticket de Retiro")', { waitAfter: 1200 });

  // 4. Esperar y resaltar el modal del ticket generado
  await page.waitForSelector('text=ORD-', { state: 'visible', timeout: 7000 });
  await smoothMove(page, currentPos, 600, 600, 20);
  await page.waitForTimeout(800);

  // 5. Scroll suave dentro del ticket para ver desglose y validez 24h
  await page.evaluate(() => {
    const modal = document.querySelector('.overflow-y-auto') || window;
    modal.scrollBy({ top: 240, behavior: 'smooth' });
  });
  await page.waitForTimeout(900);

  // Completar tiempo exacto de Escena 2
  const elapsed2 = Date.now() - scene2StartWall;
  if (elapsed2 < scene2TargetSec * 1000) {
    await page.waitForTimeout(scene2TargetSec * 1000 - elapsed2);
  }
  sceneSlices.push({
    id: 'scene_02',
    startOffsetSec: scene2StartOffsetSec,
    durationSec: scene2TargetSec,
  });

  // ==================================================================
  // ESCENA 3: Laboratorio / Dosificación Exacta en Mostrador (~10s)
  // "En mostrador escaneas el código y ves la medida exacta en mililitros, descontando automáticamente tus tanques de esencia para cero desperdicios."
  // ==================================================================
  console.log('\n[Grabando Escena 3] Laboratorio de Formulación en Mostrador...');
  // Navegar al acceso administrativo
  await page.goto('http://127.0.0.1:3000/admin/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const scene3StartWall = Date.now();
  const scene3StartOffsetSec = (scene3StartWall - sessionStartTime) / 1000;
  const scene3TargetSec = durationsData['scene_03'].visualDuration * playbackRate;

  // 1. Clic en botón de acceso rápido Admin (1-clic)
  await smoothClick(page, currentPos, 'button:has-text("Admin")', { waitAfter: 1500 });

  // 2. Esperar carga de la consola
  await page.waitForURL('**/admin', { timeout: 10000 });
  await page.waitForTimeout(1000);

  // 3. Clic en la pestaña Tickets & Mostrador
  await smoothClick(page, currentPos, 'button:has-text("Tickets & Mostrador")', { waitAfter: 1200 });

  // 4. Mostrar tanques de materia prima (Alcohol, Fijador, Feromonas)
  await smoothMove(page, currentPos, 420, 260, 18);
  await page.waitForTimeout(600);
  await smoothMove(page, currentPos, 780, 260, 18);
  await page.waitForTimeout(600);

  // 5. Clic en "Formular en Mostrador" del ticket en cola
  const btnFormular = page.locator('button:has-text("Formular en Mostrador")').first();
  if (await btnFormular.isVisible({ timeout: 6000 }).catch(() => false)) {
    await smoothClick(page, currentPos, 'button:has-text("Formular en Mostrador")', { waitAfter: 1200 });
  }

  // 6. Modal de Formulación abierto: Recorrer fórmula milimétrica
  await page.waitForSelector('text=Esencia Pura', { timeout: 6000 });
  await smoothMove(page, currentPos, 350, 520, 18);
  await page.waitForTimeout(600);
  await smoothMove(page, currentPos, 820, 520, 18);
  await page.waitForTimeout(600);

  // 7. Marcar Frascos como Preparados & Sellados
  for (let f = 0; f < 4; f++) {
    const btnMarcar = page.locator('button:has-text("Marcar Frasco")').first();
    if (await btnMarcar.isVisible({ timeout: 1500 }).catch(() => false)) {
      await smoothClick(page, currentPos, 'button:has-text("Marcar Frasco")', { waitAfter: 600 });
    } else {
      break;
    }
  }

  // 8. Clic en Formulación Finalizada (Deducción automática de stock)
  const btnFinalizar = page.locator('button:has-text("Formulación Finalizada")').first();
  if (await btnFinalizar.isVisible({ timeout: 3000 }).catch(() => false)) {
    await smoothClick(page, currentPos, 'button:has-text("Formulación Finalizada")', { waitAfter: 900 });
  } else {
    const btnCerrarModal = page.locator('button:has-text("Cerrar sin Guardar")').first();
    if (await btnCerrarModal.isVisible({ timeout: 1500 }).catch(() => false)) {
      await smoothClick(page, currentPos, 'button:has-text("Cerrar sin Guardar")', { waitAfter: 500 });
    }
  }

  // Garantizar cierre de cualquier overlay antes del Dashboard
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);

  // Completar tiempo exacto de Escena 3
  const elapsed3 = Date.now() - scene3StartWall;
  if (elapsed3 < scene3TargetSec * 1000) {
    await page.waitForTimeout(scene3TargetSec * 1000 - elapsed3);
  }
  sceneSlices.push({
    id: 'scene_03',
    startOffsetSec: scene3StartOffsetSec,
    durationSec: scene3TargetSec,
  });

  // ==================================================================
  // ESCENA 4: Control Multisucursal (~7s)
  // "Controla todas tus sucursales desde un solo lugar. Escríbeme al WhatsApp y te paso una prueba demo hoy mismo."
  // ==================================================================
  console.log('\n[Grabando Escena 4] Dashboard y Control Multisucursal...');
  const scene4StartWall = Date.now();
  const scene4StartOffsetSec = (scene4StartWall - sessionStartTime) / 1000;
  const scene4TargetSec = durationsData['scene_04'].visualDuration * playbackRate;

  // 1. Clic en pestaña Dashboard
  const btnDash = page.locator('button:has-text("Dashboard")').first();
  if (await btnDash.isVisible().catch(() => false)) {
    await smoothClick(page, currentPos, 'button:has-text("Dashboard")', { waitAfter: 1000 });
  }

  // 2. Recorrer métricas y selectores de sucursal
  await smoothMove(page, currentPos, 380, 240, 18);
  await page.waitForTimeout(700);
  await smoothMove(page, currentPos, 820, 240, 18);
  await page.waitForTimeout(700);

  // 3. Scroll suave para mostrar estantería de sedes (Equipetrol, Las Brisas, Urubó)
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // Completar tiempo exacto de Escena 4
  const elapsed4 = Date.now() - scene4StartWall;
  if (elapsed4 < scene4TargetSec * 1000) {
    await page.waitForTimeout(scene4TargetSec * 1000 - elapsed4);
  }
  sceneSlices.push({
    id: 'scene_04',
    startOffsetSec: scene4StartOffsetSec,
    durationSec: scene4TargetSec,
  });

  return sceneSlices;
}
