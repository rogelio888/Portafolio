import React from 'react';

interface CaptionsProps {
  text?: string;
  durationInFrames?: number;
}

/**
 * Subtítulos desactivados: renderiza null para mantener la interfaz de usuario
 * 100% limpia sin textos superpuestos.
 */
export const Captions: React.FC<CaptionsProps> = () => {
  return null;
};
