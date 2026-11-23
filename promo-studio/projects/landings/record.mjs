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
  // ESCENA 1: Diseño Editorial y Portafolio de Autor (landing-page)
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 1] Diseño Editorial y Portafolio de Autor...');
  // Esperar a que el Hero de Cuervo Tattoo Studio esté listo
  await page.waitForSelector('h1:has-text("ARTE VIVO GRABADO")', { state: 'visible', timeout: 7000 });
  await page.waitForTimeout(400);

  const scene1StartWall = Date.now();
  const scene1StartOffsetSec = (scene1StartWall - sessionStartTime) / 1000;
  const scene1TargetSec = durationsData['scene_01'].visualDuration;

  // Recorrer el título del Hero y el badge de residencia
  await smoothMove(page, currentPos, 683, 220, 20);
  await page.waitForTimeout(600);
  await smoothMove(page, currentPos, 683, 350, 20);
  await page.waitForTimeout(600);

  // Clic en Explorar Galería para scroll suave
  await smoothClick(page, currentPos, 'a:has-text("EXPLORAR GALERÍA")', { waitAfter: 900 });

  // Esperar galería
  await page.waitForSelector('#galeria', { state: 'visible', timeout: 5000 });

  // Filtrar categorías interactivas
  await smoothClick(page, currentPos, 'button:has-text("Línea Fina")', { waitAfter: 700 });
  await smoothClick(page, currentPos, 'button:has-text("Realismo Oscuro")', { waitAfter: 700 });
  await smoothClick(page, currentPos, 'button:has-text("Micro-Realismo")', { waitAfter: 700 });
  await smoothClick(page, currentPos, 'button:has-text("Todos")', { waitAfter: 700 });

  // Clic en la tarjeta de Astrolabio para abrir el modal de detalle
  await smoothClick(page, currentPos, 'h3:has-text("Astrolabio")', { waitAfter: 800 });
  await page.waitForSelector('button:has-text("SOLICITAR ESTE ESTILO")', { state: 'visible', timeout: 4000 });

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
  // ESCENA 2: Embudo de Reserva y Cotización Dinámica (BookingModal)
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 2] Embudo de Reserva y Cotización Dinámica...');
  const scene2StartWall = Date.now();
  const scene2StartOffsetSec = (scene2StartWall - sessionStartTime) / 1000;
  const scene2TargetSec = durationsData['scene_02'].visualDuration;

  // Clic en SOLICITAR ESTE ESTILO para abrir el BookingModal
  await smoothClick(page, currentPos, 'button:has-text("SOLICITAR ESTE ESTILO")', { waitAfter: 800 });
  await page.waitForSelector('h3:has-text("CUERVO TATTOO")', { state: 'visible', timeout: 4000 });

  // Paso 1: Estilo y Ubicación Anatómica
  await smoothClick(page, currentPos, 'button:has-text("Línea Fina y Micro-Realismo")', { waitAfter: 400 });
  await smoothClick(page, currentPos, 'button:has-text("Antebrazo / Brazo")', { waitAfter: 400 });
  await smoothClick(page, currentPos, 'button:has-text("Continuar a Selección de Artista")', { waitAfter: 600 });

  // Paso 2: Artista Residente y Dimensión
  await smoothClick(page, currentPos, 'button:has-text("Elena Vance")', { waitAfter: 400 });
  await smoothClick(page, currentPos, 'button:has-text("Mediano (5-10 cm)")', { waitAfter: 400 });
  await smoothClick(page, currentPos, 'button:has-text("Continuar a Datos de Contacto")', { waitAfter: 600 });

  // Paso 3: Datos de Contacto y Resumen
  await smoothType(page, currentPos, 'input[placeholder*="Carlos Mendoza"]', 'Carlos Mendoza', { waitAfter: 300 });
  await smoothType(page, currentPos, 'input[placeholder*="carlos@ejemplo.com"]', 'carlos@ejemplo.com', { waitAfter: 300 });
  await smoothType(page, currentPos, 'textarea', 'Composición astronómica en antebrazo', { waitAfter: 500 });

  // Recorrer la tarjeta de resumen consolidada
  await smoothMove(page, currentPos, 683, 560, 20);
  await page.waitForTimeout(600);

  // Mover cursor sobre el botón de WhatsApp
  await smoothMove(page, currentPos, 760, 640, 20);
  await page.waitForTimeout(600);

  // Cerrar el modal limpiamente
  await smoothClick(page, currentPos, '.liquid-glass-strong .border-b button', { waitAfter: 600 });

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
  // TRANSICIÓN FLUIDA A CHRONOS (SIN PANTALLAS EN BLANCO)
  // ------------------------------------------------------------------
  console.log('\n[Cargando Chronos en segundo plano...]');
  await page.goto('http://127.0.0.1:3000/landing-chronos/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('h1:has-text("EL FIN DE LA LATENCIA")', { state: 'visible', timeout: 6000 });
  await page.waitForTimeout(400);

  // ------------------------------------------------------------------
  // ESCENA 3: Experiencia Inmersiva Futurista (Chronos Monitor)
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 3] Experiencia Inmersiva Futurista (Chronos)...');
  const scene3StartWall = Date.now();
  const scene3StartOffsetSec = (scene3StartWall - sessionStartTime) / 1000;
  const scene3TargetSec = durationsData['scene_03'].visualDuration;

  // Recorrer el Hero de Chronos
  await smoothMove(page, currentPos, 400, 320, 20);
  await page.waitForTimeout(500);

  // Clic en la navegación inferior para ir a 03 MONITOR
  await smoothClick(page, currentPos, 'a[href="#monitor"]', { waitAfter: 900 });

  // Esperar a que la consola de monitoreo esté visible
  await page.waitForSelector('text=Lectura del flujo cortical.', { state: 'visible', timeout: 5000 });

  // Probar interactividad de la consola neural: RITMO DELTA
  await smoothClick(page, currentPos, 'text=RITMO DELTA', { waitAfter: 1000 });

  // RITMO BETA
  await smoothClick(page, currentPos, 'text=RITMO BETA', { waitAfter: 1000 });

  // RITMO ALFA
  await smoothClick(page, currentPos, 'text=RITMO ALFA', { waitAfter: 1000 });

  // Recorrer las métricas de monitoreo en vivo (Enfoque, Relajación, Carga, Pulso)
  await smoothMove(page, currentPos, 620, 520, 20);
  await page.waitForTimeout(600);
  await smoothMove(page, currentPos, 760, 520, 20);
  await page.waitForTimeout(600);

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
  // ESCENA 4: Ingeniería de Software y Dirección de Arte (Reserva & Cierre)
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 4] Ingeniería de Software y Dirección de Arte...');
  const scene4StartWall = Date.now();
  const scene4StartOffsetSec = (scene4StartWall - sessionStartTime) / 1000;
  const scene4TargetSec = durationsData['scene_04'].visualDuration;

  // Clic en navegación inferior para ir a 04 RESERVA
  await smoothClick(page, currentPos, 'a[href="#reserva"]', { waitAfter: 900 });

  // Esperar formulario de reserva
  await page.waitForSelector('input[placeholder*="Escribe tu nombre"]', { state: 'visible', timeout: 5000 });

  // Llenar formulario de acceso beta
  await smoothType(page, currentPos, 'input[placeholder*="Escribe tu nombre"]', 'Carlos Mendoza', { waitAfter: 400 });
  await smoothType(page, currentPos, 'input[placeholder*="nombre@ejemplo.com"]', 'carlos@ejemplo.com', { waitAfter: 500 });

  // Mover cursor sobre el botón de Confirmar Acceso Beta
  await smoothMove(page, currentPos, 683, 460, 20);
  await page.waitForTimeout(800);

  // Mantener encuadre limpio hacia la transición a la EndCard
  const elapsed4 = Date.now() - scene4StartWall;
  if (elapsed4 < scene4TargetSec * 1000) {
    await page.waitForTimeout(scene4TargetSec * 1000 - elapsed4);
  }
  sceneSlices.push({
    id: 'scene_04',
    startOffsetSec: scene4StartOffsetSec,
    durationSec: scene4TargetSec,
  });

  console.log('\n[Grabación completada exitosamente]');
  return sceneSlices;
}
