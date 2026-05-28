import React from 'react';
import kittyBase from '../assets/kitty_base.png';
import kittyHappy from '../assets/Kitty_happy.png';
import kittySad from '../assets/Kitty_sad.png';
import kittyDisappointed from '../assets/kitty_disapointed.png';

/**
 * PixelKitty Component
 * Replaced the character with high-quality Pixel Kitty assets.
 * Includes a preloading mechanism to ensure smooth state transitions.
 * 
 * @param {string} state - The current emotion/state of the kitty ('idle', 'happy', 'sad', 'disappointed')
 * @param {number} size - The width of the kitty in pixels
 * @param {boolean} animate - Whether to apply CSS animations
 */
function PixelKitty({ state = 'idle', size = 180, animate = true }) {
  // Preload images
  React.useEffect(() => {
    [kittyBase, kittyHappy, kittySad, kittyDisappointed].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const KITTY_IMAGES = {
    idle: kittyBase,
    happy: kittyHappy,
    sad: kittySad,
    disappointed: kittyDisappointed,
  };

  const imgSrc = KITTY_IMAGES[state] || kittyBase;

  // Use existing animations from global.css
  const getAnimationClass = () => {
    if (!animate) return '';
    switch (state) {
      case 'happy':
        return 'anim-bounce';
      case 'sad':
        return 'anim-shake';
      case 'disappointed':
        return 'anim-shake'; // Using shake for disappointment too
      default:
        return 'anim-float';
    }
  };

  return (
    <div 
      className={`kitty-container ${getAnimationClass()}`}
      style={{
        width: size,
        height: 'auto',
        display: 'inline-block',
        position: 'relative',
        filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}
    >
      {/* Pink Rug */}
      <div style={{
        position: 'absolute',
        bottom: '2%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '75%',
        height: '18%',
        background: 'var(--pink, #ff6b9d)',
        borderRadius: '50%',
        zIndex: 0,
        border: '3px solid #d81b60',
        boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1), 0 8px 15px rgba(255, 107, 157, 0.4)'
      }} />
      <img
        src={imgSrc}
        alt={`Kitty ${state}`}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          imageRendering: 'auto',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}

export default PixelKitty;
