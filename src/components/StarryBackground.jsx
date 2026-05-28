import React, { useMemo } from 'react';

/**
 * StarryBackground Component
 * Creates a premium animated space background with twinkly stars and shooting meteors.
 */
function StarryBackground() {
  const meteors = useMemo(() => {
    // Increase count and vary properties for a richer look
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 50}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${3 + Math.random() * 4}s`,
      size: `${1 + Math.random() * 2}px`
    }));
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden bg-[#0a0015]">
      {/* Deep cosmic gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, #1a0a2e 0%, #0a0015 100%)'
        }}
      />
      
      {/* Static Star Field Layer 1 (Small) */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(1px 1px at 20px 30px, #fff, transparent), radial-gradient(1px 1px at 40px 70px, #fff, transparent), radial-gradient(1.5px 1.5px at 150px 150px, #fff, transparent)',
        backgroundSize: '250px 250px',
        backgroundRepeat: 'repeat'
      }} />

      {/* Twinkling Star Field Layer 2 (Colorful) */}
      <div className="absolute inset-0 opacity-40 animate-twinkle-slow" style={{
        backgroundImage: 'radial-gradient(2px 2px at 100px 100px, #ffb3d1, transparent), radial-gradient(2px 2px at 250px 250px, #b39ddb, transparent), radial-gradient(2px 2px at 450px 50px, #ffd54f, transparent)',
        backgroundSize: '500px 500px',
        backgroundRepeat: 'repeat'
      }} />

      {/* Meteors (Shooting Stars) */}
      <div className="absolute inset-0">
        {meteors.map((m) => (
          <div
            key={m.id}
            className="absolute opacity-0 animate-meteor"
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: '120px',
              animationDelay: m.delay,
              animationDuration: m.duration,
              background: 'linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 100%)',
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)',
              transformOrigin: 'top center'
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes twinkle-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes meteor {
          0% { 
            transform: rotate(-45deg) translateY(-200px); 
            opacity: 0; 
          }
          1% { 
            opacity: 1; 
          }
          8% { 
            transform: rotate(-45deg) translateY(600px); 
            opacity: 0; 
          }
          100% { 
            transform: rotate(-45deg) translateY(600px); 
            opacity: 0; 
          }
        }
        .animate-twinkle-slow { animation: twinkle-slow 6s ease-in-out infinite; }
        .animate-meteor { animation: meteor linear infinite; }
        .fixed { position: fixed; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .pointer-events-none { pointer-events: none; }
        .-z-10 { z-index: -10; }
        .overflow-hidden { overflow: hidden; }
        .absolute { position: absolute; }
        .opacity-0 { opacity: 0; }
        .opacity-30 { opacity: 0.3; }
        .opacity-40 { opacity: 0.4; }
      `}</style>
    </div>
  );
}

export default StarryBackground;

