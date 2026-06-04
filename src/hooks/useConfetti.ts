import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const triggerConfetti = (isGood: boolean = true) => {
    // Different colors for good vs bad habits
    const colors = isGood 
      ? ['#10b981', '#34d399', '#059669', '#6ee7b7'] // Emerald/green shades
      : ['#f43f5e', '#fb7185', '#e11d48', '#fda4af']; // Rose/red shades

    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 30,
      colors: colors,
    };

    // Fire confetti from center
    confetti({
      ...defaults,
      particleCount: 50,
      scalar: 1.2,
      shapes: ['circle', 'square'],
      origin: { x: 0.5, y: 0.6 },
    });

    // Add a second burst for more effect
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 30,
        scalar: 0.8,
        shapes: ['circle'],
        origin: { x: 0.5, y: 0.5 },
      });
    }, 100);
  };

  return { triggerConfetti };
};
