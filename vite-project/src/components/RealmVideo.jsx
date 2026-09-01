import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const RealmVideo = () => {
  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const videoRef = useRef(null)
  const progressBarRef = useRef(null)
  const percentTextRef = useRef(null)
  const darkFadeRef = useRef(null)

  const [duration, setDuration] = useState(37.13)
  const [videoReady, setVideoReady] = useState(false)

  const isPinnedRef = useRef(false)
  const scrollTimeoutRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0
    video.muted = false
    video.volume = 1.0

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

    // Unmute on first user interaction anywhere on the screen
    const handleFirstInteraction = () => {
      if (video) {
        video.muted = false
      }
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }

    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })
    window.addEventListener('touchstart', handleFirstInteraction, { once: true })

    return () => {
      video.removeEventListener('loadedmetadata', handleMeta)
      video.removeEventListener('canplaythrough', handleMeta)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
      window.removeEventListener('touchstart', handleFirstInteraction)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current
    const video = videoRef.current

    if (!container || !stage || !video) return

    const vidDur = video.duration || duration || 37.13

    const playVideoAudio = () => {
      if (!video) return
      video.muted = false
      video.volume = 1.0
      video.play().catch(() => {
        // Fallback: retry unmuted on next gesture
        const onNextGesture = () => {
          if (video && isPinnedRef.current) {
            video.muted = false
            video.volume = 1.0
            video.play().catch(() => {})
          }
          window.removeEventListener('click', onNextGesture)
          window.removeEventListener('scroll', onNextGesture)
        }
        window.addEventListener('click', onNextGesture, { once: true })
        window.addEventListener('scroll', onNextGesture, { once: true })
      })
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
          playVideoAudio()
        },
        onEnterBack: () => {
          isPinnedRef.current = true
          playVideoAudio()
        },
        onLeave: () => {
          isPinnedRef.current = false
          if (videoRef.current) {
            videoRef.current.muted = true
            videoRef.current.pause()
            videoRef.current.currentTime = vidDur
          }
        },
        onLeaveBack: () => {
          isPinnedRef.current = false
          if (videoRef.current) {
            videoRef.current.muted = true
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
            vid.muted = false
            if (vid.paused) {
              vid.play().catch(() => {})
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
      if (videoRef.current) {
        videoRef.current.muted = true
        videoRef.current.pause()
      }
      ctx.revert()
    }
  }, [videoReady, duration])

  return (
    <section ref={containerRef} className="realm-scrollytelling-section" id="realm-journey">
      <div ref={stageRef} className="realm-sticky-stage">
        {/* Fullscreen Video Canvas with Native Embedded Violin BGM */}
        <div className="realm-video-canvas-wrapper">
          <video
            ref={videoRef}
            className="realm-scrolly-video"
            src="/video/one.mp4"
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
