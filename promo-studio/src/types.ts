export interface ActionEvent {
  timeMs: number;
  x: number;
  y: number;
  type: 'click' | 'zoom' | 'resetZoom';
  zoomScale?: number;
}

export interface WordTimestamp {
  word: string;
  startSec: number;
  endSec: number;
}

export interface SceneMeta {
  id: string;
  title?: string;
  badgeTitle?: string;
  narration: string;
  audioFile: string;
  videoFile: string;
  durationInSeconds: number;
  durationInFrames: number;
  events?: ActionEvent[];
  zoomFocus?: { x: number; y: number; scale?: number };
  words?: WordTimestamp[];
}

export interface ProjectData {
  projectName: string;
  title: string;
  fps: number;
  width: number;
  height: number;
  scenes: SceneMeta[];
  endCardDurationInSeconds: number;
  musicFile?: string;
  musicVolume?: number;
  orientation?: 'horizontal' | 'vertical';
}
