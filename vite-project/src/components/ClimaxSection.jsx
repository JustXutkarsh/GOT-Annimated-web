import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HOUSES } from '../data/housesData'

gsap.registerPlugin(ScrollTrigger)

const ClimaxSection = () => {
  const containerRef = useRef(null)
  const stickyRef = useRef(null)
  const introPhraseRef = useRef(null)
  const winRef = useRef(null)
  const orRef = useRef(null)
  const dieRef = useRef(null)
  const questionRef = useRef(null)
  const housesGridRef = useRef(null)
  const previewRef = useRef(null)

  const [selectedHouse, setSelectedHouse] = useState(HOUSES[0])
  const [hoveredHouse, setHoveredHouse] = useState(null)

  const activeHouse = hoveredHouse || selectedHouse

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=180%',
          pin: stickyRef.current,
          scrub: 1.2,
          anticipatePin: 1,
        },
      })

      // Initially empty darkness -> Reveal "IN THE GAME OF THRONES"
      tl.fromTo(
        introPhraseRef.current,
        { opacity: 0, y: 35, letterSpacing: '0.2em' },
        { opacity: 0.8, y: 0, letterSpacing: '0.35em', duration: 1, ease: 'power2.out' },
        0.1
      )

      // Reveal "YOU WIN"
      tl.fromTo(
        winRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power2.out' },
        0.4
      )

      // Reveal "OR"
      tl.fromTo(
        orRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 0.6, scale: 1, duration: 0.6, ease: 'power2.out' },
        0.65
      )

      // Reveal "YOU DIE." with immense crimson & gold authority
      tl.fromTo(
        dieRef.current,
        { opacity: 0, scale: 1.15, y: 40, filter: 'blur(8px)' },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power3.out',
        },
        0.85
      )

      // Transition the big text slightly upward to give stage to "WHO WOULD YOU FIGHT FOR?"
      tl.to(
        [introPhraseRef.current, winRef.current, orRef.current, dieRef.current],
        { opacity: 0.35, scale: 0.88, y: -25, duration: 1 },
        1.4
      )

      // Reveal Question & Houses Allegiance Selector
      tl.fromTo(
        [questionRef.current, housesGridRef.current, previewRef.current],
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.15, duration: 1.1, ease: 'power3.out' },
        1.5
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="climax-section" id="climax">
      <div ref={stickyRef} className="climax-sticky">
        {/* Ambient Dark Aura shifted by active selected house */}
        <div
          className="climax-ambient-glow"
          style={{
            background: activeHouse?.theme.ambient || 'radial-gradient(ellipse at 50% 50%, rgba(20,20,20,0.8), rgba(5,5,5,1))',
          }}
        />

        <div className="climax-stage">
          {/* Climactic Quote */}
          <div className="climax-quote-block">
            <p ref={introPhraseRef} className="climax-intro">
              IN THE GAME OF THRONES
            </p>

            <div className="climax-verdict">
              <span ref={winRef} className="verdict-word verdict-win">YOU WIN</span>
              <span ref={orRef} className="verdict-word verdict-or">OR</span>
              <span ref={dieRef} className="verdict-word verdict-die">YOU DIE.</span>
            </div>
          </div>

          {/* Allegiance Prompt */}
          <div className="climax-allegiance-wrap">
            <div ref={questionRef} className="climax-question-box">
              <span className="question-sigil-icon">♚</span>
              <h3 className="climax-question">WHO WOULD YOU FIGHT FOR?</h3>
              <p className="climax-prompt-sub">Pledge your sword to a Great House</p>
            </div>

            {/* Interactive House Selector */}
            <div ref={housesGridRef} className="climax-houses-nav">
              {HOUSES.map((house) => {
                const isSelected = selectedHouse.id === house.id
                const isHovered = hoveredHouse?.id === house.id
                return (
                  <button
                    key={house.id}
                    className={`allegiance-btn ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''}`}
                    style={{
                      '--btn-accent': house.theme.accent,
                      '--btn-glow': house.theme.glow,
                    }}
                    onClick={() => setSelectedHouse(house)}
                    onMouseEnter={() => setHoveredHouse(house)}
                    onMouseLeave={() => setHoveredHouse(null)}
                    aria-label={`Pledge allegiance to ${house.name}`}
                  >
                    <span className="allegiance-number">{house.number}</span>
                    <span className="allegiance-name">{house.shortName}</span>
                    <span className="allegiance-indicator" />
                  </button>
                )
              })}
            </div>

            {/* Live House Allegiance Preview */}
            <div ref={previewRef} className="climax-preview-card">
              <div className="preview-sigil-wrap">
                <img
                  src={activeHouse.image}
                  alt={`${activeHouse.name} Sigil`}
                  className="preview-sigil-img"
                />
                <div
                  className="preview-halo"
                  style={{ backgroundColor: activeHouse.theme.accent }}
                />
              </div>

              <div className="preview-details">
                <span className="preview-region">{activeHouse.region} &bull; {activeHouse.seat}</span>
                <h4 className="preview-house-title">{activeHouse.name}</h4>
                <p className="preview-words">&ldquo;{activeHouse.words}&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ClimaxSection
