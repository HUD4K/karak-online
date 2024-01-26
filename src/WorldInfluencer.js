export class WorldInfluencer {
    static shakeScreen(duration) {
        const body = document.body;
        body.style.overflow = 'hidden'; // disable scrolling
        const startTime = Date.now();
      
        const shake = () => {
          const elapsedTime = Date.now() - startTime;
          const relativeTime = elapsedTime / duration;
      
          if (relativeTime < 1) {
            const x = (Math.random() - 0.5) * 12;
            const y = (Math.random() - 0.5) * 12;
            body.style.transform = `translate(${x}px, ${y}px)`;
      
            requestAnimationFrame(shake);
          } else {
            body.style.transform = 'translate(0px, 0px)';
          }
        };
      
        shake();
    }
}