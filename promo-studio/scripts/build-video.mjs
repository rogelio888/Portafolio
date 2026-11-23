import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';
import { chromium } from 'playwright';

// Parse command line arguments
const args = process.argv.slice(2);
let projectName = 'perfumeria';
let skipAudio = false;
let skipRecord = false;
let skipRender = false;

for (const arg of args) {
  if (arg.startsWith('--project=')) {
    projectName = arg.split('=')[1];
  } else if (arg === '--skip-audio') {
    skipAudio = true;
  } else if (arg === '--skip-record') {
    skipRecord = true;
  } else if (arg === '--skip-render') {
    skipRender = true;
  }
}

const ROOT_DIR = path.resolve('.');
const PROJECT_DIR = path.join(ROOT_DIR, 'projects', projectName);
const MANIFEST_PATH = path.join(PROJECT_DIR, 'manifest.json');

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`Error: Manifest not found at ${MANIFEST_PATH}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const isVertical = manifest.orientation === 'vertical' || manifest.composition === 'TikTokDemo';
const compositionId = manifest.composition || (isVertical ? 'TikTokDemo' : 'ProductDemo');

console.log(`====================================================`);
console.log(`🚀 PROMO-STUDIO PIPELINE: ${manifest.projectName} (${compositionId})`);
console.log(`🎬 Título: ${manifest.title}`);
console.log(`📱 Orientación: ${isVertical ? 'Vertical 9:16 (1080x1920)' : 'Horizontal 16:9 (1920x1080)'}`);
console.log(`====================================================`);

const AUDIO_DIR = path.join(ROOT_DIR, 'public', 'audio', projectName);
const RECORDINGS_DIR = path.join(ROOT_DIR, 'public', 'recordings', projectName);
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');

fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function parseVttToWords(vttContent) {
  if (!vttContent) return [];
  const lines = vttContent.split(/\r?\n/);
  const words = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('-->')) {
      const [startStr, endStr] = line.split('-->').map(s => s.trim());
      const parseTime = (t) => {
        const parts = t.replace(',', '.').split(':');
        return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
      };
      const currentStart = parseTime(startStr);
      const currentEnd = parseTime(endStr);

      let textLine = '';
      for (let j = i + 1; j < lines.length; j++) {
        const l = lines[j].trim();
        if (l && !l.includes('-->') && isNaN(Number(l))) {
          textLine = l;
          break;
        }
      }

      if (textLine) {
        const rawWords = textLine.split(/\s+/).filter(Boolean);
        const totalChars = rawWords.reduce((acc, w) => acc + Math.max(2, w.length), 0);
        const segmentDuration = Math.max(0.2, currentEnd - currentStart);
        let wordPointer = currentStart;

        for (const w of rawWords) {
          const weight = Math.max(2, w.length);
          const wDuration = (weight / totalChars) * segmentDuration;
          words.push({
            word: w,
            startSec: parseFloat(wordPointer.toFixed(3)),
            endSec: parseFloat((wordPointer + wDuration).toFixed(3)),
          });
          wordPointer += wDuration;
        }
      }
    }
  }
  return words;
}

// ====================================================================
// ETAPA A — GENERACIÓN DE AUDIO Y MEDICIÓN EXACTA (TTS + VTT SUBTÍTULOS)
// ====================================================================
console.log('\n--- ETAPA A: GENERACIÓN DE AUDIO, SUBTÍTULOS Y MEDICIÓN EXACTA ---');

const durationsFile = path.join(AUDIO_DIR, 'durations.json');
let durationsData = {};

const existingDurations = fs.existsSync(durationsFile) ? JSON.parse(fs.readFileSync(durationsFile, 'utf-8')) : null;
const narrationChanged = !existingDurations || manifest.scenes.some(s => !existingDurations[s.id] || existingDurations[s.id].narration !== s.narration);

if (!narrationChanged && skipAudio) {
  console.log('Reutilizando audios normalizados existentes en durations.json...');
  durationsData = existingDurations;
} else {
  const ttsRate = isVertical ? '+4%' : '-4%';

  for (let i = 0; i < manifest.scenes.length; i++) {
    const scene = manifest.scenes[i];
    const rawAudio = path.join(AUDIO_DIR, `${scene.id}_raw.mp3`);
    const rawVtt = path.join(AUDIO_DIR, `${scene.id}.vtt`);
    const normAudio = path.join(AUDIO_DIR, `${scene.id}.mp3`);

    console.log(`Generando TTS y subtítulos para ${scene.id} ("${scene.title}")...`);
    const ttsCmd = `python -m edge_tts --voice es-MX-JorgeNeural --rate="${ttsRate}" --text "${scene.narration.replace(/"/g, '\\"')}" --write-media "${rawAudio}" --write-subtitles "${rawVtt}"`;
    execSync(ttsCmd, { stdio: 'inherit' });

    console.log(`Normalizando audio con loudnorm -14 LUFS...`);
    const normCmd = `ffmpeg -y -i "${rawAudio}" -af "loudnorm=I=-14:TP=-1.5:LRA=11" -c:a libmp3lame -b:a 192k "${normAudio}"`;
    execSync(normCmd, { stdio: 'pipe' });
    if (fs.existsSync(rawAudio)) fs.unlinkSync(rawAudio);

    const probeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${normAudio}"`;
    const measuredDuration = parseFloat(execSync(probeCmd).toString().trim());

    // Margen de respiración visual de +0.4s en vertical (+0.6s en horizontal)
    const padding = isVertical ? 0.4 : 0.6;
    const visualDuration = parseFloat((measuredDuration + padding).toFixed(2));
    const durationInFrames = Math.round(visualDuration * 60);

    // Parsear archivo VTT para subtítulos palabra por palabra
    let words = [];
    if (fs.existsSync(rawVtt)) {
      const vttContent = fs.readFileSync(rawVtt, 'utf-8');
      words = parseVttToWords(vttContent);
    }

    durationsData[scene.id] = {
      measuredDuration,
      visualDuration,
      durationInFrames,
      narration: scene.narration,
      title: scene.title,
      badgeTitle: scene.badgeTitle || scene.title,
      words,
    };

    console.log(` -> ${scene.id}: Audio ${measuredDuration.toFixed(2)}s | Escena: ${visualDuration.toFixed(2)}s (${durationInFrames} frames, ${words.length} palabras)`);
  }

  fs.writeFileSync(durationsFile, JSON.stringify(durationsData, null, 2));
}

