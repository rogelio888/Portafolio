import React from 'react';
import {
  Audio,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { ProjectData, SceneMeta } from './types';
import { CaptionsTikTok } from './components/CaptionsTikTok';
import { EndCardVertical } from './components/EndCardVertical';

export const TikTokDemo: React.FC<ProjectData> = ({
  scenes = [],
  endCardDurationInSeconds = 5.5,
  musicFile = 'music/happy-beats.mp3',
  musicVolume = 0.12,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const TRANSITION_DURATION = 10; // frames
  const endCardFrames = Math.round(endCardDurationInSeconds * fps);

  // Movimiento sutil de luz ambiental en tonos dorado / ámbar
  const glowX = interpolate(
    Math.sin((frame / fps) * 0.8),
    [-1, 1],
    [45, 55],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const glowY = interpolate(
    Math.cos((frame / fps) * 0.7),
    [-1, 1],
    [25, 35],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        width,
        height,
        background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(216, 185, 142, 0.22) 0%, rgba(30, 26, 22, 0.95) 45%, #080706 85%)`,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Transición entre escenas de la demo */}
      <TransitionSeries>
        {scenes.map((scene: SceneMeta, index: number) => (
          <React.Fragment key={scene.id}>
            <TransitionSeries.Sequence durationInFrames={scene.durationInFrames}>
              {/* Badge superior moderno con título del módulo */}
              <div
                style={{
                  position: 'absolute',
                  top: 60,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 80,
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 32px',
                    borderRadius: 9999,
                    background: 'rgba(216, 185, 142, 0.14)',
                    backdropFilter: 'blur(16px)',
                    border: '1.5px solid rgba(216, 185, 142, 0.45)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(216, 185, 142, 0.15)',
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: '#FACC15',
                      boxShadow: '0 0 12px #FACC15',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Cinzel', Georgia, serif",
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      color: '#FDFBF7',
                      textTransform: 'uppercase',
                    }}
                  >
                    {scene.badgeTitle || scene.title || `Escena ${index + 1}`}
                  </span>
                </div>
              </div>

              {/* Contenedor elegante de la interfaz web en vivo */}
              <div
                style={{
                  position: 'absolute',
                  top: 150,
                  left: 40,
                  width: 1000,
                  height: 1250,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '2px solid rgba(216, 185, 142, 0.4)',
                  boxShadow: '0 35px 90px rgba(0, 0, 0, 0.95), 0 0 50px rgba(216, 185, 142, 0.18)',
                  background: '#0F0E0D',
                  zIndex: 20,
                }}
              >
                <OffthreadVideo
                  src={staticFile(scene.videoFile)}
                  playbackRate={1.2}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Subtítulos palabra por palabra estilo TikTok */}
              <CaptionsTikTok words={scene.words} />

              {/* Audio de voz neural sincronizado */}
              {scene.audioFile && (
                <Audio src={staticFile(scene.audioFile)} volume={1.0} />
              )}
            </TransitionSeries.Sequence>

            {/* Transición entre escenas con efecto de sonido whoosh */}
            {index < scenes.length - 1 && (
              <TransitionSeries.Transition
                presentation={slide({ direction: 'from-right' })}
                timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
              />
            )}
          </React.Fragment>
        ))}

        {/* Transición final hacia EndCardVertical */}
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Secuencia Final de Contacto / Call to Action */}
        <TransitionSeries.Sequence durationInFrames={endCardFrames}>
          <EndCardVertical durationInFrames={endCardFrames} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Efectos de sonido SFX de transición (Whoosh sutil a volumen 0.18) */}
      {scenes.map((_scene: SceneMeta, i: number) => {
        if (i === 0) return null;
        const startFrame = scenes
          .slice(0, i)
          .reduce((acc: number, s: SceneMeta) => acc + s.durationInFrames - TRANSITION_DURATION, 0);
        return (
          <Sequence key={`whoosh-${i}`} from={Math.max(0, startFrame)} durationInFrames={20}>
            <Audio src={staticFile('sfx/whoosh.mp3')} volume={0.18} />
          </Sequence>
        );
      })}

      {/* Música de fondo rítmica con fadeout final */}
      {musicFile && (
        <Audio
          src={staticFile(musicFile)}
          volume={(f: number) => {
            const totalEstimatedFrames =
              scenes.reduce((acc: number, s: SceneMeta) => acc + s.durationInFrames - TRANSITION_DURATION, 0) +
              endCardFrames;
            if (f > totalEstimatedFrames - 90) {
              return musicVolume * Math.max(0, (totalEstimatedFrames - f) / 90);
            }
            return musicVolume;
          }}
          loop
        />
      )}
    </div>
  );
};
