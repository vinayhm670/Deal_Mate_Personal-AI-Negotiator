import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles, X, Rocket, Flame } from 'lucide-react';

interface SparkTrail {
  x: number;
  y: number;
  alpha: number;
  color: string;
  size: number;
}

interface StarburstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  gravity: number;
  friction: number;
  flickerRate: number;
  flickerOffset: number;
  trails: SparkTrail[];
  willow: boolean;
}

interface FlashWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface RocketShell {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  shellType: 'willow' | 'peony' | 'chrysanthemum' | 'twinkle';
  sparks: { x: number; y: number; alpha: number; size: number }[];
}

// Realistic Diwali Festival Color Palettes
const PALETTES = [
  // 1. Classic Golden Brocade Willow
  ['#FFE066', '#FFD700', '#FFA500', '#FFFFFF', '#FFF8DC'],
  // 2. Imperial Saffron & Gold
  ['#FF8C00', '#FFA500', '#FFD700', '#FFDF00', '#FFF275'],
  // 3. Festive Ruby & Champagne
  ['#FF1E56', '#FF4E79', '#FFD700', '#FFAA00', '#FFFFFF'],
  // 4. Emerald & Golden Stars
  ['#00E676', '#10B981', '#FFD700', '#76FF03', '#FFFFFF'],
  // 5. Royal Saffron & Amethyst
  ['#FF9100', '#FFAB40', '#D500F9', '#E040FB', '#FFD700'],
];

// High-fidelity Web Audio API for Realistic Diwali Sky Shots
class RealisticFireworkAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic ascending rocket whistle/whoosh
  playLaunch() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.55);
      filter.Q.setValueAtTime(3.5, now);

      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(1150, now + 0.55);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // Audio gesture required
    }
  }

  // Realistic explosive air burst (Deep Sub-Bass Thump + Resonance + Crackle)
  playBurst(shellType?: string) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 1. Heavy resonant explosion thump
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(160, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.38);

      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.38);

      // 2. Realistic blast wave noise punch
      const blastLen = this.ctx.sampleRate * 0.18;
      const blastBuf = this.ctx.createBuffer(1, blastLen, this.ctx.sampleRate);
      const blastData = blastBuf.getChannelData(0);
      for (let i = 0; i < blastLen; i++) {
        blastData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (blastLen * 0.15));
      }
      const blastSource = this.ctx.createBufferSource();
      blastSource.buffer = blastBuf;
      const blastFilter = this.ctx.createBiquadFilter();
      blastFilter.type = 'lowpass';
      blastFilter.frequency.setValueAtTime(800, now);
      blastFilter.frequency.exponentialRampToValueAtTime(180, now + 0.18);

      const blastGain = this.ctx.createGain();
      blastGain.gain.setValueAtTime(0.2, now);
      blastGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      blastSource.connect(blastFilter);
      blastFilter.connect(blastGain);
      blastGain.connect(this.ctx.destination);
      blastSource.start(now);

      // 3. Secondary sizzling sparks & crackle
      const crackleLen = this.ctx.sampleRate * 0.45;
      const crackleBuf = this.ctx.createBuffer(1, crackleLen, this.ctx.sampleRate);
      const crackleData = crackleBuf.getChannelData(0);
      for (let i = 0; i < crackleLen; i++) {
        // Intermittent popping sparks
        const pop = Math.random() > 0.94 ? (Math.random() * 2 - 1) * 1.5 : (Math.random() * 2 - 1) * 0.1;
        crackleData[i] = pop * Math.exp(-i / (crackleLen * 0.4));
      }
      const crackleSource = this.ctx.createBufferSource();
      crackleSource.buffer = crackleBuf;
      const crackleFilter = this.ctx.createBiquadFilter();
      crackleFilter.type = 'bandpass';
      crackleFilter.frequency.setValueAtTime(2400, now);

      const crackleGain = this.ctx.createGain();
      crackleGain.gain.setValueAtTime(shellType === 'chrysanthemum' ? 0.18 : 0.08, now + 0.05);
      crackleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      crackleSource.connect(crackleFilter);
      crackleFilter.connect(crackleGain);
      crackleGain.connect(this.ctx.destination);
      crackleSource.start(now + 0.05);
    } catch {
      // Audio error ignore
    }
  }
}

const audioFX = new RealisticFireworkAudio();

