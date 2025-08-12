import React, { useEffect, useRef, useState } from 'react'

// Simple utility
const rand = (min, max) => Math.random() * (max - min) + min

function Hero({ onBegin }) {
  // floating hearts in hero using DOM for simplicity
  const heroRef = useRef(null)
  useEffect(() => {
    let mounted = true
    function spawn() {
      if (!mounted || !heroRef.current) return
      const count = Math.floor(window.innerWidth / 40)
      for (let i = 0; i < count; i++) {
        const el = document.createElement('span')
        el.className = 'floating-heart'
        const size = rand(10, 22)
        el.style.width = size + 'px'
        el.style.height = size + 'px'
        el.style.left = rand(-5, 100) + 'vw'
        el.style.bottom = '-20px'
        const dur = rand(8, 18)
        el.style.animationDuration = dur + 's'
        el.style.animationDelay = rand(0, 10) + 's'
        heroRef.current.appendChild(el)
        setTimeout(() => el.remove(), (dur + 10) * 1000)
      }
      setTimeout(spawn, 7000)
    }
    spawn()
    return () => { mounted = false }
  }, [])

  return (
    <header className="hero" ref={heroRef}>
      <div className="hero-inner">
        <h1 className="title">Happy Birthday, <span>Zainab</span> ❤️</h1>
        <p className="subtitle">Counting down to your special day – August 19.</p>
        <Countdown />
        <HeroArt />
        <button className="begin-btn" onClick={onBegin}>Begin</button>
      </div>
      <BalloonField />
      <div className="drip" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="#ffffff" d="M0,64 C120,110 220,110 360,64 C520,10 650,10 820,64 C980,110 1100,110 1240,64 C1350,25 1440,40 1440,40 L1440,120 L0,120 Z"/>
        </svg>
      </div>
    </header>
  )
}

function HeroArt() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // create sparkles
    const count = 14
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span')
      s.className = 'sparkle'
      s.textContent = Math.random() < 0.5 ? '✨' : '✦'
      s.style.left = rand(10, 90) + '%'
      s.style.top = rand(5, 70) + '%'
      s.style.fontSize = rand(10, 18) + 'px'
      s.style.animationDuration = rand(2.5, 5.5) + 's'
      el.appendChild(s)
    }
    return () => { el.querySelectorAll('.sparkle').forEach(n => n.remove()) }
  }, [])
  return (
    <div className="hero-art" ref={ref}>
      <div className="cake">
        <div className="layer l3"><span className="frost"></span></div>
        <div className="layer l2"><span className="frost"></span></div>
        <div className="layer l1"><span className="frost"></span></div>
        <div className="candle c1"><span className="flame"></span></div>
        <div className="candle c2"><span className="flame"></span></div>
        <div className="candle c3"><span className="flame"></span></div>
      </div>
    </div>
  )
}

function BalloonField() {
  const balloons = React.useMemo(() => {
    const arr = []
    const hues = [0, 25, 60, 120, 180, 220, 270, 300]
    for (let i = 0; i < 22; i++) {
      arr.push({ id: i, x: rand(2, 96), y: rand(4, 90), delay: rand(0, 6), duration: rand(7, 12), hue: hues[i % hues.length] })
    }
    return arr
  }, [])
  return (
    <div className="balloon-field" aria-hidden="false">
      {balloons.map(b => (
        <Balloon key={b.id} cfg={b} />
      ))}
    </div>
  )
}

