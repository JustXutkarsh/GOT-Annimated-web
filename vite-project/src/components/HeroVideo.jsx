import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

const HeroVideo = () => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const promptRef = useRef(null)
  const soundBtnRef = useRef(null)

  const [isMuted, setIsMuted] = useState(false)

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
          video.muted = true
          video.play()
          setIsMuted(true)
        })
    }

    // Unmute on first user interaction anywhere on screen
    const handleFirstInteraction = () => {
      if (video) {
        video.muted = false
        setIsMuted(false)
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
      video.play()
    } else {
      video.muted = true
      setIsMuted(true)
    }
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

      tl.fromTo(
        promptRef.current,
        { opacity: 0, y: 15 },
        { opacity: 0.9, y: 0, duration: 1.6, delay: 1.2 }
      )
      .fromTo(
        soundBtnRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1.0 },
        '-=0.8'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="hero-section hero-section--video-only" id="intro">
      {/* Pristine Fullscreen Dragon Battle Video Background */}
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
        {/* Subtle bottom fade into the dark realm */}
        <div className="hero-overlay-bottom" />
      </div>

      {/* Floating Sound Toggle Control */}
      <button
        ref={soundBtnRef}
        onClick={toggleSound}
        className={`hero-sound-toggle ${!isMuted ? 'is-active' : ''}`}
        aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
      >
        <span className="sound-icon">{!isMuted ? '🔊' : '🔇'}</span>
        <span className="sound-label">{!isMuted ? 'SOUND ON' : 'UNMUTE'}</span>
        {!isMuted && <span className="sound-pulse" />}
      </button>

      {/* Minimal Bottom Scroll Indicator */}
      <div ref={promptRef} className="hero-bottom-prompt">
        <span className="prompt-text">SCROLL TO ENTER WESTEROS</span>
        <div className="prompt-chevron-wrap">
          <div className="prompt-chevron" />
          <div className="prompt-chevron chevron-delay" />
        </div>
      </div>
    </section>
  )
}

export default HeroVideo
