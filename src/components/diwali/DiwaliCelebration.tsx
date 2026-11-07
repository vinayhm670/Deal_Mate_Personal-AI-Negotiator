import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Flame, Volume2, VolumeX, Move, X, Eye, EyeOff, Zap } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  flicker?: boolean;
}

interface Rocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

interface Chakri {
  x: number;
  y: number;
  angle: number;
  radius: number;
  duration: number;
  life: number;
}

const FESTIVE_COLORS = [
  '#FFD700', // Gold
  '#FFA500', // Saffron / Orange
  '#FF3366', // Ruby Red
  '#00FF88', // Emerald Green
  '#9933FF', // Royal Purple
  '#00E5FF', // Cyan Spark
  '#FFF275', // Light Yellow
  '#FF70A6', // Festive Pink
];

// Web Audio API Synthesizer for Festive Firecracker Sounds
class FireworkAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

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

  // Rocket launch whistle/whoosh
  playWhoosh() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio might be blocked before first user gesture
    }
  }

  // Firecracker explosion boom + crackle
  playBurst() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Deep boom
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

      oscGain.gain.setValueAtTime(0.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);

      // Sparkle crackle noise
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2400, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch {
      // Audio context error ignore
    }
  }

  // Chakri spinning hum
  playChakri() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 1.5);
      osc.frequency.linearRampToValueAtTime(300, now + 3);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.2);
    } catch {
      // Ignore
    }
  }
}

