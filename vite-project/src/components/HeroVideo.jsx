import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const HeroVideo = () => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const dividerRef = useRef(null)
  const promptRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Slow, dramatic entrance timeline
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20, letterSpacing: '0.15em' },
        { opacity: 0.85, y: 0, letterSpacing: '0.35em', duration: 2.2, delay: 0.5 }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 35, scale: 0.96, letterSpacing: '0.1em' },
        { opacity: 1, y: 0, scale: 1, letterSpacing: '0.22em', duration: 2.8 },
        '-=1.4'
      )
      .fromTo(
        dividerRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.6, duration: 1.8 },
        '-=1.8'
      )
      .fromTo(
        promptRef.current,
        { opacity: 0, y: 15 },
        { opacity: 0.9, y: 0, duration: 1.6 },
        '-=0.8'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="hero-section" id="intro">
      {/* Fullscreen Video Background */}
      <div className="hero-video-wrapper">
        <video
          ref={videoRef}
          className="hero-video"
          src="/video/one.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* Layered cinematic gradients */}
        <div className="hero-overlay-radial" />
        <div className="hero-overlay-linear" />
      </div>

      {/* Atmospheric Typography Content */}
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-sigil-icon">⚔</span>
        </div>

        <p ref={subtitleRef} className="hero-subtitle">
          A STORY OF FIRE, BLOOD AND POWER
        </p>

        <h1 ref={titleRef} className="hero-title">
          GAME <span className="hero-title-of">OF</span> THRONES
        </h1>

        <div ref={dividerRef} className="hero-divider">
          <span className="hero-divider-diamond" />
        </div>

        <div ref={promptRef} className="hero-scroll-prompt">
          <span className="prompt-text">SCROLL TO ENTER WESTEROS</span>
          <div className="prompt-chevron-wrap">
            <div className="prompt-chevron" />
            <div className="prompt-chevron chevron-delay" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroVideo
