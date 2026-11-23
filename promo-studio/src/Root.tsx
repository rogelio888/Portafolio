import React from 'react';
import { Composition } from 'remotion';
import { ProductDemo } from './ProductDemo';
import { TikTokDemo } from './TikTokDemo';
import { ProjectData, SceneMeta } from './types';

const defaultProjectData: ProjectData = {
  projectName: 'clinica',
  title: 'Salud Integral — Gestión Clínica',
  fps: 60,
  width: 1920,
  height: 1080,
  endCardDurationInSeconds: 6,
  musicFile: 'music/happy-beats.mp3',
  musicVolume: 0.12,
  scenes: [
    {
      id: 'scene_01',
      title: 'Acceso y Dashboard',
      narration: 'Accede al sistema con perfiles diferenciados y supervisa indicadores en tiempo real.',
      audioFile: 'audio/clinica/scene_01.mp3',
      videoFile: 'recordings/clinica/scene_01.mp4',
      durationInSeconds: 15,
      durationInFrames: 900,
      zoomFocus: { x: 683, y: 384, scale: 1.25 },
    },
  ],
};

const defaultTikTokData: ProjectData = {
  projectName: 'perfumeria',
  title: 'L\'Atelier — Haute Parfumerie Suite',
  fps: 60,
  width: 1080,
  height: 1920,
  endCardDurationInSeconds: 5.5,
  musicFile: 'music/happy-beats.mp3',
  musicVolume: 0.12,
  orientation: 'vertical',
  scenes: [
    {
      id: 'scene_01',
      title: 'Catálogo & Combos QR',
      badgeTitle: '1. Catálogo & Combos QR',
      narration: 'Preparar perfumes al ojo te hace regalar esencia y perder ganancia en cada frasco.',
      audioFile: 'audio/perfumeria/scene_01.mp3',
      videoFile: 'recordings/perfumeria/scene_01.mp4',
      durationInSeconds: 10,
      durationInFrames: 600,
      words: [],
    },
  ],
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition<any, any>
        id="ProductDemo"
        component={ProductDemo}
        durationInFrames={900}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={defaultProjectData}
        calculateMetadata={async ({ props }: { props: any }) => {
          const fps = Number(props.fps) || 60;
          const scenes = (props.scenes as SceneMeta[]) || [];
          const scenesTotalFrames = scenes.reduce(
            (acc: number, s: SceneMeta) => acc + (s.durationInFrames || Math.round(s.durationInSeconds * fps)),
            0
          );
          const endCardFrames = Math.round((Number(props.endCardDurationInSeconds) || 5) * fps);
          const totalFrames = Math.max(60, scenesTotalFrames + endCardFrames);

          return {
            durationInFrames: totalFrames,
            fps,
            width: Number(props.width) || 1920,
            height: Number(props.height) || 1080,
          };
        }}
      />

      <Composition<any, any>
        id="TikTokDemo"
        component={TikTokDemo}
        durationInFrames={1800}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={defaultTikTokData}
        calculateMetadata={async ({ props }: { props: any }) => {
          const fps = Number(props.fps) || 60;
          const scenes = (props.scenes as SceneMeta[]) || [];
          const TRANSITION_DURATION = 10;
          const transitionOverlap = scenes.length * TRANSITION_DURATION;
          const scenesTotalFrames = scenes.reduce(
            (acc: number, s: SceneMeta) => acc + (s.durationInFrames || Math.round(s.durationInSeconds * fps)),
            0
          );
          const endCardFrames = Math.round((Number(props.endCardDurationInSeconds) || 5.5) * fps);
          const totalFrames = Math.max(60, scenesTotalFrames + endCardFrames - transitionOverlap);

          return {
            durationInFrames: totalFrames,
            fps,
            width: 1080,
            height: 1920,
          };
        }}
      />
    </>
  );
};
