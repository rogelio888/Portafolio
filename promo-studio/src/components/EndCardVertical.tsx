import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface EndCardVerticalProps {
  durationInFrames: number;
}

export const EndCardVertical: React.FC<EndCardVerticalProps> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cardScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
    from: 0.88,
    to: 1.0,
  });

  const translateY = interpolate(frame, [0, 20], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at 50% 35%, rgba(216, 185, 142, 0.22) 0%, rgba(18, 17, 16, 0.98) 55%, #080706 90%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        opacity,
        fontFamily: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '0 50px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          background: 'linear-gradient(180deg, rgba(28, 26, 23, 0.92) 0%, rgba(14, 13, 12, 0.98) 100%)',
          border: '2px solid rgba(216, 185, 142, 0.45)',
          borderRadius: 36,
          padding: '64px 48px',
          textAlign: 'center',
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.95), 0 0 60px rgba(216, 185, 142, 0.22)',
          transform: `translateY(${translateY}px) scale(${cardScale})`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
        }}
      >
        {/* Emblema Haute Parfumerie */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EBD3B4 0%, #C5A880 50%, #8C7352 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(216, 185, 142, 0.4)',
            color: '#080706',
            fontSize: 42,
            fontFamily: "'Cinzel', Georgia, serif",
            fontWeight: 800,
          }}
        >
          L
        </div>

        {/* Marca */}
        <div>
          <h2
            style={{
              fontFamily: "'Cinzel', Georgia, serif",
              fontSize: 46,
              fontWeight: 800,
              letterSpacing: '0.22em',
              color: '#FDFBF7',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            L&apos;ATELIER
          </h2>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.26em',
              color: '#D8B98E',
              textTransform: 'uppercase',
              marginTop: 8,
            }}
          >
            Haute Parfumerie Suite
          </p>
        </div>

        {/* Separador Dorado */}
        <div
          style={{
            width: 140,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #D8B98E, transparent)',
          }}
        />

        {/* Pregunta / Llamado a la Acción */}
        <div style={{ maxWidth: 780 }}>
          <h3
            style={{
              fontSize: 38,
              fontWeight: 800,
              lineHeight: 1.25,
              color: '#FFFFFF',
              margin: 0,
            }}
          >
            ¿Quieres una demo para tu perfumería?
          </h3>
          <p
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: '#A8A29E',
              marginTop: 14,
              lineHeight: 1.4,
            }}
          >
            Moderniza tu mostrador con formulación exacta en ml, reservas QR y control multisede en tiempo real.
          </p>
        </div>

        {/* Botón WhatsApp */}
        <div
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            color: '#FFFFFF',
            padding: '22px 48px',
            borderRadius: 9999,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: '0 15px 40px rgba(37, 211, 102, 0.45)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 8,
          }}
        >
          <span style={{ fontSize: 32 }}>💬</span>
          <span>WhatsApp: +591 68787985</span>
        </div>

        {/* Píldoras de Propuesta de Valor */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            marginTop: 10,
          }}
        >
          {['Sistema Propio', 'Multi-Sucursal', 'Cero Comisiones'].map((feat, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(216, 185, 142, 0.1)',
                border: '1px solid rgba(216, 185, 142, 0.3)',
                padding: '8px 22px',
                borderRadius: 9999,
                fontSize: 16,
                fontWeight: 700,
                color: '#EBD3B4',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {feat}
            </div>
          ))}
        </div>

        {/* Link / Dominio */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 28px',
            borderRadius: 14,
            fontSize: 18,
            color: '#C5A880',
            fontWeight: 600,
            letterSpacing: '0.08em',
          }}
        >
          🌐 perfumeria-green.vercel.app
        </div>
      </div>
    </div>
  );
};