// Interactive emoji balloon → gift → heart
function Balloon({ cfg }) {
  const [stage, setStage] = useState('balloon')
  const throwVec = React.useMemo(() => ({ x: rand(-26, 26), y: rand(-60, -28), rot: rand(-25, 25) }), [])
  const heartVec = React.useMemo(() => ({ x: throwVec.x * 1.2, y: throwVec.y * 1.35, rot: throwVec.rot * 1.2 }), [throwVec])

  const styleWrap = { left: cfg.x + '%', top: cfg.y + '%', animationDelay: cfg.delay + 's', animationDuration: cfg.duration + 's' }
  const isStatic = stage !== 'balloon' && stage !== 'balloon-pop'

  return (
    <div className={`balloon-wrap${isStatic ? ' static' : ''}`} style={styleWrap}>
      {stage === 'balloon' && (
        <button className="emoji-balloon" style={{ ['--hue']: `${cfg.hue}deg` }} onClick={() => setStage('balloon-pop')} aria-label="Balloon">🎈</button>
      )}
      {stage === 'balloon-pop' && (
        <span className="emoji-balloon pop" style={{ ['--hue']: `${cfg.hue}deg` }} onAnimationEnd={() => setStage('gift-throw')} aria-hidden="true">🎈</span>
      )}
      {stage === 'gift-throw' && (
        <span className="emoji-pop gift throwing" onAnimationEnd={() => setStage('gift')} style={{ ['--tx']: `${throwVec.x}px`, ['--ty']: `${throwVec.y}px`, ['--rot']: `${throwVec.rot}deg` }} aria-hidden="true">🎁</span>
      )}
      {stage === 'gift' && (
        <button className="emoji-pop gift" style={{ transform: `translate(${throwVec.x}px, ${throwVec.y}px) rotate(${throwVec.rot}deg)` }} onClick={() => setStage('heart-throw')} aria-label="Gift">🎁</button>
      )}
      {stage === 'heart-throw' && (
        <span className="emoji-pop heart throwing" onAnimationEnd={() => setStage('heart')} style={{ ['--tx']: `${heartVec.x}px`, ['--ty']: `${heartVec.y}px`, ['--rot']: `${heartVec.rot}deg` }} aria-hidden="true">❤️</span>
      )}
      {stage === 'heart' && (
        <span className="emoji-pop heart" style={{ transform: `translate(${heartVec.x}px, ${heartVec.y}px) rotate(${heartVec.rot}deg)` }} aria-hidden="true">❤️</span>
      )}
    </div>
  )
}

// Countdown to August 19 (next occurrence)
function Countdown() {
  const [time, setTime] = useState(getTimeRemaining())
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeRemaining()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="countdown-card" role="timer" aria-live="polite">
      {[
        { label: 'Days', value: time.days },
        { label: 'Hours', value: time.hours },
        { label: 'Minutes', value: time.minutes },
        { label: 'Seconds', value: time.seconds }
      ].map((t) => (
        <div className="cd-seg" key={t.label}>
          <div className="cd-num">{String(t.value).padStart(2, '0')}</div>
          <div className="cd-lbl">{t.label}</div>
        </div>
      ))}
    </div>
  )
}