// ====================================================================
// ETAPA B — GRABACIÓN CONTINUA EN CHROMIUM
// ====================================================================
console.log('\n--- ETAPA B: GRABACIÓN CONTINUA DETERMINISTA (ZERO PANTALLAS BLANCAS) ---');

async function smoothMove(page, currentPos, targetX, targetY, steps = 22) {
  const startX = currentPos.x;
  const startY = currentPos.y;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const x = startX + (targetX - startX) * ease;
    const y = startY + (targetY - startY) * ease;
    await page.mouse.move(x, y);
    await page.evaluate(({ cx, cy }) => {
      if (window.__moveCursor) window.__moveCursor(cx, cy);
    }, { cx: x, cy: y });
    await page.waitForTimeout(16);
  }
  currentPos.x = targetX;
  currentPos.y = targetY;
}

async function smoothClick(page, currentPos, selector, options = {}) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout: 7000 });
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (box) {
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    await smoothMove(page, currentPos, targetX, targetY, options.steps || 22);
    await page.waitForTimeout(100);
    await page.evaluate(() => { if (window.__clickCursor) window.__clickCursor(true); });
    await locator.click();
    await page.waitForTimeout(100);
    await page.evaluate(() => { if (window.__clickCursor) window.__clickCursor(false); });
  } else {
    await locator.click();
  }
  await page.waitForTimeout(options.waitAfter || 300);
}

async function smoothType(page, currentPos, selector, text, options = {}) {
  const locator = page.locator(selector).first();
  await locator.waitFor({ state: 'visible', timeout: 7000 });
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (box) {
    const targetX = box.x + box.width / 2;
    const targetY = box.y + box.height / 2;
    await smoothMove(page, currentPos, targetX, targetY, 20);
    await page.waitForTimeout(80);
    await page.evaluate(() => { if (window.__clickCursor) window.__clickCursor(true); });
    await locator.click();
    await page.waitForTimeout(80);
    await page.evaluate(() => { if (window.__clickCursor) window.__clickCursor(false); });
  }
  await locator.fill('');
  for (const char of text) {
    await page.keyboard.type(char, { delay: 40 });
  }
  await locator.dispatchEvent('input');
  await page.waitForTimeout(options.waitAfter || 250);
}

async function setupPage(page) {
  await page.addInitScript(() => {
    // 1. Regla CSS global para ocultar consola API y elementos de debug
    const style = document.createElement('style');
    style.textContent = `
      app-api-sim-console,
      [title="Consola de simulación API"],
      .api-sim-console,
      .fixed.bottom-5.right-5 {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
    `;
    document.documentElement.appendChild(style);

    // 2. Intervalo de borrado DOM agresivo cada 50ms
    const removeAPI = () => {
      try {
        document.querySelectorAll('app-api-sim-console, [title="Consola de simulación API"]').forEach(el => el.remove());
        document.querySelectorAll('button').forEach(btn => {
          const txt = (btn.innerText || '').trim();
          if (txt === 'API' || txt.startsWith('API ') || txt.startsWith('API\n') || btn.title === 'Consola de simulación API') {
            btn.remove();
          }
        });
      } catch (e) { }
    };
    setInterval(removeAPI, 50);
    window.addEventListener('DOMContentLoaded', removeAPI);
    window.addEventListener('load', removeAPI);

    // 3. Cursor de grabación elegante y visible
    window.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('recording-cursor')) return;
      const cursor = document.createElement('div');
      cursor.id = 'recording-cursor';
      cursor.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 18px; height: 18px;
        background: rgba(216, 185, 142, 0.95);
        border: 2px solid white;
        border-radius: 50%;
        pointer-events: none;
        z-index: 2147483647;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 14px rgba(216, 185, 142, 0.9), 0 2px 5px rgba(0,0,0,0.5);
        transition: transform 0.08s ease-out, background 0.15s;
      `;
      document.body.appendChild(cursor);

      window.__moveCursor = (x, y) => {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
      };

      window.__clickCursor = (isDown) => {
        if (isDown) {
          cursor.style.transform = 'translate(-50%, -50%) scale(0.7)';
          cursor.style.background = 'rgba(250, 204, 21, 1)';
        } else {
          cursor.style.transform = 'translate(-50%, -50%) scale(1)';
          cursor.style.background = 'rgba(216, 185, 142, 0.95)';
        }
      };
    });
  });
}

const recordedScenesMeta = [];

const viewportWidth = isVertical ? 1200 : 1366;
const viewportHeight = isVertical ? 1500 : 768;

if (!skipRecord) {
  // Limpiar videos anteriores
  fs.readdirSync(RECORDINGS_DIR).filter(f => f.endsWith('.mp4') || f.endsWith('.webm')).forEach(f => {
    try { fs.unlinkSync(path.join(RECORDINGS_DIR, f)); } catch (e) { }
  });

  const continuousRecordDir = path.join(RECORDINGS_DIR, 'tmp_continuous');
  fs.mkdirSync(continuousRecordDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: viewportWidth, height: viewportHeight },
    deviceScaleFactor: 2,
    recordVideo: {
      dir: continuousRecordDir,
      size: { width: viewportWidth, height: viewportHeight },
    },
  });

  const sessionStartTime = Date.now();
  const page = await context.newPage();
  await setupPage(page);

  const currentPos = { x: Math.round(viewportWidth / 2), y: Math.round(viewportHeight / 2) };

  console.log(`Iniciando sesión continua en limpio (${viewportWidth}x${viewportHeight})...`);
  await page.goto(manifest.baseUrl || 'http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(manifest.baseUrl || 'http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Cargar runner de grabación del proyecto correspondiente
  const recorderFile = path.join(PROJECT_DIR, 'record.mjs');
  if (!fs.existsSync(recorderFile)) {
    console.error(`Error: No se encontró el grabador en ${recorderFile}`);
    process.exit(1);
  }
  const recorderUrl = pathToFileURL(recorderFile).href;
  const { recordSession } = await import(recorderUrl);

  const sceneSlices = await recordSession({
    page,
    context,
    browser,
    currentPos,
    durationsData,
    sessionStartTime,
    smoothClick,
    smoothMove,
    smoothType,
    manifest,
    playbackRate: isVertical ? 1.2 : 1.0,
  });

  // Cerrar sesión Playwright
  const video = page.video();
  await page.close();
  await context.close();
  await browser.close();

  const rawWebmPath = await video.path();
  console.log(`\nGrabación continua completada: ${rawWebmPath}`);
  await new Promise(r => setTimeout(r, 1000));

  // Transcodificar master continuo a MP4 intra-frame a 60fps
  const masterMp4 = path.join(RECORDINGS_DIR, 'master_continuous.mp4');
  console.log('Transcodificando sesión continua a MP4 intra-frame 60fps...');
  execSync(`ffmpeg -y -i "${rawWebmPath}" -r 60 -g 1 -c:v libx264 -preset fast -crf 17 -pix_fmt yuv420p "${masterMp4}"`, { stdio: 'pipe' });

  // Cortar cada escena con precisión de milisegundos
  for (let i = 0; i < manifest.scenes.length; i++) {
    const scene = manifest.scenes[i];
    const slice = sceneSlices[i];
    const finalMp4Path = path.join(RECORDINGS_DIR, `${scene.id}.mp4`);

    console.log(`Cortando ${scene.id}.mp4 (inicio: ${slice.startOffsetSec.toFixed(2)}s, duración: ${slice.durationSec.toFixed(2)}s)...`);
    const cutCmd = `ffmpeg -y -ss ${slice.startOffsetSec} -i "${masterMp4}" -t ${slice.durationSec} -r 60 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "${finalMp4Path}"`;
    execSync(cutCmd, { stdio: 'pipe' });

    recordedScenesMeta.push({
      id: scene.id,
      title: scene.title,
      badgeTitle: scene.badgeTitle || scene.title,
      narration: scene.narration,
      audioFile: `audio/${projectName}/${scene.id}.mp3`,
      videoFile: `recordings/${projectName}/${scene.id}.mp4`,
      durationInSeconds: slice.durationSec,
      durationInFrames: durationsData[scene.id].durationInFrames,
      zoomFocus: scene.zoomFocus,
      words: durationsData[scene.id].words || [],
    });
  }

  // Limpiar tmp
  try { fs.rmSync(continuousRecordDir, { recursive: true, force: true }); } catch (e) { }
} else {
  for (const scene of manifest.scenes) {
    recordedScenesMeta.push({
      id: scene.id,
      title: scene.title,
      badgeTitle: scene.badgeTitle || scene.title,
      narration: scene.narration,
      audioFile: `audio/${projectName}/${scene.id}.mp3`,
      videoFile: `recordings/${projectName}/${scene.id}.mp4`,
      durationInSeconds: durationsData[scene.id].visualDuration,
      durationInFrames: durationsData[scene.id].durationInFrames,
      zoomFocus: scene.zoomFocus,
      words: durationsData[scene.id].words || [],
    });
  }
}

// ====================================================================
// ETAPA C — COMPOSICIÓN CINEMATOGRÁFICA EN REMOTION
// ====================================================================
console.log(`\n--- ETAPA C: COMPOSICIÓN CINEMATOGRÁFICA CON REMOTION (${compositionId}) ---`);

const projectProps = {
  projectName,
  title: manifest.title,
  fps: 60,
  width: isVertical ? 1080 : 1920,
  height: isVertical ? 1920 : 1080,
  orientation: isVertical ? 'vertical' : 'horizontal',
  endCardDurationInSeconds: manifest.endCardDurationInSeconds || 5.5,
  musicFile: 'music/happy-beats.mp3',
  musicVolume: 0.12,
  scenes: recordedScenesMeta,
};

const propsFile = path.join(ROOT_DIR, 'public', `props_${projectName}.json`);
fs.writeFileSync(propsFile, JSON.stringify(projectProps, null, 2));

const finalOutputVideo = path.join(OUTPUT_DIR, manifest.outputFilename || `video_${manifest.videoNumber || 1}_${projectName}.mp4`);

if (!skipRender) {
  console.log(`Renderizando video final a ${isVertical ? '1080x1920' : '1920x1080'} 60fps con Remotion...`);
  console.log(`Destino: ${finalOutputVideo}`);

  const remotionCmd = `npx remotion render src/index.ts ${compositionId} "${finalOutputVideo}" --props="${propsFile}"`;
  execSync(remotionCmd, { stdio: 'inherit' });

  // Inspeccionar resultado final con ffprobe
  const probeFinal = `ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,r_frame_rate -of json "${finalOutputVideo}"`;
  const info = JSON.parse(execSync(probeFinal).toString());
  console.log('\n====================================================');
  console.log('✅ VIDEO FINAL TIKTOK GENERADO EXITOSAMENTE:');
  console.log(JSON.stringify(info, null, 2));
  console.log('====================================================\n');
}

console.log('🏁 Proceso finalizado.');
