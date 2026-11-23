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
  // ESCENA 1: Acceso, Dashboard y Especialidades
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 1] Acceso, Dashboard y Especialidades...');
  await page.waitForSelector('button:has-text("Admin")', { state: 'visible', timeout: 7000 });
  await page.waitForTimeout(400);

  const scene1StartWall = Date.now();
  const scene1StartOffsetSec = (scene1StartWall - sessionStartTime) / 1000;
  const scene1TargetSec = durationsData['scene_01'].visualDuration;

  // Presentación inicial en pantalla de acceso
  await smoothMove(page, currentPos, 683, 260, 20);
  await page.waitForTimeout(1200);

  // Clic en Admin autocompletar e Iniciar Sesión
  await smoothClick(page, currentPos, 'button:has-text("Admin")', { waitAfter: 500 });
  await smoothClick(page, currentPos, 'button[type="submit"]', { waitAfter: 1200 });

  // Hover suave en KPIs del Dashboard (sin clics fantasma en números)
  await smoothMove(page, currentPos, 260, 200, 22);
  await page.waitForTimeout(900);
  await smoothMove(page, currentPos, 520, 200, 22);
  await page.waitForTimeout(900);
  await smoothMove(page, currentPos, 780, 200, 22);
  await page.waitForTimeout(900);

  // Scroll suave en dashboard
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
  await page.waitForTimeout(1000);

  // Navegar a Especialidades por sidebar
  await smoothClick(page, currentPos, 'a[href*="especialidades"], a:has-text("Especialidades")', { waitAfter: 1200 });
  await smoothMove(page, currentPos, 683, 340, 20);

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
  // ESCENA 2: Registro de Paciente Nuevo (Valeria Morales Roca)
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 2] Registro real de Paciente Nuevo...');
  const scene2StartWall = Date.now();
  const scene2StartOffsetSec = (scene2StartWall - sessionStartTime) / 1000;
  const scene2TargetSec = durationsData['scene_02'].visualDuration;

  // Clic en Pacientes en sidebar (transición instantánea sin recarga)
  await smoothClick(page, currentPos, 'a[href*="pacientes"], a:has-text("Pacientes")', { waitAfter: 700 });

  // Abrir modal Nuevo Paciente
  await smoothClick(page, currentPos, 'button:has-text("Nuevo Paciente")', { waitAfter: 700 });
  await page.waitForSelector('.slideover-panel.open', { state: 'visible', timeout: 4000 });

  // Llenar formulario
  await smoothType(page, currentPos, 'input[formcontrolname="nombre"]', 'Valeria Morales Roca', { waitAfter: 250 });
  await smoothType(page, currentPos, 'input[formcontrolname="ci"]', '8844221', { waitAfter: 250 });
  await smoothType(page, currentPos, 'input[formcontrolname="telefono"]', '76543210', { waitAfter: 350 });

  // Guardar Paciente de verdad
  const saveBtn = await page.waitForSelector('button[type="submit"]:has-text("Guardar Paciente")', { state: 'visible' });
  await saveBtn.scrollIntoViewIfNeeded();
  await smoothClick(page, currentPos, 'button[type="submit"]:has-text("Guardar Paciente")', { waitAfter: 600 });

  // Esperar cierre del panel y aparición en tabla
  await page.waitForSelector('.slideover-panel.open', { state: 'hidden', timeout: 4000 });
  const valeriaRow = await page.waitForSelector('td:has-text("Valeria Morales Roca")', { state: 'visible', timeout: 4000 });
  const valBox = await valeriaRow.boundingBox();
  if (valBox) {
    await smoothMove(page, currentPos, valBox.x + valBox.width / 2, valBox.y + valBox.height / 2, 20);
  }

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
  // ESCENA 3: Agendamiento de Cita Médica
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 3] Agendamiento real de Cita Médica...');
  const scene3StartWall = Date.now();
  const scene3StartOffsetSec = (scene3StartWall - sessionStartTime) / 1000;
  const scene3TargetSec = durationsData['scene_03'].visualDuration;

  // Clic en Agenda de Citas en sidebar
  await smoothClick(page, currentPos, 'a[href*="citas"], a:has-text("Agenda de Citas")', { waitAfter: 800 });

  // Seleccionar Dr. Roberto Silva
  const docSelect = await page.waitForSelector('select.form-control', { state: 'visible' });
  const docBox = await docSelect.boundingBox();
  if (docBox) await smoothMove(page, currentPos, docBox.x + docBox.width / 2, docBox.y + docBox.height / 2, 20);
  await page.selectOption('select.form-control', { index: 1 });
  await page.waitForTimeout(900);

  // Clic en turno disponible 08:00
  await smoothClick(page, currentPos, '.slot-card.available', { waitAfter: 600 });
  await page.waitForSelector('.slideover-panel.open', { state: 'visible', timeout: 4000 });

  // Buscar a Valeria Morales Roca
  await smoothType(page, currentPos, '.search-paciente input', 'Valeria', { waitAfter: 500 });
  const resultItem = await page.waitForSelector('.result-item:has-text("Valeria")', { state: 'visible', timeout: 3000 });
  await smoothClick(page, currentPos, '.result-item:has-text("Valeria")', { waitAfter: 500 });

  // Confirmar y Agendar
  await page.waitForSelector('button:has-text("Confirmar y Agendar"):not([disabled])', { state: 'visible', timeout: 3000 });
  await smoothClick(page, currentPos, 'button:has-text("Confirmar y Agendar")', { waitAfter: 600 });

  // Esperar cierre del panel y ver slot ocupado por Valeria
  await page.waitForSelector('.slideover-panel.open', { state: 'hidden', timeout: 4000 });
  const bookedSlot = await page.waitForSelector('.slot-card.booked:has-text("Valeria")', { state: 'visible', timeout: 4000 });
  const slotBox = await bookedSlot.boundingBox();
  if (slotBox) {
    await smoothMove(page, currentPos, slotBox.x + slotBox.width / 2, slotBox.y + slotBox.height / 2, 20);
  }

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
  // ESCENA 4: Consultorio Digital, Caja y Reportes
  // ------------------------------------------------------------------
  console.log('\n[Grabando Escena 4] Consultorio, Caja y Reportes...');
  const scene4StartWall = Date.now();
  const scene4StartOffsetSec = (scene4StartWall - sessionStartTime) / 1000;
  const scene4TargetSec = durationsData['scene_04'].visualDuration;

  // Ir a Mi Consultorio en sidebar
  await smoothClick(page, currentPos, 'a[href*="panel-medico"], a:has-text("Mi Consultorio")', { waitAfter: 700 });
  await page.selectOption('.simulador-login select', { index: 1 });
  await page.waitForTimeout(1000);

  // Ir a Caja Registradora en sidebar
  await smoothClick(page, currentPos, 'a[href*="caja"], a:has-text("Caja Registradora")', { waitAfter: 700 });
  await page.selectOption('.simulador-login select', { index: 1 });
  await page.waitForTimeout(700);

  // Cobrar consulta
  await smoothClick(page, currentPos, '.btn-cobrar', { waitAfter: 600 });
  await page.waitForSelector('.slideover-panel.open', { state: 'visible', timeout: 3000 });

  // Scroll en drawer para mostrar botón de confirmación
  await page.evaluate(() => document.querySelector('.slideover-panel .slideover-body')?.scrollTo({ top: 350, behavior: 'smooth' }));
  await page.waitForTimeout(400);

  // Clic en Confirmar Pago y Emitir Recibo
  await smoothClick(page, currentPos, 'button:has-text("Confirmar Pago y Emitir Recibo")', { waitAfter: 800 });

  // Esperar y mostrar comprobante COMP-...
  await page.waitForSelector('.modal-comprobante:has-text("¡Pago Registrado!")', { state: 'visible', timeout: 4000 });
  await page.waitForTimeout(1400);

  // Cerrar modal de comprobante
  await smoothClick(page, currentPos, '.modal-comprobante button:has-text("Cerrar")', { waitAfter: 500 });

  // Ir a Reportes Gerenciales en sidebar
  await smoothClick(page, currentPos, 'a[href*="reportes"], a:has-text("Reportes Gerenciales")', { waitAfter: 900 });
  await smoothMove(page, currentPos, 683, 330, 20);

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