function getTimeRemaining() {
  const now = new Date()
  const thisYear = now.getFullYear()
  // Months are 0-indexed: 7 is August
  let target = new Date(thisYear, 7, 19, 0, 0, 0, 0)
  if (target.getTime() <= now.getTime()) {
    target = new Date(thisYear + 1, 7, 19, 0, 0, 0, 0)
  }
  const diff = Math.max(0, target - now)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

function LoveBox({ onYes }) {
  const boxRef = useRef(null)
  const btnsRef = useRef(null)
  const noRef = useRef(null)
  const [pos, setPos] = useState({ x: 160, y: 0, rot: 0, scale: 1, radius: 999 })

  // Click to dodge with a smooth morphing motion
  const dodge = () => {
    const container = btnsRef.current
    const btn = noRef.current
    if (!container || !btn) return
    const rect = container.getBoundingClientRect()
    const b = btn.getBoundingClientRect()
    const margin = 8
    const maxX = Math.max(0, rect.width - b.width - margin)
    const maxY = Math.max(0, rect.height - b.height - margin)
    const x = rand(margin, maxX)
    const y = rand(margin, maxY)
    const rot = rand(-18, 18)
    const scale = rand(0.95, 1.1)
    const radius = Math.round(rand(16, 34))
    setPos({ x, y, rot, scale, radius })
  }

  return (
    <section className="love-cta" id="love">
      <div className="container">
        <div className="love-box reveal" ref={boxRef}>
          <h2 className="section-title">Do you love me? 💖</h2>
          <h3 className="muted">Be honest... your heart knows the answer!</h3>
          <div className="btns mt-12" ref={btnsRef}>
            <button className="btn btn-yes" onClick={onYes}>Yes</button>
            <button
              className="btn btn-no dodge"
              ref={noRef}
              onClick={dodge}
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rot}deg) scale(${pos.scale})`,
                borderRadius: pos.radius + 'px'
              }}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function SmartImage({ base, alt, contain = false }) {
  const [src, setSrc] = useState(`${base}.jpeg`)
  const fallbacks = useRef([`${base}.jpg`, `${base}.png`, `${base}.webp`, 'placeholder'])
  return (
    <img
      src={src}
      alt={alt}
      style={contain ? { objectFit: 'contain', background: 'rgba(255,255,255,0.8)' } : undefined}
      loading="lazy"
      onError={() => {
        const next = fallbacks.current.shift()
        if (!next) return
        if (next === 'placeholder') {
          setSrc('https://images.unsplash.com/photo-1529336953121-dc2d788f6e3d?q=80&w=1400&auto=format&fit=crop')
        } else {
          setSrc(next)
        }
      }}
    />
  )
}

function Memories() {
  return (
    <section id="memories">
      <div className="container">
        <h2 className="section-title">Our Sweet Memories</h2>
        <p className="center muted">A little timeline of moments that made my heart smile.</p>
        <div className="timeline">
          {[
            {
              base: '/memories/wa-1',
              caption: 'Our first chat that made my life.'
            },
            {
              base: '/memories/wa-2',
              caption: 'The day I proposed to you.'
            },
            {
              base: '/memories/little-zainab',
              caption: 'Little Zainab — the cutest smile.',
              tall: true
            },
            {
              base: '/memories/us',
              caption: 'You and me — my favorite picture.'
            }
          ].map((m, i) => (
            <article className="memory reveal" key={i}>
              <span className="dot" aria-hidden="true"></span>
              <div className={`memory-card`}>
                {m.base ? (
                  <SmartImage base={m.base} alt="memory" contain={true} />
                ) : (
                  <img src={m.src} alt="memory" />
                )}
                <div className="caption">{m.caption}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Wishes() {
  return (
    <section className="wishes" id="wishes">
      <div className="container">
        <h2 className="section-title">My Birthday Wish for You</h2>
        <div className="wish-card reveal">
          <p className="wish-text">
            I love you, my Zainu ❤️<br/>
            Advance Happy Birthday, meri jaan 🎂✨<br/>
            <br/>
            Bohat achi lagti ho tum 💕<br/>
            I love you so much, and I’m waiting for the day you’ll be in my life<br/>
            so we can cut your cake together and make every birthday unforgettable. 🎉🍰
            <br/>
            <br/>
            Be forever happy and keep smiling,<br/>
            May your life be long, healthy, and full of beautiful moments.<br/>
            May you always be blessed with abundance,<br/>
            and may your journey be surrounded by endless love and deep respect.
          </p>
        </div>
      </div>
    </section>
  )
}

function Gallery() {
  return (
    <section className="gallery" id="gallery">
      <div className="container">
        <h2 className="section-title">Gallery</h2>
        <div className="locked-card reveal">
          <div className="lock-emoji" aria-hidden>🔒</div>
          <div className="locked-title">Coming soon</div>
          <p className="locked-text">I’m collecting our favorite photos. Check back here soon, my love.</p>
        </div>
      </div>
    </section>
  )
}

function Closing() {
  useEffect(() => {
    const closing = document.getElementById('closing')
    if (!closing) return
    function spawn() {
      for (let i = 0; i < 18; i++) {
        const el = document.createElement('span')
        el.className = 'float-heart'
        const s = rand(8, 18)
        el.style.width = s + 'px'
        el.style.height = s + 'px'
        el.style.left = rand(0, 100) + 'vw'
        el.style.bottom = rand(-10, 20) + 'px'
        el.style.animationDuration = rand(8, 16) + 's'
        el.style.opacity = rand(0.5, 0.95)
        closing.appendChild(el)
        setTimeout(() => el.remove(), 16000)
      }
      setTimeout(spawn, 6000)
    }
    spawn()
  }, [])
  return (
    <footer className="closing" id="closing">
      <h2>I love you forever 💕</h2>
      <p>From now until always.</p>
      <div className="credit">made with love by <strong>Your Talha</strong></div>
    </footer>
  )
}

// CanvasOverlay draws fast full-screen hearts and red roses burst
function CanvasOverlay({ trigger, origin }) {
  const canvasRef = useRef(null)
  const requestRef = useRef()
  const particlesRef = useRef([])
  const roseSpritesRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    // clamp DPR for performance
    const dpr = Math.min(1.25, Math.max(1, window.devicePixelRatio || 1))
    const resize = () => {
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      canvas.style.width = '100vw'
      canvas.style.height = '100vh'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)
    // pre-render multiple flower emojis to offscreen canvases (uses native emoji font on device)
    if (!roseSpritesRef.current) {
      const emojis = ['🌹', '🌺', '🌷', '🌸', '💐']
      roseSpritesRef.current = emojis.map((em) => {
        const rc = document.createElement('canvas')
        rc.width = 128; rc.height = 128
        const rctx = rc.getContext('2d')
        rctx.textAlign = 'center'
        rctx.textBaseline = 'middle'
        // Prefer Apple Color Emoji when available (iPhone/iPad), then others
        rctx.font = "110px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"
        rctx.fillText(em, 64, 70)
        return rc
      })
    }

    const drawHeart = (p) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot || 0)
      ctx.scale(p.size, p.size)
      ctx.fillStyle = 'rgba(255,105,135,0.95)'
      const r = 10
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(-r, 0, r, 0, Math.PI, true)
      ctx.arc(0, -r, r, 0, Math.PI, true)
      ctx.lineTo(0, r * 2)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    const drawRose = (p) => {
      const sprites = roseSpritesRef.current || []
      const src = sprites[p.spriteIndex % sprites.length]
      if (!src) return
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot || 0)
      const base = 40
      const w = base * p.size
      const h = base * p.size
      ctx.drawImage(src, -w / 2, -h / 2, w, h)
      ctx.restore()
    }
    const step = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.vy += 0.1
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.992
        p.vy *= 0.992
        if (p.rotV) p.rot += p.rotV
        p.life -= 1
        if (p.kind === 'heart') drawHeart(p)
        else drawRose(p)
        if (p.life <= 0 || p.y > innerHeight + 40) {
          particles.splice(i, 1)
        }
      }
      if (particles.length > 0) requestRef.current = requestAnimationFrame(step)
      else cancelAnimationFrame(requestRef.current)
    }

    const burst = () => {
      const particles = particlesRef.current
      // dense but optimized: cap particle count and scale with screen size
      const count = Math.min(480, Math.floor((innerWidth + innerHeight) / 2))
      const ox = origin?.x ?? innerWidth / 2
      const oy = origin?.y ?? innerHeight / 2
      for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2)
        const speed = rand(2, 6) * (1 + Math.random())
        const vx = Math.cos(angle) * speed
        const vy = Math.sin(angle) * speed
        particles.push({
          x: ox + rand(-6, 6),
          y: oy + rand(-6, 6),
          vx, vy,
          size: rand(0.7, 1.4),
          life: rand(60, 120),
          kind: Math.random() < 0.3 ? 'heart' : 'rose',
          rot: rand(-Math.PI, Math.PI),
          rotV: rand(-0.05, 0.05),
          spriteIndex: Math.floor(rand(0, 5))
        })
      }
      cancelAnimationFrame(requestRef.current)
      requestRef.current = requestAnimationFrame(step)
    }

    if (trigger) burst()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(requestRef.current) }
  }, [trigger, origin])

  return <canvas ref={canvasRef} className={`fx-canvas ${trigger ? 'show' : ''}`} />
}

export default function App() {
  const [showCanvas, setShowCanvas] = useState(false)
  const [origin, setOrigin] = useState(null)

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); obs.unobserve(e.target) } })
    }, { threshold: 0.15 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const handleBegin = () => {
    document.getElementById('love').scrollIntoView({ behavior: 'smooth' })
  }
  const handleYes = (e) => {
    // compute button center in viewport
    const rect = e.currentTarget.getBoundingClientRect()
    setOrigin({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
    setShowCanvas(false)
    // restart animation
    requestAnimationFrame(() => setShowCanvas(true))
    // tiny chime
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const o = ctx.createOscillator(); const g = ctx.createGain()
      o.type = 'sine'; o.frequency.setValueAtTime(660, ctx.currentTime)
      o.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.15)
      g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
      o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  return (
    <>
      <Hero onBegin={handleBegin} />
      <LoveBox onYes={handleYes} />
      <CanvasOverlay trigger={showCanvas} origin={origin} />
      <Memories />
      <Wishes />
      <Gallery />
      <Closing />
    </>
  )
}


