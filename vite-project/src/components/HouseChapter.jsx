import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HouseChapter = ({ house, index, totalHouses }) => {
  const containerRef = useRef(null)
  const stickyRef = useRef(null)
  const imageWrapRef = useRef(null)
  const imageRef = useRef(null)
  const auraRef = useRef(null)
  const headingRef = useRef(null)
  const mottoRef = useRef(null)
  const loreRef = useRef(null)
  const badgeRef = useRef(null)
  const metaRef = useRef(null)
  const darkFadeRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main Scrub Timeline pinned for 160% of viewport height
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=160%',
          pin: stickyRef.current,
          scrub: 1.2,
          anticipatePin: 1,
        },
      })

      // Tailored animations based on house persona
      const isTargaryen = house.id === 'targaryen'
      const isGreyjoy = house.id === 'greyjoy'
      const isStark = house.id === 'stark'
      const isLannister = house.id === 'lannister'
      const isTyrell = house.id === 'tyrell'

      // Initial state of visual elements
      let initialImgScale = 1.22
      let initialImgY = 30
      let initialRotation = 0

      if (isTargaryen) {
        initialImgScale = 1.35
        initialRotation = -3
      } else if (isGreyjoy) {
        initialImgY = 60
      } else if (isStark) {
        initialImgScale = 1.28
      } else if (isTyrell) {
        initialImgScale = 1.15
      }

      // PHASE 1: ENTRANCE (0% -> 35% scroll)
      // Background aura glow expands
      tl.fromTo(
        auraRef.current,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1.1, duration: 0.8, ease: 'power2.out' },
        0
      )

      // Sigil Image reveals with custom house motion
      tl.fromTo(
        imageRef.current,
        {
          opacity: 0,
          scale: initialImgScale,
          y: initialImgY,
          rotation: initialRotation,
          filter: isTargaryen
            ? 'brightness(0.3) drop-shadow(0 0 10px rgba(209,52,56,0.2))'
            : isLannister
            ? 'brightness(0.4) drop-shadow(0 0 15px rgba(201,154,46,0.2))'
            : 'brightness(0.4)',
        },
        {
          opacity: 1,
          scale: isTargaryen ? 1.45 : isGreyjoy ? 1.0 : 1.0,
          y: isGreyjoy ? -10 : 0,
          rotation: isTargaryen ? 1.5 : 0,
          filter: isTargaryen
            ? 'brightness(1.1) drop-shadow(0 0 35px rgba(209,52,56,0.65))'
            : isLannister
            ? 'brightness(1.05) drop-shadow(0 0 40px rgba(201,154,46,0.5))'
            : isTyrell
            ? 'brightness(1.05) drop-shadow(0 0 30px rgba(94,148,84,0.45))'
            : 'brightness(1) drop-shadow(0 0 25px rgba(255,255,255,0.12))',
          duration: 1.2,
          ease: 'power2.out',
        },
        0.1
      )

      // Badge & Chapter Number reveal
      tl.fromTo(
        [badgeRef.current, metaRef.current],
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power2.out' },
        0.25
      )

      // House Name reveals
      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 40, letterSpacing: '0.12em' },
        { opacity: 1, y: 0, letterSpacing: '0.28em', duration: 1.0, ease: 'power3.out' },
        0.35
      )

      // House Motto reveals with distinct authority
      tl.fromTo(
        mottoRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        0.5
      )

      // Lore narrative text reveals
      tl.fromTo(
        loreRef.current,
        { opacity: 0, y: 30 },
        { opacity: 0.9, y: 0, duration: 0.9, ease: 'power2.out' },
        0.65
      )

      // PHASE 2: MID-SCROLL PARALLAX DRIFT (35% -> 75% scroll)
      if (isGreyjoy) {
        // Subtle tidal oceanic drift
        tl.to(
          imageRef.current,
          { x: 15, y: -25, duration: 1.2, ease: 'sine.inOut' },
          0.8
        )
      } else if (isTargaryen) {
        // Dragon grows larger and looms with menacing scale
        tl.to(
          imageRef.current,
          { scale: 1.6, rotation: 3, duration: 1.2, ease: 'power1.inOut' },
          0.8
        )
      } else if (isStark) {
        // Subtly contracts into glacial stillness
        tl.to(
          imageRef.current,
          { scale: 0.95, y: -15, duration: 1.2, ease: 'power1.inOut' },
          0.8
        )
      }

      // PHASE 3: EXIT INTO DARKNESS (75% -> 100% scroll)
      tl.to(
        [headingRef.current, mottoRef.current, loreRef.current, badgeRef.current, metaRef.current],
        { opacity: 0, y: -35, duration: 0.7, ease: 'power2.in' },
        1.3
      )

      tl.to(
        imageRef.current,
        {
          opacity: 0,
          scale: isTargaryen ? 1.7 : 0.9,
          y: isGreyjoy ? -40 : -20,
          duration: 0.8,
          ease: 'power2.in',
        },
        1.4
      )

      tl.to(
        auraRef.current,
        { opacity: 0, duration: 0.8, ease: 'power2.in' },
        1.4
      )

      // Fade curtain to absolute black for seamless transition to next chapter
      tl.fromTo(
        darkFadeRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.inOut' },
        1.6
      )
    }, containerRef)

    return () => ctx.revert()
  }, [house])

  return (
    <section
      ref={containerRef}
      className={`house-chapter house-chapter--${house.id}`}
      id={`house-${house.id}`}
      style={{
        '--house-accent': house.theme.accent,
        '--house-glow': house.theme.glow,
        '--house-ambient': house.theme.ambient,
        '--house-border': house.theme.borderColor,
      }}
    >
      <div ref={stickyRef} className="house-sticky-viewport">
        {/* House-specific ambient background aura */}
        <div ref={auraRef} className="house-ambient-aura" />

        {/* Floating chapter watermark */}
        <div className="house-watermark" aria-hidden="true">
          {house.number}
        </div>

        {/* Main Stage Grid */}
        <div className="house-stage">
          {/* Left Column: House Identity & Lore */}
          <div className="house-narrative">
            <div ref={badgeRef} className="house-header-badge">
              <span className="house-badge-chapter">CHAPTER {house.number}</span>
              <span className="house-badge-divider">/</span>
              <span className="house-badge-region">{house.region}</span>
            </div>

            <h2 ref={headingRef} className="house-name-title">
              {house.name}
            </h2>

            <div ref={mottoRef} className="house-words-banner">
              <span className="words-quote">&ldquo;</span>
              <span className="words-text">{house.words.replace('.', '')}</span>
              <span className="words-quote">&rdquo;</span>
            </div>

            <div className="house-decor-divider">
              <span className="decor-line" />
              <span className="decor-rune">✦</span>
              <span className="decor-line" />
            </div>

            <p ref={loreRef} className="house-lore-paragraph">
              {house.lore}
            </p>

            <div ref={metaRef} className="house-meta-badges">
              <div className="meta-badge-item">
                <span className="meta-badge-label">SEAT OF POWER</span>
                <span className="meta-badge-value">{house.seat}</span>
              </div>
              <div className="meta-badge-item">
                <span className="meta-badge-label">ANCESTRAL SIGIL</span>
                <span className="meta-badge-value">{house.sigilName}</span>
              </div>
            </div>
          </div>

          {/* Right Column / Center: Heroic Sigil Visual */}
          <div ref={imageWrapRef} className="house-sigil-stage">
            <div className="house-sigil-halo" />
            <img
              ref={imageRef}
              className="house-sigil-image"
              src={house.image}
              alt={`${house.name} Sigil`}
              loading="eager"
            />
          </div>
        </div>

        {/* Transition black curtain for smooth flow */}
        <div ref={darkFadeRef} className="house-dark-curtain" />
      </div>
    </section>
  )
}

export default HouseChapter
