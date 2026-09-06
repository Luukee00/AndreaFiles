import React, { useState, useEffect } from 'react';

interface IntroLoaderProps {
  onComplete: () => void;
}

export const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  // Step: 1 = Emblem (Ministero della Giustizia), 2 = Text ("ANDREA'S FILES"), 3 = Fade out
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Step 1 -> Step 2 after 2.1s
    const timer1 = setTimeout(() => {
      setStep(2);
    }, 2100);

    // Step 2 -> Fade out after additional 1.7s (total 3.8s)
    const timer2 = setTimeout(() => {
      setStep(3);
      setIsFadingOut(true);
    }, 3800);

    // Complete intro after fade out animation (4.3s total)
    const timer3 = setTimeout(() => {
      onComplete();
    }, 4300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: isFadingOut ? 'none' : 'auto',
        userSelect: 'none',
      }}
    >
      {/* STEP 1: Emblem */}
      {step === 1 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'introFadeScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <img
            src="public\MinisteroDellaGiustizia.jpg"
            alt="Repubblica Italiana - Ministero della Giustizia"
            style={{
              width: '85vw',
              maxWidth: 320,
              height: 'auto',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
            }}
          />
        </div>
      )}

      {/* STEP 2: ANDREA'S FILES */}
      {(step === 2 || step === 3) && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'introTextReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(24px, 6vw, 38px)',
              fontWeight: 800,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#111827',
              margin: 0,
              textAlign: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            ANDREA'S FILES
          </h1>
          <div
            style={{
              marginTop: 16,
              width: 36,
              height: 2,
              background: '#e5e7eb',
              borderRadius: 2,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes introFadeScale {
          0% {
            opacity: 0;
            transform: scale(0.94);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes introTextReveal {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
