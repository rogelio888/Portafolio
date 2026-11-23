import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface EndCardProps {
  durationInFrames: number;
}

export const EndCard: React.FC<EndCardProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const translateY = interpolate(frame, [0, 25], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.96) 0%, rgba(4, 7, 14, 0.99) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        opacity,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: 28,
          padding: '48px 64px',
          maxWidth: 820,
          textAlign: 'center',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 50px rgba(56, 189, 248, 0.2)',
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '8px 18px',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 700,
            color: '#38bdf8',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              background: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 10px #22c55e',
            }}
          />
          Disponibilidad Inmediata &bull; Software a Medida
        </div>

        <h2
          style={{
            fontSize: 42,
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 40%, #cbd5e1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ¿Listo para digitalizar tu negocio?
        </h2>

        <p
          style={{
            fontSize: 18,
            color: '#94a3b8',
            lineHeight: 1.6,
            margin: '0 0 32px 0',
            maxWidth: 640,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Desarrollo de sistemas clínicos, educativos, industriales y páginas web de alto impacto con estándares de ingeniería profesional.
        </p>

        <div
          style={{
            background: 'rgba(34, 197, 94, 0.14)',
            border: '1.5px solid rgba(34, 197, 94, 0.5)',
            borderRadius: 22,
            padding: '20px 32px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 18,
            boxShadow: '0 12px 35px rgba(34, 197, 94, 0.25)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              background: '#22c55e',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
            }}
          >
            <svg style={{ width: 30, height: 30, fill: 'white' }} viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564c.173.087.289.129.332.202.043.073.043.419-.101.824z" />
            </svg>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div
              style={{
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: '#86efac',
                fontWeight: 700,
              }}
            >
              Contacto Directo por WhatsApp
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '0.04em',
              }}
            >
              +591 68787985
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
