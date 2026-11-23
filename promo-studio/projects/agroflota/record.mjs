export async function recordSession({
  page,
  currentPos,
  durationsData,
  sessionStartTime,
  smoothClick,
  smoothMove,
  smoothType,
}) {
  const sceneSlices = [];

  // ------------------------------------------------------------------
  // ESCENA 1: Acceso y Telemetría de la Flota
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 1] Acceso y Telemetría de la Flota...');
  // Esperar botón de acceso rápido Administrador
  await page.waitForSelector('button:has-text("Administrador")', { state: 'visible', timeout: 7000 });
  await page.waitForTimeout(400);

  const scene1StartWall = Date.now();
  const scene1StartOffsetSec = (scene1StartWall - sessionStartTime) / 1000;
  const scene1TargetSec = durationsData['scene_01'].visualDuration;

  // Presentación inicial en pantalla de acceso
  await smoothMove(page, currentPos, 683, 260, 20);
  await page.waitForTimeout(1400);

  // Clic en Administrador para autocompletar credenciales
  await smoothClick(page, currentPos, 'button:has-text("Administrador")', { waitAfter: 500 });

  // Iniciar Sesión
  await smoothClick(page, currentPos, 'button[type="submit"]:has-text("Iniciar Sesión")', { waitAfter: 1200 });

  // Esperar a que cargue el Panel de Control
  await page.waitForSelector('h1:has-text("Panel de Control")', { state: 'visible', timeout: 5000 });

  // Recorrer los 4 KPIs superiores
  await smoothMove(page, currentPos, 220, 180, 20);
  await page.waitForTimeout(800);
  await smoothMove(page, currentPos, 480, 180, 20);
  await page.waitForTimeout(800);
  await smoothMove(page, currentPos, 740, 180, 20);
  await page.waitForTimeout(800);
  await smoothMove(page, currentPos, 1000, 180, 20);
  await page.waitForTimeout(800);

  // Scroll suave para mostrar alertas de servicios preventivos
  await page.evaluate(() => window.scrollBy({ top: 160, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

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

  // ------------------------------------------------------------------
  // ESCENA 2: Mantenimiento Preventivo por Horómetro
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 2] Mantenimiento Preventivo por Horómetro...');
  const scene2StartWall = Date.now();
  const scene2StartOffsetSec = (scene2StartWall - sessionStartTime) / 1000;
  const scene2TargetSec = durationsData['scene_02'].visualDuration;

  // Navegar a Planes Preventivos por el menú lateral
  await smoothClick(page, currentPos, 'a[href*="mantenimiento-preventivo"], a:has-text("Planes Preventivos")', { waitAfter: 900 });

  // Esperar a que cargue la tabla de alertas
  await page.waitForSelector('table tbody tr', { state: 'visible', timeout: 5000 });

  // Recorrer los contadores del semáforo
  await smoothMove(page, currentPos, 350, 170, 20);
  await page.waitForTimeout(700);
  await smoothMove(page, currentPos, 620, 170, 20);
  await page.waitForTimeout(700);

  // Clic en Programar OT en la primera fila con alerta roja (TRAC-001)
  await smoothClick(page, currentPos, 'tbody tr:first-child button:has-text("Programar OT")', { waitAfter: 800 });

  // Esperar modal de Programar Orden de Trabajo
  await page.waitForSelector('h3:has-text("Programar Orden de Trabajo")', { state: 'visible', timeout: 4000 });
  await page.waitForTimeout(500);

  // Seleccionar taller mecánico
  await page.selectOption('form select', { index: 1 });
  await page.waitForTimeout(400);

  // Fecha programada
  await page.fill('input[type="date"]', '2026-11-20');
  await page.waitForTimeout(300);

  // Presupuesto estimado
  await smoothType(page, currentPos, 'input[placeholder*="150"]', '1850', { waitAfter: 400 });

  // Emitir Orden
  await smoothClick(page, currentPos, 'button[type="submit"]:has-text("Emitir Orden")', { waitAfter: 900 });

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

  // ------------------------------------------------------------------
  // ESCENA 3: Control Integral de Órdenes de Trabajo
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 3] Control de Órdenes de Trabajo...');
  const scene3StartWall = Date.now();
  const scene3StartOffsetSec = (scene3StartWall - sessionStartTime) / 1000;
  const scene3TargetSec = durationsData['scene_03'].visualDuration;

  // Navegar a Órdenes de Trabajo en el menú lateral
  await smoothClick(page, currentPos, 'a[href*="ordenes-trabajo"], a:has-text("Órdenes de Trabajo")', { waitAfter: 900 });

  // Esperar lista de OTs
  await page.waitForSelector('table tbody tr', { state: 'visible', timeout: 5000 });

  // Clic en Nueva Orden de Trabajo
  await smoothClick(page, currentPos, 'button:has-text("Nueva Orden de Trabajo")', { waitAfter: 800 });

  // Esperar modal de Crear Orden de Trabajo
  await page.waitForSelector('h3:has-text("Crear Orden de Trabajo")', { state: 'visible', timeout: 4000 });
  await page.waitForTimeout(400);

  // Seleccionar maquinaria (Case IH 8120 - COSE-001)
  await page.locator('div:has(> label:has-text("Maquinaria")) select').selectOption({ index: 2 });
  await page.waitForTimeout(400);

  // Seleccionar taller o mecánico
  await page.locator('div:has(> label:has-text("Mecánico")) select').selectOption({ index: 1 });
  await page.waitForTimeout(400);

  // Escribir síntomas y tareas
  await smoothType(page, currentPos, 'textarea', 'Mantenimiento hidráulico mayor y reemplazo de mangueras de alta presión', { waitAfter: 350 });

  // Ingresar costo de mano de obra
  const laborInput = await page.waitForSelector('input[placeholder="0"]:first-of-type');
  await laborInput.fill('1500');
  await laborInput.dispatchEvent('input');
  await page.waitForTimeout(300);

  // Ingresar costo de repuestos
  const partsInput = await page.waitForSelector('div:has(> label:has-text("Repuestos")) input');
  await partsInput.fill('2800');
  await partsInput.dispatchEvent('input');
  await page.waitForTimeout(600);

  // Desplazar cursor sobre el total consolidado (Bs 4300)
  await smoothMove(page, currentPos, 683, 560, 20);
  await page.waitForTimeout(800);

  // Clic en Emitir Orden
  await smoothClick(page, currentPos, 'button[type="submit"]:has-text("Emitir Orden")', { waitAfter: 900 });

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

  // ------------------------------------------------------------------
  // ESCENA 4: Reportes Financieros y Costo por Maquinaria
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 4] Reportes Financieros y Costos...');
  const scene4StartWall = Date.now();
  const scene4StartOffsetSec = (scene4StartWall - sessionStartTime) / 1000;
  const scene4TargetSec = durationsData['scene_04'].visualDuration;

  // Navegar a Reporte de Gasto en el menú lateral
  await smoothClick(page, currentPos, 'a[href*="reporte-gasto"], a:has-text("Reporte de Gasto")', { waitAfter: 900 });

  // Esperar a que cargue la vista de Reporte de Gastos
  await page.waitForSelector('h1:has-text("Reporte de Gastos por Equipo")', { state: 'visible', timeout: 5000 });

  // Recorrer los indicadores acumulados de gasto
  await smoothMove(page, currentPos, 220, 180, 20);
  await page.waitForTimeout(800);
  await smoothMove(page, currentPos, 480, 180, 20);
  await page.waitForTimeout(800);
  await smoothMove(page, currentPos, 740, 180, 20);
  await page.waitForTimeout(800);

  // Scroll suave para contemplar la gráfica SVG comparativa por maquinaria
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // Hover sutil sobre la gráfica de barras
  await smoothMove(page, currentPos, 450, 420, 22);
  await page.waitForTimeout(900);

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
