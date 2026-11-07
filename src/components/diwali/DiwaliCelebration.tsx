import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles, X, Rocket } from 'lucide-react';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  flicker: boolean;
}

interface RocketShot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
}

// Warm Diwali festival sky colors: Gold, Amber, Saffron, Crimson, Emerald, White
const DIWALI_COLORS = [
  '#FFD700', // Bright Gold
  '#FFA500', // Saffron Amber
  '#FF4500', // Fiery Orange
  '#FF1744', // Ruby Red
  '#00E676', // Emerald Green
  '#FFF59D', // Golden Yellow
  '#FFFFFF', // Diamond White
];

// Clean sound synthesis for Diwali sky shots
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

  playLaunch() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(1000, now + 0.3);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio restricted without gesture
    }
  }

  playBurst() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Soft low thud
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

      oscGain.gain.setValueAtTime(0.12, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);

      // Light crackle
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3000, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

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

  const sparksRef = useRef<Spark[]>([]);
  const rocketsRef = useRef<RocketShot[]>([]);
  const lastAutoLaunchRef = useRef<number>(0);

  useEffect(() => {
    audioFX.enabled = soundEnabled;
  }, [soundEnabled]);

  // Classic Diwali Spherical Starburst (pure circular glowing sparks, NO lines)
  const createSkyBurst = useCallback((x: number, y: number, color?: string) => {
    const burstColor = color || DIWALI_COLORS[Math.floor(Math.random() * DIWALI_COLORS.length)];
    audioFX.playBurst();

    // Symmetrical starburst
    const sparkCount = 40;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.15;
      const speed = Math.random() * 3.8 + 1.8;

      sparksRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.012,
        color: Math.random() > 0.35 ? burstColor : '#FFD700',
        size: Math.random() * 2.2 + 1.2,
        flicker: Math.random() > 0.3,
      });
    }
  }, []);

  // Launch ascending Diwali rocket
  const launchRocketShot = useCallback((destX?: number, destY?: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const startX = destX !== undefined ? destX : Math.random() * (canvas.width * 0.7) + canvas.width * 0.15;
    const targetY = destY !== undefined ? destY : Math.random() * (canvas.height * 0.35) + canvas.height * 0.1;
    const chosenColor = DIWALI_COLORS[Math.floor(Math.random() * DIWALI_COLORS.length)];

    audioFX.playLaunch();
    rocketsRef.current.push({
      x: startX,
      y: canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(Math.random() * 2.0 + 9.0),
      targetY,
      color: chosenColor,
    });
  }, []);

  // Click anywhere on sky / background to shoot a rocket
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

  // Main Animation Loop: Pure dots and glowing sparks (zero connecting lines)
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

      // Gentle auto-launch every 4 seconds
      if (time - lastAutoLaunchRef.current > 4000) {
        lastAutoLaunchRef.current = time;
        launchRocketShot();
      }

      // 1. Render Rockets (Small ascending golden sparks)
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];

        // Draw small rocket spark head
        ctx.save();
        ctx.fillStyle = '#FFF5B8';
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        r.x += r.vx;
        r.y += r.vy;

        // Explode into starburst at apex
        if (r.y <= r.targetY || r.vy >= 0) {
          createSkyBurst(r.x, r.y, r.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // 2. Render Starburst Sparks (Pure glowing particles, zero lines)
      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const p = sparksRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.055; // Gentle downward gravity
        p.vx *= 0.985; // Air drag
        p.vy *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        // Draw individual spark dot with soft festive glow
        ctx.save();
        ctx.globalAlpha = p.flicker ? Math.max(0, p.alpha * (0.6 + Math.random() * 0.4)) : p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
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
      {/* Clean Sky Canvas (Zero Lines, 100% Transparent, Pointer-Events None) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-20"
      />

      {/* Clean Festive Top Announcement Bar */}
      <div className="relative z-40 bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-500/90 text-amber-50 px-3 py-1.5 text-xs font-medium shadow-xs border-b border-amber-400/30 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🪔</span>
            <span className="font-bold text-amber-200">Diwali Festive Deals:</span>
            <span className="hidden sm:inline text-amber-100">
              Exclusive AI-negotiated festive discounts across all stores!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => launchRocketShot()}
              className="px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Rocket className="w-3 h-3" />
              <span>Launch Rocket</span>
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

      {/* Discreet, Simple Floating Chip (Bottom Left) */}
      {isChipVisible && (
        <div className="diwali-control-chip fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white shadow-xl backdrop-blur-md text-xs select-none">
          <span className="text-sm">🪔</span>
          <span className="text-slate-300 font-medium hidden sm:inline">Diwali Sky Shots</span>

          <button
            onClick={() => launchRocketShot()}
            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
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
