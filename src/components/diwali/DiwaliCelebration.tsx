import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles, X, Rocket } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  flicker: boolean;
  history: { x: number; y: number }[];
}

interface RocketShot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number }[];
}

// Authentic Diwali aerial firecracker colors (gold, saffron, ruby, emerald, royal silver)
const DIWALI_SHOT_COLORS = [
  '#FFD700', // Imperial Gold
  '#FFA500', // Saffron Amber
  '#FF3366', // Ruby Red
  '#00FF88', // Emerald Spark
  '#FFDF00', // Glittering Yellow
  '#00E5FF', // Cyan Starlight
  '#FFFFFF', // Diamond White
];

// Clean synthesized Diwali sky shot audio
class SkyShotAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Rocket launch whistle
  playLaunch() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.35);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio not permitted without user gesture
    }
  }

  // Real Diwali sky burst pop & crackle
  playBurst() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Deep initial thud / boom
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.28);

      oscGain.gain.setValueAtTime(0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);

      // Crackle sizzle
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Audio error ignore
    }
  }
}

const audioFX = new SkyShotAudio();

interface DiwaliCelebrationProps {
  isDiwaliMode: boolean;
  onToggleDiwaliMode?: () => void;
}

export const DiwaliCelebration: React.FC<DiwaliCelebrationProps> = ({
  isDiwaliMode,
  onToggleDiwaliMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isChipVisible, setIsChipVisible] = useState<boolean>(true);

  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<RocketShot[]>([]);
  const lastAutoLaunchRef = useRef<number>(0);

  useEffect(() => {
    audioFX.enabled = soundEnabled;
  }, [soundEnabled]);

  // Classic Diwali Spherical Starburst
  const createSkyBurst = useCallback((x: number, y: number, color?: string) => {
    const burstColor = color || DIWALI_SHOT_COLORS[Math.floor(Math.random() * DIWALI_SHOT_COLORS.length)];
    audioFX.playBurst();

    // 45-60 particles radiating outward in a spherical firecracker bloom
    const particleCount = 48;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.2;
      const speed = Math.random() * 4.5 + 2.0;

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.016 + 0.012,
        color: Math.random() > 0.3 ? burstColor : '#FFD700',
        size: Math.random() * 2.2 + 1.2,
        flicker: Math.random() > 0.4,
        history: [],
      });
    }
  }, []);

  // Launch ascending Diwali rocket
  const launchRocketShot = useCallback((destX?: number, destY?: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const startX = destX !== undefined ? destX : Math.random() * (canvas.width * 0.7) + canvas.width * 0.15;
    const targetY = destY !== undefined ? destY : Math.random() * (canvas.height * 0.35) + canvas.height * 0.12;
    const chosenColor = DIWALI_SHOT_COLORS[Math.floor(Math.random() * DIWALI_SHOT_COLORS.length)];

    audioFX.playLaunch();
    rocketsRef.current.push({
      x: startX,
      y: canvas.height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(Math.random() * 2.5 + 9.5),
      targetY,
      color: chosenColor,
      trail: [],
    });
  }, []);

  // Click anywhere on sky / background to shoot a rocket to that spot
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.diwali-control-chip')
      ) {
        return;
      }

      launchRocketShot(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [launchRocketShot]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Gentle auto-launch every 3.5 seconds
      if (time - lastAutoLaunchRef.current > 3500) {
        lastAutoLaunchRef.current = time;
        launchRocketShot();
      }

      // 1. Render Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 6) r.trail.shift();

        // Rocket golden spark trail
        ctx.strokeStyle = 'rgba(255, 200, 80, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          if (t === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Rocket head spark
        ctx.fillStyle = '#FFF5B8';
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        r.x += r.vx;
        r.y += r.vy;

        // Explode at target height
        if (r.y <= r.targetY || r.vy >= 0) {
          createSkyBurst(r.x, r.y, r.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // 2. Render Starburst Firecracker Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > 3) p.history.shift();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // Realistic gravity
        p.vx *= 0.982; // Air resistance
        p.vy *= 0.982;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // Draw particle tail
        if (p.history.length > 1) {
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.5;
          ctx.lineWidth = p.size * 0.8;
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }

        // Draw glowing particle
        ctx.save();
        ctx.globalAlpha = p.flicker ? p.alpha * (0.6 + Math.random() * 0.4) : p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [createSkyBurst, launchRocketShot]);

  return (
    <>
      {/* Background Aerial Firecracker Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-20"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Clean, Simple Festive Top Banner */}
      <div className="relative z-40 bg-gradient-to-r from-amber-600/80 via-orange-600/80 to-amber-500/80 backdrop-blur-md text-amber-50 px-3 py-1.5 text-xs font-medium shadow-xs border-b border-amber-400/30 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🪔</span>
            <span className="font-bold text-amber-200">Diwali Special Deals:</span>
            <span className="hidden sm:inline text-amber-100">
              Enjoy extra festive discounts & AI bargains across all stores!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => launchRocketShot()}
              className="px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Rocket className="w-3 h-3" />
              <span>Shoot Firecracker</span>
            </button>

            {onToggleDiwaliMode && (
              <button
                onClick={onToggleDiwaliMode}
                className="px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold transition-all cursor-pointer"
              >
                {isDiwaliMode ? 'Diwali Theme' : 'Enable'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discreet, Simple Floating Firecracker Chip (Bottom Right) */}
      {isChipVisible && (
        <div className="diwali-control-chip fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white shadow-xl backdrop-blur-md text-xs select-none">
          <span className="text-sm">🪔</span>
          <span className="text-slate-300 font-medium hidden sm:inline">Diwali Sky Shots</span>

          <button
            onClick={() => launchRocketShot()}
            className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <Rocket className="w-3 h-3" /> Shoot
          </button>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              soundEnabled ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsChipVisible(false)}
            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer ml-0.5"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
