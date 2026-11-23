import React from 'react';

interface SmartZoomProps {
  children: React.ReactNode;
  durationInFrames?: number;
  events?: any[];
  defaultZoomFocus?: { x: number; y: number; scale?: number };
  baseWidth?: number;
  baseHeight?: number;
}

/**
 * SmartZoom desactivado: renderiza el contenido en escala real 1.0 (100% estático).
 * Sin zooms, sin transforms, garantizando que nada se recorte en pantalla.
 */
export const SmartZoom: React.FC<SmartZoomProps> = ({ children }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        transform: 'none',
      }}
    >
      {children}
    </div>
  );
};
