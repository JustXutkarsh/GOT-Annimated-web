import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const RealmVideo = () => {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const progressBarRef = useRef(null)
  const percentTextRef = useRef(null)
  const darkFadeRef = useRef(null)

  const [duration, setDuration] = useState(37.13)
  const [videoReady, setVideoReady] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [needsUserActivation, setNeedsUserActivation] = useState(false)

  const isPinnedRef = useRef(false)
  const userMutedPreferenceRef = useRef(false)
  const scrollTimeoutRef = useRef(null)

  // Initialize and prime audio
  useEffect(() => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0

    if (audio) {
      audio.volume = 0.9
      audio.loop = true
    }

    const handleMeta = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration)
      }
      setVideoReady(true)
      ScrollTrigger.refresh()
    }

    const handleTimeUpdate = () => {
      if (!video.duration) return
      const pct = Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100))

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.round(pct)}%`
      }
      if (percentTextRef.current) {
        percentTextRef.current.textContent = `${Math.round(pct)}%`
      }

      if (darkFadeRef.current) {
        if (pct >= 95) {
          const fade = (pct - 95) / 5
          darkFadeRef.current.style.opacity = String(fade)
        } else {
          darkFadeRef.current.style.opacity = '0'
        }
      }
    }

    video.addEventListener('loadedmetadata', handleMeta)
    video.addEventListener('canplaythrough', handleMeta)
    video.addEventListener('timeupdate', handleTimeUpdate)

    if (video.readyState >= 1) {
      handleMeta()
    }

    // Pre-unlock audio on any global interaction
    const unlockAudio = () => {
      if (audio && audio.paused && !userMutedPreferenceRef.current && isPinnedRef.current) {
        audio.play().then(() => {
          setIsPlayingAudio(true)
          setNeedsUserActivation(false)
        }).catch(() => {})
      }
    }

    window.addEventListener('click', unlockAudio)
    window.addEventListener('touchstart', unlockAudio)
    window.addEventListener('scroll', unlockAudio)
    window.addEventListener('keydown', unlockAudio)

    return () => {
      video.removeEventListener('loadedmetadata', handleMeta)
      video.removeEventListener('canplaythrough', handleMeta)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      window.removeEventListener('click', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
      window.removeEventListener('scroll', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current
    const video = videoRef.current
    const audio = audioRef.current

    if (!container || !stage || !video) return

    const vidDur = video.duration || duration || 37.13

    const startAudio = () => {
      if (!audio || userMutedPreferenceRef.current) return
      audio.muted = false
      audio.play().then(() => {
        setIsPlayingAudio(true)
        setNeedsUserActivation(false)
      }).catch(() => {
        // Autoplay policy prevented immediate playback
        setNeedsUserActivation(true)
        setIsPlayingAudio(false)
      })
    }

    const stopAudio = () => {
      if (audio) {
        audio.pause()
        setIsPlayingAudio(false)
      }
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        pin: stage,
        pinSpacing: false,
        anticipatePin: 1,
        onEnter: () => {
          isPinnedRef.current = true
          startAudio()
        },
        onEnterBack: () => {
          isPinnedRef.current = true
          startAudio()
        },
        onLeave: () => {
          isPinnedRef.current = false
          stopAudio()
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = vidDur
          }
        },
        onLeaveBack: () => {
          isPinnedRef.current = false
          stopAudio()
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
          }
        },
        onUpdate: (self) => {
          const vid = videoRef.current
          if (!vid) return

          const p = self.progress
          const targetTime = p * vidDur
          const timeDiff = targetTime - vid.currentTime

          if (timeDiff > 0.04) {
            const speed = Math.max(0.8, Math.min(3.2, timeDiff * 2.2))
            vid.playbackRate = speed
            if (vid.paused) {
              vid.play().catch(() => {})
            }

            if (audio && audio.paused && !userMutedPreferenceRef.current) {
              startAudio()
            }

            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current)
            }
            scrollTimeoutRef.current = setTimeout(() => {
              if (vid && isPinnedRef.current) {
                vid.pause()
              }
            }, 120)
          } else if (timeDiff < -0.15) {
            vid.pause()
            vid.currentTime = Math.max(0, targetTime)
          }

          if (p >= 0.99) {
            vid.currentTime = vidDur
          }
        },
      })
    }, container)

    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      stopAudio()
      ctx.revert()
    }
  }, [videoReady, duration])

  const toggleAudio = (e) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused || !isPlayingAudio) {
      audio.muted = false
      userMutedPreferenceRef.current = false
      audio.play().then(() => {
        setIsPlayingAudio(true)
        setNeedsUserActivation(false)
      }).catch(() => {})
    } else {
      audio.pause()
      userMutedPreferenceRef.current = true
      setIsPlayingAudio(false)
      setNeedsUserActivation(false)
    }
  }

  return (
    <section ref={containerRef} className="realm-scrollytelling-section" id="realm-journey">
      {/* Background Violin Soundtrack with multi-source fallback */}
      <audio ref={audioRef} preload="auto" loop playsInline>
        <source src="/video/violin_bgm.m4a" type="audio/mp4" />
        <source src="/video/Game Of Thrones - Violin _ Bgm.m4r" type="audio/mp4" />
        <source src="/video/violin_bgm.m4r" type="audio/mp4" />
      </audio>

      <div ref={stageRef} className="realm-sticky-stage">
        {/* Fullscreen Video Canvas */}
        <div className="realm-video-canvas-wrapper">
          <video
            ref={videoRef}
            className="realm-scrolly-video"
            src="/video/one.mp4"
            muted
            playsInline
            preload="auto"
          />
          {/* Edge Vignette Overlays */}
          <div className="realm-overlay-top-blend" />
          <div className="realm-overlay-vignette" />
          <div className="realm-overlay-bottom-blend" />
          {/* Full Dark Transition Curtain */}
          <div ref={darkFadeRef} className="realm-dark-fade-curtain" />
        </div>

        {/* Floating Soundtrack Audio Control Button */}
        <button
          onClick={toggleAudio}
          className={`realm-audio-toggle ${isPlayingAudio ? 'is-active' : ''} ${needsUserActivation ? 'is-prompt' : ''}`}
          aria-label={isPlayingAudio ? 'Mute Violin Soundtrack' : 'Play Violin Soundtrack'}
        >
          <span className="realm-audio-icon">{isPlayingAudio ? '🎻' : '🔇'}</span>
          <span className="realm-audio-label">
            {isPlayingAudio ? 'VIOLIN BGM ON' : needsUserActivation ? 'TAP FOR VIOLIN BGM' : 'VIOLIN MUTED'}
          </span>
          {isPlayingAudio && <span className="realm-audio-pulse" />}
        </button>

        {/* Minimal Bottom Scrollytelling Tracker */}
        <div className="realm-minimal-scrub-bar">
          <div className="scrub-bar-track">
            <div ref={progressBarRef} className="scrub-bar-fill" />
          </div>
          <div className="scrub-bar-info">
            <span className="scrub-label">CHRONICLES OF WESTEROS</span>
            <span ref={percentTextRef} className="scrub-percent">0%</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RealmVideo
