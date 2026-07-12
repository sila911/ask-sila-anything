import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReactionExplosion() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleBurst = (e) => {
      const { x, y, emoji } = e.detail;
      if (x === undefined || y === undefined || !emoji) return;

      const particleCount = 12; // Beautiful dense burst
      const newParticles = [];

      for (let i = 0; i < particleCount; i++) {
        // Upward spreading trajectory
        // Spread angle: mostly pointing upwards (-120 to -60 degrees, or -2.1 to -1.0 radians)
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.6); // 108 deg spread
        const speed = 120 + Math.random() * 160; // Launch velocity / distance
        
        const tx = Math.cos(angle) * speed;
        const ty = Math.sin(angle) * speed - 50; // Extra upward boost

        newParticles.push({
          id: `${Date.now()}-${Math.random()}`,
          emoji,
          x,
          y,
          tx,
          ty,
          scale: 0.5 + Math.random() * 0.9,
          rotation: (Math.random() - 0.5) * 45,
          targetRotation: (Math.random() - 0.5) * 360,
          duration: 0.8 + Math.random() * 0.6, // Staggered fade times
        });
      }

      setParticles((prev) => [...prev, ...newParticles]);
    };

    window.addEventListener("trigger-emoji-burst", handleBurst);
    return () => window.removeEventListener("trigger-emoji-burst", handleBurst);
  }, []);

  const removeParticle = (id) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: p.x, y: p.y, rotate: p.rotation }}
            animate={{
              opacity: [1, 1, 0.7, 0],
              scale: [0.1, p.scale, p.scale * 0.8, 0],
              x: p.x + p.tx,
              y: p.y + p.ty,
              rotate: p.targetRotation,
            }}
            transition={{
              duration: p.duration,
              ease: [0.1, 0.8, 0.3, 1], // Custom overshoot bezier for pleasant float
            }}
            onAnimationComplete={() => removeParticle(p.id)}
            className="absolute pointer-events-none select-none text-xl sm:text-2xl"
            style={{
              left: 0,
              top: 0,
              transform: "translate(-50%, -50%)",
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
