import React, { useEffect, useRef } from "react";

/**
 * FuturisticNeuralBackground
 * High-performance HTML5 Canvas neural constellation & star-field engine.
 * - Hundreds of glowing micro-particles
 * - Proximity-based dynamic connecting lines (neural network effect)
 * - Gentle ambient floating motion + subtle mouse parallax
 * - Multi-layer dark vignette & gradient overlay for crystal-clear readability
 */
const FuturisticNeuralBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse coordinates for gentle parallax interaction
    const mouse = {
      x: null,
      y: null,
      radius: 140,
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    // Node / Star particle definition
    const PARTICLE_COUNT_DESKTOP = 100;
    const PARTICLE_COUNT_MOBILE = 45;
    const CONNECTION_DISTANCE = 115;
    let particles = [];

    const initCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();
    };

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = initial ? Math.random() * width : (Math.random() < 0.5 ? 0 : width);
        this.y = Math.random() * height;
        // Subtle variable speeds for depth parallax
        const speedMultiplier = 0.25 + Math.random() * 0.45;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speedMultiplier;
        this.vy = Math.sin(angle) * speedMultiplier;

        // Size variation: mostly tiny stars, a few larger glowing neural hubs
        const isHub = Math.random() < 0.12;
        this.radius = isHub ? 2.0 + Math.random() * 1.5 : 0.8 + Math.random() * 1.2;
        this.isHub = isHub;

        // Colors: subtle emerald, cyan, and silvery white
        const colorPicker = Math.random();
        if (colorPicker > 0.65) {
          this.color = "16, 185, 129"; // emerald
        } else if (colorPicker > 0.35) {
          this.color = "6, 182, 212"; // cyan
        } else {
          this.color = "226, 232, 240"; // slate-200
        }

        this.baseAlpha = isHub ? 0.65 + Math.random() * 0.3 : 0.25 + Math.random() * 0.45;
        this.pulseSpeed = 0.015 + Math.random() * 0.025;
        this.pulsePhase = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Smooth wrap-around
        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;

        // Gentle interactive mouse deflection
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.hypot(dx, dy);
          if (dist < mouse.radius && dist > 0) {
            const force = (1 - dist / mouse.radius) * 0.6;
            this.x -= (dx / dist) * force;
            this.y -= (dy / dist) * force;
          }
        }

        // Pulse glow phase
        this.pulsePhase += this.pulseSpeed;
      }

      draw() {
        const currentAlpha = Math.max(
          0.1,
          this.baseAlpha + Math.sin(this.pulsePhase) * 0.2
        );

        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        // Radial glow for larger hub particles
        if (this.isHub) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgba(${this.color}, ${currentAlpha * 0.85})`;
        }

        ctx.fillStyle = `rgba(${this.color}, ${currentAlpha})`;
        ctx.fill();
        ctx.restore();
      }
    }

    const initParticles = () => {
      const count = width < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = () => {
      const len = particles.length;
      for (let i = 0; i < len; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < len; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
            const dist = Math.sqrt(distSq);
            // Linear fade based on distance
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.18;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }
    };

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const animate = (time) => {
      // Clear viewport
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        if (!prefersReducedMotion) {
          particles[i].update();
        }
        particles[i].draw();
      }

      // Draw constellation network lines
      drawConnections();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    initCanvasSize();
    animate();

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initCanvasSize();
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none">
      {/* Base deep atmospheric gradient (sports-tech dark) */}
      <div className="absolute inset-0 bg-[#060c18]" />

      {/* Subtle radial lighting vignettes in emerald & cyan */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px]" />
      <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-emerald-600/08 rounded-full blur-[150px]" />

      {/* High performance 60FPS constellation canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Subtle dark gradient overlay ensuring high text readability & contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/80" />
      
      {/* Subtle sports turf grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

export default FuturisticNeuralBackground;
