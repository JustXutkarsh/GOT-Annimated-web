import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const HeroVideo = () => {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const promptRef = useRef(null)
  const soundBtnRef = useRef(null)

  const [isMuted, setIsMuted] = useState(false)
  const userMutedPreferenceRef = useRef(false)

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
          window.__gotSoundEnabled = true
        })
        .catch(() => {
          // Browser prevented autoplay with sound without prior user interaction
          video.muted = true
          video.play()
          setIsMuted(true)
        })
    }

    // Unmute on first user interaction anywhere on screen if within hero
    const handleFirstInteraction = () => {
      if (video && !userMutedPreferenceRef.current && window.scrollY < window.innerHeight * 0.5) {
        video.muted = false
        setIsMuted(false)
        window.__gotSoundEnabled = true
      }
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })
    window.addEventListener('touchstart', handleFirstInteraction, { once: true })

    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [])

  // Auto-mute and pause 1st video when user scrolls out of hero into one.mp4
  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        onLeave: () => {
          // Scrolled past hero into one.mp4: automatically mute and pause 1st video
          video.muted = true
          video.pause()
          setIsMuted(true)
        },
        onEnterBack: () => {
          // Scrolled back up to hero: resume playback and unmute if not manually muted by user
          video.play().catch(() => {})
          if (!userMutedPreferenceRef.current) {
            video.muted = false
            setIsMuted(false)
            window.__gotSoundEnabled = true
          }
        },
      })
    }, container)

    return () => ctx.revert()
  }, [])

  const toggleSound = (e) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return

    if (video.muted) {
      video.muted = false
      userMutedPreferenceRef.current = false
      setIsMuted(false)
      window.__gotSoundEnabled = true
      video.play()
      window.dispatchEvent(new CustomEvent('gotSoundToggled', { detail: { enabled: true } }))
    } else {
      video.muted = true
      userMutedPreferenceRef.current = true
      setIsMuted(true)
      window.__gotSoundEnabled = false
      window.dispatchEvent(new CustomEvent('gotSoundToggled', { detail: { enabled: false } }))
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