interface DiwaliCelebrationProps {
  isDiwaliMode: boolean;
  onToggleDiwaliMode?: () => void;
}

export const DiwaliCelebration: React.FC<DiwaliCelebrationProps> = ({
  isDiwaliMode,
  onToggleDiwaliMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isChipVisible, setIsChipVisible] = useState<boolean>(true);

  const rocketsRef = useRef<RocketShell[]>([]);
  const particlesRef = useRef<StarburstParticle[]>([]);
  const flashesRef = useRef<FlashWave[]>([]);
  const lastLaunchTimeRef = useRef<number>(0);

  useEffect(() => {
    audioFX.enabled = soundEnabled;
  }, [soundEnabled]);

  // Create high-realism spherical starburst with cascading shimmer trails
  const createRealisticSkyBurst = useCallback((x: number, y: number, shellType: RocketShell['shellType'], customColor?: string) => {
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const primaryColor = customColor || palette[0];
    audioFX.playBurst(shellType);

    // 1. Sky Flash Wave (brief realistic ambient illumination)
    flashesRef.current.push({
      x,
      y,
      radius: 20,
      maxRadius: 180,
      alpha: 0.35,
      color: primaryColor,
    });

    // 2. Starburst Particles in 3D Spherical Geometry
    const count = shellType === 'willow' ? 85 : shellType === 'chrysanthemum' ? 75 : 65;

    for (let i = 0; i < count; i++) {
      // Spherical 3D distribution projected to 2D
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const speed = Math.random() * (shellType === 'willow' ? 4.2 : 5.8) + 1.8;

      const vx = speed * Math.sin(phi) * Math.cos(theta);
      const vy = speed * Math.sin(phi) * Math.sin(theta);

      const color = palette[Math.floor(Math.random() * palette.length)];

      particlesRef.current.push({
        x,
        y,
        vx,
        vy,
        color,
        alpha: 1,
        decay: shellType === 'willow' ? Math.random() * 0.011 + 0.007 : Math.random() * 0.016 + 0.012,
        size: Math.random() * 2.5 + 1.4,
        gravity: shellType === 'willow' ? 0.075 : 0.065, // Realistic drooping gravity
        friction: shellType === 'willow' ? 0.965 : 0.975, // Air resistance
        flickerRate: Math.random() * 0.4 + 0.2,
        flickerOffset: Math.random() * Math.PI * 2,
        trails: [],
        willow: shellType === 'willow',
      });
    }

    // Secondary micro-sparkler core (dense sparkling center)
    for (let j = 0; j < 24; j++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.8 + 0.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#FFFFFF',
        alpha: 1,
        decay: 0.035,
        size: Math.random() * 2 + 1,
        gravity: 0.02,
        friction: 0.93,
        flickerRate: 0.5,
        flickerOffset: Math.random() * Math.PI,
        trails: [],
        willow: false,
      });
    }
  }, []);

  // Launch ascending Diwali rocket
  const launchRocket = useCallback((targetX?: number, targetY?: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const startX = targetX !== undefined ? targetX : Math.random() * (canvas.width * 0.7) + canvas.width * 0.15;
    const destY = targetY !== undefined ? targetY : Math.random() * (canvas.height * 0.38) + canvas.height * 0.12;

    const types: RocketShell['shellType'][] = ['willow', 'peony', 'chrysanthemum', 'twinkle'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const chosenPalette = PALETTES[Math.floor(Math.random() * PALETTES.length)];

    audioFX.playLaunch();

    rocketsRef.current.push({
      x: startX,
      y: canvas.height,
      vx: (Math.random() - 0.5) * 1.1,
      vy: -(Math.random() * 2.5 + 10.5),
      targetY: destY,
      color: chosenPalette[0],
      shellType: chosenType,
      sparks: [],
    });
  }, []);

  // User Interactive Launch on Click
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('.diwali-chip')
      ) {
        return;
      }

      launchRocket(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [launchRocket]);

  // Main 60FPS Realistic Animation Loop
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

      // Automatic gentle celebration shots every 3.8 seconds
      if (time - lastLaunchTimeRef.current > 3800) {
        lastLaunchTimeRef.current = time;
        launchRocket();
      }

      // Use 'lighter' additive blend mode for hyper-realistic firework glow
      ctx.globalCompositeOperation = 'lighter';

      // 1. Render Sky Flashes (Ambient light burst)
      for (let i = flashesRef.current.length - 1; i >= 0; i--) {
        const f = flashesRef.current[i];
        f.radius += (f.maxRadius - f.radius) * 0.15;
        f.alpha *= 0.88;

        if (f.alpha <= 0.01) {
          flashesRef.current.splice(i, 1);
          continue;
        }

        const radGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
        radGrad.addColorStop(0, `rgba(255, 240, 200, ${f.alpha * 0.6})`);
        radGrad.addColorStop(0.5, `rgba(255, 180, 50, ${f.alpha * 0.3})`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Render Ascending Rockets with realistic fuse spark exhaust
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];

        // Emit falling spark exhaust
        r.sparks.push({
          x: r.x + (Math.random() - 0.5) * 3,
          y: r.y + Math.random() * 4,
          alpha: 1,
          size: Math.random() * 2 + 1,
        });

        // Update exhaust sparks
        for (let s = r.sparks.length - 1; s >= 0; s--) {
          const sp = r.sparks[s];
          sp.y += 1.2;
          sp.alpha -= 0.12;
          if (sp.alpha <= 0) {
            r.sparks.splice(s, 1);
            continue;
          }
          ctx.fillStyle = `rgba(255, 215, 0, ${sp.alpha})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw brilliant rocket head
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        r.x += r.vx;
        r.y += r.vy;

        // Gravity slows rocket slightly as it reaches apex
        r.vy += 0.08;

        // Detonate at apex or when upward momentum stalls
        if (r.y <= r.targetY || r.vy >= -1) {
          createRealisticSkyBurst(r.x, r.y, r.shellType, r.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // 3. Render Starburst Sparks with Shimmering Droop Trails
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        // Add to shimmering droop trail
        if (Math.random() > 0.3) {
          p.trails.push({
            x: p.x,
            y: p.y,
            alpha: p.alpha * 0.8,
            color: p.color,
            size: p.size * 0.7,
          });
        }
        if (p.trails.length > 5) p.trails.shift();

        // Render droop trails
        for (let t = p.trails.length - 1; t >= 0; t--) {
          const tr = p.trails[t];
          tr.alpha -= 0.14;
          if (tr.alpha <= 0) {
            p.trails.splice(t, 1);
            continue;
          }
          ctx.fillStyle = tr.color;
          ctx.globalAlpha = tr.alpha;
          ctx.beginPath();
          ctx.arc(tr.x, tr.y, tr.size, 0, Math.PI * 2);
          ctx.fill();
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        // Realistic festive twinkling shimmer
        const shimmer = 0.6 + 0.4 * Math.sin(time * 0.02 * p.flickerRate + p.flickerOffset);
        const currentAlpha = Math.max(0, p.alpha * shimmer);

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [createRealisticSkyBurst, launchRocket]);

  return (
    <>
      {/* High-Fidelity Transparent Fireworks Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-20"
      />

      {/* Clean Diwali Announcement Bar */}
      <div className="relative z-40 bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-500/90 text-amber-50 px-3 py-1.5 text-xs font-medium shadow-xs border-b border-amber-400/30 flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base select-none">🪔</span>
            <span className="font-bold text-amber-200">Diwali Dhamaka Fest:</span>
            <span className="hidden sm:inline text-amber-100">
              Live realistic Diwali sky shots & AI-negotiated festive discounts!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => launchRocket()}
              className="px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Rocket className="w-3 h-3" />
              <span>Launch Sky Shot</span>
            </button>

            {onToggleDiwaliMode && (
              <button
                onClick={onToggleDiwaliMode}
                className="px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[11px] font-semibold transition-all cursor-pointer"
              >
                {isDiwaliMode ? 'Diwali Active' : 'Enable'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discreet Minimal Floating Controller Chip */}
      {isChipVisible && (
        <div className="diwali-chip fixed bottom-5 left-5 z-40 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border border-amber-500/40 text-white shadow-xl backdrop-blur-md text-xs select-none">
          <span className="text-sm">🪔</span>
          <span className="text-amber-300 font-semibold hidden sm:inline">Diwali Sky Shots</span>

          <button
            onClick={() => launchRocket()}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
          >
            <Rocket className="w-3 h-3" /> Shoot
          </button>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              soundEnabled ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Realistic Firecracker Audio"
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
