import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const HeroVideo = () => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const dividerRef = useRef(null)
  const promptRef = useRef(null)
  const soundBtnRef = useRef(null)

  const [isMuted, setIsMuted] = useState(false)
  const [audioPromptVisible, setAudioPromptVisible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = false
    video.volume = 1.0

    // Try playing with sound enabled
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsMuted(false)
        })
        .catch(() => {
          // Browser prevented autoplay with sound without prior user interaction
          // Fallback to muted playback until first user interaction
          video.muted = true
          video.play()
          setIsMuted(true)
          setAudioPromptVisible(true)
        })
    }

    // Unmute on first user interaction anywhere on screen
    const handleFirstInteraction = () => {
      if (video) {
        video.muted = false
        setIsMuted(false)
        setAudioPromptVisible(false)
      }
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('scroll', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('scroll', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('scroll', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  const toggleSound = (e) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (video.muted) {
      video.muted = false
      setIsMuted(false)
      setAudioPromptVisible(false)
      video.play()
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }

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
      .fromTo(
        soundBtnRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.2 },
        '-=1.0'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="hero-section" id="intro">
      {/* Fullscreen Dragon Battle Video Background */}
      <div className="hero-video-wrapper">
        <video
          ref={videoRef}
          className="hero-video"
          src="/video/dragon_battle.mp4"
          autoPlay
          loop
          playsInline
          preload="auto"
        />
        {/* Layered cinematic gradients */}
        <div className="hero-overlay-radial" />
        <div className="hero-overlay-linear" />
      </div>

      {/* Floating Sound Toggle Control */}
      <button
        ref={soundBtnRef}
        onClick={toggleSound}
        className={`hero-sound-toggle ${!isMuted ? 'is-active' : ''}`}
        aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
      >
        <span className="sound-icon">{!isMuted ? '🔊' : '🔇'}</span>
        <span className="sound-label">{!isMuted ? 'AUDIO ENABLED' : 'CLICK TO UNMUTE'}</span>
        {!isMuted && <span className="sound-pulse" />}
      </button>

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
