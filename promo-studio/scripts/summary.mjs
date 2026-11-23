import { execSync } from 'child_process';

const files = [
  'video_1_clinica.mp4',
  'video_2_pensiones.mp4',
  'video_3_agroflota.mp4',
  'video_4_landings.mp4'
];

const results = files.map(file => {
  const fullPath = `promo-studio/output/${file}`;
  const out = execSync(`ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,r_frame_rate -of json "${fullPath}"`);
  const data = JSON.parse(out.toString());
  const vStream = data.streams.find(s => s.width);
  const dur = parseFloat(data.format.duration).toFixed(2);
  const sizeMb = (parseInt(data.format.size) / (1024 * 1024)).toFixed(2);
  return {
    Archivo: file,
    Resolución: `${vStream.width}x${vStream.height}`,
    FPS: vStream.r_frame_rate === '60/1' ? '60 fps' : vStream.r_frame_rate,
    Duración: `${dur}s`,
    Peso: `${sizeMb} MB`
  };
});

console.table(results);
