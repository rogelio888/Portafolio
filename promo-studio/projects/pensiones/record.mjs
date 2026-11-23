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
  // ESCENA 1: Portal de Consulta de Padres
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 1] Portal de Consulta de Padres...');
  // Esperar a que la página cargue el input del código
  await page.waitForSelector('#codigo', { state: 'visible', timeout: 7000 });
  await page.waitForTimeout(400);

  const scene1StartWall = Date.now();
  const scene1StartOffsetSec = (scene1StartWall - sessionStartTime) / 1000;
  const scene1TargetSec = durationsData['scene_01'].visualDuration;

  // Recorrer el encabezado del sistema durante la presentación inicial
  await smoothMove(page, currentPos, 683, 160, 20);
  await page.waitForTimeout(1400);

  // Escribir código de estudiante CC-2026-002 (Ana Pérez López)
  await smoothType(page, currentPos, '#codigo', 'CC-2026-002', { waitAfter: 400 });

  // Clic en Consultar Historial
  await smoothClick(page, currentPos, 'button:has-text("Consultar Historial")', { waitAfter: 900 });

  // Esperar a que aparezcan los resultados de la consulta
  await page.waitForSelector('h3:has-text("Ana"), h3:has-text("Pérez")', { state: 'visible', timeout: 5000 });

  // Recorrer con el cursor la información del estudiante
  await smoothMove(page, currentPos, 450, 310, 22);
  await page.waitForTimeout(700);

  // Ver recibo de la cuota pagada
  const verReciboBtn = await page.waitForSelector('button:has-text("Ver Recibo")', { state: 'visible', timeout: 3000 });
  await verReciboBtn.scrollIntoViewIfNeeded();
  await smoothClick(page, currentPos, 'button:has-text("Ver Recibo")', { waitAfter: 1200 });

  // Esperar y contemplar comprobante de pago
  await page.waitForSelector('h3:has-text("Comprobante de Pago")', { state: 'visible', timeout: 3000 });
  await page.waitForTimeout(1400);

  // Cerrar modal de comprobante
  await smoothClick(page, currentPos, '.bg-slate-100 button:has(svg)', { waitAfter: 600 });

  // Seleccionar la cuota pendiente con el checkbox activo
  await smoothClick(page, currentPos, 'input[type="checkbox"]:not([disabled])', { waitAfter: 700 });

  // Hover suave en el total acumulado a pagar
  await smoothMove(page, currentPos, 683, 620, 20);
  await page.waitForTimeout(800);

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
  // ESCENA 2: Acceso Administrativo y Control de Estudiantes
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 2] Panel Administrativo y Estudiantes...');
  const scene2StartWall = Date.now();
  const scene2StartOffsetSec = (scene2StartWall - sessionStartTime) / 1000;
  const scene2TargetSec = durationsData['scene_02'].visualDuration;

  // Ir a Login Administrativo (enlace superior derecho)
  await smoothClick(page, currentPos, 'a:has-text("Ingreso Administrativo")', { waitAfter: 700 });

  // Autocompletar credenciales de Directora
  await page.waitForSelector('button:has-text("Directora")', { state: 'visible', timeout: 4000 });
  await smoothClick(page, currentPos, 'button:has-text("Directora")', { waitAfter: 500 });

  // Enviar formulario de login
  await smoothClick(page, currentPos, 'button[type="submit"]:has-text("Ingresar al Sistema")', { waitAfter: 1200 });

  // Esperar a que cargue el Resumen Financiero
  await page.waitForSelector('h3:has-text("Bs.")', { state: 'visible', timeout: 5000 });

  // Hover en métricas financieras
  await smoothMove(page, currentPos, 360, 180, 22);
  await page.waitForTimeout(800);
  await smoothMove(page, currentPos, 680, 180, 22);
  await page.waitForTimeout(800);
  await smoothMove(page, currentPos, 1000, 180, 22);
  await page.waitForTimeout(800);

  // Scroll suave para ver la gráfica de recaudación
  await page.evaluate(() => window.scrollBy({ top: 160, behavior: 'smooth' }));
  await page.waitForTimeout(900);

  // Navegar a Estudiantes y Cursos por el menú lateral
  await smoothClick(page, currentPos, 'a[href*="estudiantes"], a:has-text("Estudiantes y Cursos")', { waitAfter: 1000 });

  // Esperar tabla de estudiantes
  await page.waitForSelector('table tbody tr', { state: 'visible', timeout: 4000 });
  await smoothMove(page, currentPos, 683, 350, 20);
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

  // ------------------------------------------------------------------
  // ESCENA 3: Módulo de Caja y Facturación
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 3] Caja y Facturación en Ventanilla...');
  const scene3StartWall = Date.now();
  const scene3StartOffsetSec = (scene3StartWall - sessionStartTime) / 1000;
  const scene3TargetSec = durationsData['scene_03'].visualDuration;

  // Ir a Registro de Pagos (Caja) en el sidebar
  await smoothClick(page, currentPos, 'a[href*="caja"], a:has-text("Registro de Pagos")', { waitAfter: 800 });

  // Buscar estudiante por código (Luis Quispe Flores CC-2026-003)
  await page.waitForSelector('input[placeholder*="Buscar por Nombre"]', { state: 'visible', timeout: 4000 });
  await smoothType(page, currentPos, 'input[placeholder*="Buscar por Nombre"]', 'CC-2026-003', { waitAfter: 300 });

  // Clic en botón de búsqueda de la caja
  const searchBtn = await page.$('.w-full.md\\:w-96 button.bg-secondary');
  if (searchBtn) {
    await smoothClick(page, currentPos, '.w-full.md\\:w-96 button.bg-secondary', { waitAfter: 600 });
  } else {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
  }

  // Si se abre el dropdown de sugerencias, hacer clic en Luis
  const dropdownItem = await page.$('.bg-white.shadow-lg li, ul li:has-text("Quispe")');
  if (dropdownItem) {
    await smoothClick(page, currentPos, 'ul li:has-text("Quispe")', { waitAfter: 500 });
  }

  // Esperar a que se seleccione el estudiante y se despliegue su estado de cuenta
  await page.waitForSelector('h3:has-text("Quispe"), h3:has-text("Luis")', { state: 'visible', timeout: 5000 });

  // Seleccionar la primera cuota en mora / pendiente que no esté pagada
  await smoothClick(page, currentPos, 'tbody tr input[type="checkbox"]:not([disabled])', { waitAfter: 600 });

  // Clic en Procesar Pago en el panel lateral derecho
  await smoothClick(page, currentPos, 'button:has-text("Procesar Pago")', { waitAfter: 700 });

  // Esperar modal de Completar Transacción
  await page.waitForSelector('h3:has-text("Completar Transacción")', { state: 'visible', timeout: 4000 });
  await page.waitForTimeout(600);

  // Ingresar monto recibido en efectivo (300 Bs) para mostrar el cambio automático
  await smoothType(page, currentPos, 'input[type="number"]', '300', { waitAfter: 400 });

  // Clic en Confirmar y Emitir Recibo
  await smoothClick(page, currentPos, 'button:has-text("Confirmar y Emitir Recibo")', { waitAfter: 800 });

  // Esperar modal de ¡Pago Exitoso! con el recibo generado
  await page.waitForSelector('h2:has-text("¡Pago Exitoso!")', { state: 'visible', timeout: 4000 });
  await page.waitForTimeout(1600);

  // Cerrar modal de recibo con botón Finalizar
  await smoothClick(page, currentPos, 'button:has-text("Finalizar")', { waitAfter: 700 });
  await page.waitForSelector('h2:has-text("¡Pago Exitoso!")', { state: 'hidden', timeout: 3000 });

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
  // ESCENA 4: Control de Morosidad y Auditoría
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 4] Control de Morosidad y Auditoría...');
  const scene4StartWall = Date.now();
  const scene4StartOffsetSec = (scene4StartWall - sessionStartTime) / 1000;
  const scene4TargetSec = durationsData['scene_04'].visualDuration;

  // Ir a Control de Morosidad en el sidebar
  await smoothClick(page, currentPos, 'a[href*="morosos"], a:has-text("Control de Morosidad")', { waitAfter: 800 });

  // Esperar lista de morosos
  await page.waitForSelector('table tbody tr', { state: 'visible', timeout: 4000 });

  // Hover en indicadores de morosidad
  await smoothMove(page, currentPos, 350, 170, 20);
  await page.waitForTimeout(800);
  await smoothMove(page, currentPos, 680, 170, 20);
  await page.waitForTimeout(800);

  // Abrir detalle del primer estudiante moroso
  await smoothClick(page, currentPos, 'tbody tr:first-child button:has-text("Ver Detalle")', { waitAfter: 700 });

  // Esperar modal de Detalle de Deuda
  await page.waitForSelector('p:has-text("Tutor Responsable"), div:has-text("Detalle")', { state: 'visible', timeout: 4000 });
  await page.waitForTimeout(1500);

  // Cerrar modal de detalles con botón Cerrar
  await smoothClick(page, currentPos, '.bg-white.border-t button:has-text("Cerrar")', { waitAfter: 600 });

  // Movimiento sutil por la tabla consolidada
  await smoothMove(page, currentPos, 683, 380, 20);

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