const audioFX = new FireworkAudio();

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
  const [fireworksDensity, setFireworksDensity] = useState<'high' | 'normal' | 'off'>('normal');
  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(true);
  const [widgetPosition, setWidgetPosition] = useState<{ x: number; y: number }>({ x: 24, y: 100 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number }>({
    startX: 0,
    startY: 0,
    origX: 24,
    origY: 100,
  });

  const particlesRef = useRef<Particle[]>([]);
  const rocketsRef = useRef<Rocket[]>([]);
  const chakrisRef = useRef<Chakri[]>([]);
  const cursorSparklesRef = useRef<Particle[]>([]);
  const lastAutoLaunchRef = useRef<number>(0);

  // Sync sound setting
  useEffect(() => {
    audioFX.enabled = soundEnabled;
  }, [soundEnabled]);

  // Burst explosion
  const createBurst = useCallback((x: number, y: number, color?: string, count: number = 70) => {
    const burstColor = color || FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];
    audioFX.playBurst();

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      const pColor = Math.random() > 0.3 ? burstColor : FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.018 + 0.012,
        color: pColor,
        size: Math.random() * 2.8 + 1.2,
        flicker: Math.random() > 0.5,
      });
    }
  }, []);

  // Launch rocket
  const launchRocket = useCallback((targetX?: number, targetY?: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const startX = targetX !== undefined ? targetX : Math.random() * (canvas.width * 0.8) + canvas.width * 0.1;
    const destY = targetY !== undefined ? targetY : Math.random() * (canvas.height * 0.45) + canvas.height * 0.1;
    const chosenColor = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];

    audioFX.playWhoosh();
    rocketsRef.current.push({
      x: startX,
      y: canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -(Math.random() * 3 + 10),
      targetY: destY,
      color: chosenColor,
      trail: [],
    });
  }, []);

  // Launch Anar (Fountain)
  const launchAnar = useCallback((x?: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const spawnX = x || canvas.width / 2;
    audioFX.playBurst();

    for (let i = 0; i < 90; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
      const speed = Math.random() * 8 + 4;
      particlesRef.current.push({
        x: spawnX,
        y: canvas.height - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.015,
        color: Math.random() > 0.4 ? '#FFD700' : '#FF6600',
        size: Math.random() * 3 + 1.5,
        flicker: true,
      });
    }
  }, []);

  // Light Chakri
  const lightChakri = useCallback((x?: number, y?: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const spawnX = x || canvas.width / 2;
    const spawnY = y || canvas.height * 0.65;
    audioFX.playChakri();

    chakrisRef.current.push({
      x: spawnX,
      y: spawnY,
      angle: 0,
      radius: 35,
      duration: 180,
      life: 0,
    });
  }, []);

  // Cursor movement sparkler trail
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (fireworksDensity === 'off') return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      if (Math.random() > 0.5) {
        cursorSparklesRef.current.push({
          x: clientX,
          y: clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * 2,
          alpha: 1,
          decay: 0.04,
          color: FESTIVE_COLORS[Math.floor(Math.random() * 4)], // Gold, orange, red
          size: Math.random() * 2.5 + 1,
          flicker: true,
        });
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, [fireworksDensity]);

  // Click / Tap anywhere to burst firecrackers
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      // Don't trigger if clicking interactive buttons, inputs, links or modals
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.diwali-interactive-widget')
      ) {
        return;
      }

      if (fireworksDensity !== 'off') {
        createBurst(e.clientX, e.clientY, undefined, 60);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [createBurst, fireworksDensity]);

  // Main Animation Loop
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

      // Auto-launch rockets periodically if enabled
      if (fireworksDensity !== 'off') {
        const interval = fireworksDensity === 'high' ? 1400 : 3200;
        if (time - lastAutoLaunchRef.current > interval) {
          lastAutoLaunchRef.current = time;
          launchRocket();
        }
      }

      // 1. Render & Update Rockets
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.trail.push({ x: r.x, y: r.y, alpha: 1 });
        if (r.trail.length > 8) r.trail.shift();

        // Draw trail
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 100, ${pt.alpha * 0.6})`;
          ctx.fill();
          pt.alpha -= 0.1;
        }

        // Draw rocket head
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        r.x += r.vx;
        r.y += r.vy;

        // Reach target apex
        if (r.y <= r.targetY || r.vy >= 0) {
          createBurst(r.x, r.y, r.color, 80);
          rocketsRef.current.splice(i, 1);
        }
      }

      // 2. Render & Update Chakris (Ground spinning firecrackers)
      for (let i = chakrisRef.current.length - 1; i >= 0; i--) {
        const c = chakrisRef.current[i];
        c.angle += 0.35;
        c.life++;

        // Emit sparks around circumference
        for (let s = 0; s < 4; s++) {
          const a = c.angle + (s * Math.PI) / 2;
          const spX = c.x + Math.cos(a) * c.radius;
          const spY = c.y + Math.sin(a) * c.radius;

          particlesRef.current.push({
            x: spX,
            y: spY,
            vx: Math.cos(a + Math.PI / 2) * (Math.random() * 4 + 3),
            vy: Math.sin(a + Math.PI / 2) * (Math.random() * 4 + 3) + 1,
            alpha: 1,
            decay: 0.04,
            color: s % 2 === 0 ? '#FFD700' : '#FF4500',
            size: Math.random() * 2 + 1,
            flicker: true,
          });
        }

        // Central glowing ring
        ctx.beginPath();
        ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#FFA500';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (c.life >= c.duration) {
          createBurst(c.x, c.y, '#FFD700', 50);
          chakrisRef.current.splice(i, 1);
        }
      }

      // 3. Render & Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07; // Gravity
        p.vx *= 0.985; // Air drag
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.flicker ? Math.max(0, p.alpha * (0.6 + Math.random() * 0.4)) : p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }

      // 4. Render Cursor Sparkles
      for (let i = cursorSparklesRef.current.length - 1; i >= 0; i--) {
        const s = cursorSparklesRef.current[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          cursorSparklesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 6;
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
  }, [fireworksDensity, createBurst, launchRocket]);

  // Widget Dragging Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: widgetPosition.x,
      origY: widgetPosition.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      setWidgetPosition({
        x: Math.max(10, Math.min(window.innerWidth - 280, dragStartRef.current.origX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 340, dragStartRef.current.origY + dy)),
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <>
      {/* Interactive Fireworks Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Diwali Festive Special Top Banner */}
      <div className="relative z-40 bg-gradient-to-r from-amber-600/90 via-rose-600/90 to-amber-500/90 backdrop-blur-md text-amber-50 px-3 py-1.5 text-xs sm:text-sm font-medium shadow-lg border-b border-amber-400/40 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="text-base sm:text-lg animate-bounce select-none">🪔</span>
            <span className="font-bold tracking-wide text-amber-200">Diwali Dhamaka Fest:</span>
            <span className="hidden sm:inline text-amber-100">
              Exclusive AI-negotiated festive discounts + live fireworks!
            </span>
            <span className="sm:hidden text-amber-100">Festive Deals Live!</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onToggleDiwaliMode && (
              <button
                onClick={onToggleDiwaliMode}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5 ${
                  isDiwaliMode
                    ? 'bg-amber-400 text-amber-950 hover:bg-amber-300'
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current text-amber-900" />
                {isDiwaliMode ? 'Diwali Active' : 'Enable Diwali'}
              </button>
            )}

            <button
              onClick={() => setIsWidgetVisible((prev) => !prev)}
              className="p-1 rounded-md hover:bg-black/20 text-amber-100 transition-colors title='Toggle Fireworks Panel'"
            >
              {isWidgetVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Movable Interactive Firecrackers Control Box */}
      {isWidgetVisible && (
        <div
          className="diwali-interactive-widget fixed z-40 w-64 rounded-2xl bg-gradient-to-b from-[#1c0d2b]/95 to-[#10061c]/95 border border-amber-500/50 p-3.5 shadow-[0_12px_36px_rgba(251,191,36,0.3)] backdrop-blur-xl text-amber-100 transition-shadow select-none"
          style={{
            left: `${widgetPosition.x}px`,
            top: `${widgetPosition.y}px`,
            touchAction: 'none',
          }}
        >
          {/* Header & Drag Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-amber-500/20 cursor-move"
          >
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Diwali Crackers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-amber-400/70 flex items-center gap-0.5">
                <Move className="w-3 h-3" /> Drag
              </span>
              <button
                onClick={() => setIsWidgetVisible(false)}
                className="p-0.5 hover:bg-white/10 rounded text-amber-300/80 hover:text-white ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Firecracker Action Triggers */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => launchRocket()}
              className="px-2 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:from-amber-400 hover:to-orange-400 active:scale-95 transition-all shadow-md hover:shadow-amber-500/30 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" /> Rocket 🚀
            </button>
            <button
              onClick={() => lightChakri()}
              className="px-2 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:from-rose-400 hover:to-amber-400 active:scale-95 transition-all shadow-md hover:shadow-rose-500/30 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5" /> Chakri ✨
            </button>
            <button
              onClick={() => launchAnar()}
              className="col-span-2 px-2 py-1.5 rounded-xl bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border border-amber-400/40 text-amber-200 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-500/40 active:scale-95 transition-all cursor-pointer"
            >
              <span>🪔 Light Anar Fountain</span>
            </button>
          </div>

          <p className="text-[10px] text-amber-200/70 text-center mb-2.5">
            💡 Click or tap anywhere on page to ignite crackers!
          </p>

          {/* Quick Controls Bar: Sound & Density */}
          <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-xs">
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                soundEnabled
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/5 text-amber-300/50 hover:bg-white/10'
              }`}
              title="Toggle Firecracker Audio"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{soundEnabled ? 'FX On' : 'Mute'}</span>
            </button>

            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
              {(['off', 'normal', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFireworksDensity(lvl)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase transition-colors cursor-pointer ${
                    fireworksDensity === lvl
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-amber-300/70 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
