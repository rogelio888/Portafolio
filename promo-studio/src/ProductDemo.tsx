import React from 'react';
import {
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from 'remotion';
import { ProjectData, SceneMeta } from './types';
import { EndCard } from './components/EndCard';

export const ProductDemo: React.FC<ProjectData> = ({
  scenes = [],
  endCardDurationInSeconds = 5,
  musicFile,
  musicVolume = 0.12,
}) => {
  const { fps, width, height } = useVideoConfig();

  // Calcular inicio acumulado de frames para cada escena
  let currentStartFrame = 0;
  const sceneTimeline = scenes.map((scene: SceneMeta) => {
    const start = currentStartFrame;
    const duration = scene.durationInFrames;
    currentStartFrame += duration;
    return {
      ...scene,
      startFrame: start,
      durationInFrames: duration,
    };
  });

  const endCardStartFrame = currentStartFrame;
  const endCardFrames = Math.round(endCardDurationInSeconds * fps);

  return (
    <div
      style={{
        width,
        height,
        background: '#000000',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Reproducción de Escenas a Pantalla Completa Limpia (Borde a Borde 1920x1080) */}
      {sceneTimeline.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <OffthreadVideo
            src={staticFile(scene.videoFile)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Audio de locución neural */}
          {scene.audioFile && (
            <Audio src={staticFile(scene.audioFile)} volume={1.0} />
          )}
        </Sequence>
      ))}

      {/* Pantalla Final de Contacto / Call to Action */}
      <Sequence from={endCardStartFrame} durationInFrames={endCardFrames}>
        <EndCard durationInFrames={endCardFrames} />
      </Sequence>

      {/* Música de fondo con fade-out al final */}
      {musicFile && (
        <Audio
          src={staticFile(musicFile)}
          volume={(f: number) => {
            const totalFrames = endCardStartFrame + endCardFrames;
            if (f > totalFrames - 90) {
              return musicVolume * Math.max(0, (totalFrames - f) / 90);
            }
            return musicVolume;
          }}
          loop
        />
      )}
    </div>
  );
};
