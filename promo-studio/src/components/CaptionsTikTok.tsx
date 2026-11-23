import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';
import { WordTimestamp } from '../types';

interface CaptionsTikTokProps {
  words?: WordTimestamp[];
}

export const CaptionsTikTok: React.FC<CaptionsTikTokProps> = ({ words = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  // Agrupar palabras inteligentemente (2 a 3 palabras por pantalla)
  const chunks = useMemo(() => {
    if (!words || words.length === 0) return [];
    const result: { words: WordTimestamp[]; startSec: number; endSec: number }[] = [];
    
    for (let i = 0; i < words.length; ) {
      const remaining = words.length - i;
      let count = remaining === 4 ? 2 : remaining <= 3 ? remaining : 3;
      if (count === 3) {
        const charLen = words.slice(i, i + 3).reduce((sum, w) => sum + w.word.length, 0);
        if (charLen > 18) count = 2;
      }
      const slice = words.slice(i, i + count);
      result.push({
        words: slice,
        startSec: slice[0].startSec,
        endSec: slice[slice.length - 1].endSec,
      });
      i += count;
    }
    return result;
  }, [words]);

  if (chunks.length === 0) return null;

  // Encontrar el chunk activo para el tiempo actual
  const activeChunk = chunks.find((c) => currentSec >= c.startSec - 0.05 && currentSec <= c.endSec + 0.15) ||
    (currentSec < chunks[0].startSec ? chunks[0] : null);

  if (!activeChunk) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 240,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px 28px',
        zIndex: 100,
        pointerEvents: 'none',
        padding: '0 50px',
        textAlign: 'center',
      }}
    >
      {activeChunk.words.map((w: WordTimestamp, idx: number) => {
        const isWordActive = currentSec >= w.startSec && currentSec < w.endSec;
        
        // Micro-animación spring para la palabra activa
        const wordStartFrame = Math.round(w.startSec * fps);
        const springScale = isWordActive
          ? spring({
              frame: frame - wordStartFrame,
              fps,
              config: { damping: 14, stiffness: 220, mass: 0.5 },
              from: 1.0,
              to: 1.10,
            })
          : 1.0;

        return (
          <span
            key={idx}
            style={{
              display: 'inline-block',
              margin: '0 6px',
              padding: '4px 10px',
              color: isWordActive ? '#FACC15' : '#FFFFFF',
              transform: `scale(${springScale})`,
              transformOrigin: 'center center',
              fontWeight: 900,
              fontSize: 46,
              lineHeight: 1.1,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              textShadow: isWordActive
                ? '0 0 25px rgba(250, 204, 21, 0.8), 3px 3px 0 #000000, -3px -3px 0 #000000, 3px -3px 0 #000000, -3px 3px 0 #000000, 0 8px 18px rgba(0,0,0,0.95)'
                : '3px 3px 0 #000000, -3px -3px 0 #000000, 3px -3px 0 #000000, -3px 3px 0 #000000, 0 6px 14px rgba(0,0,0,0.9)',
              transition: 'color 0.05s ease',
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  );
};
