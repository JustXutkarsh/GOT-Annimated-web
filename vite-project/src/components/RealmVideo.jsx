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

  const [videoDuration, setVideoDuration] = useState(37.13)
  const [videoReady, setVideoReady] = useState(false)

  // Scroll and playback state
  const isPinnedRef = useRef(false)
  const scrollTimeoutRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0

    const handleMeta = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setVideoDuration(video.duration)
      }
      setVideoReady(true)
      ScrollTrigger.refresh()
    }

    // Timeupdate listener to update progress bar smoothly
    const handleTimeUpdate = () => {
      if (!video.duration) return
      const pct = Math.min(100, Math.max(0, (video.currentTime / video.duration) * 100))
      
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.round(pct)}%`
      }
      if (percentTextRef.current) {
        percentTextRef.current.textContent = `${Math.round(pct)}%`
      }

      // Smooth dark fade during the last 5% of the video
      if (darkFadeRef.current) {
        if (pct >= 94) {
          const fade = (pct - 94) / 6
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

    return () => {
      video.removeEventListener('loadedmetadata', handleMeta)
      video.removeEventListener('canplaythrough', handleMeta)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current
    const video = videoRef.current

    if (!container || !stage || !video) return

    const duration = video.duration || videoDuration || 37.13
    // Generous scroll distance (8x viewport) ensuring the full 37.13s video plays through to 100%
    const scrollDistance = window.innerHeight * 8.0

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: stage,
        pinSpacing: true,
        scrub: false, // We control smooth native playback directly to eliminate seek lag
        anticipatePin: 1,
        onEnter: () => {
          isPinnedRef.current = true
        },
        onEnterBack: () => {
          isPinnedRef.current = true
        },
        onLeave: () => {
          isPinnedRef.current = false
          if (videoRef.current) {
            videoRef.current.pause()
          }
        },
        onLeaveBack: () => {
          isPinnedRef.current = false
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
          }
        },
        onUpdate: (self) => {
          const vid = videoRef.current
          if (!vid) return

          const progress = self.progress
          const targetTime = Math.min(duration, progress * duration)

          // Smooth native playback driven by scroll:
          // If user is actively scrolling forward, play smoothly at native 60fps
          const timeDiff = targetTime - vid.currentTime

          if (timeDiff > 0.05) {
            // Forward scroll: adjust playbackRate smoothly and play
            const rate = Math.max(0.8, Math.min(3.0, timeDiff * 2.5))
            vid.playbackRate = rate
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
          } else if (timeDiff < -0.2) {
            // Backward scroll: step back smoothly
            vid.pause()
            vid.currentTime = Math.max(0, targetTime)
          }

          // Ensure video reaches 100% at end of scroll
          if (progress >= 0.98 && vid.currentTime < duration - 0.2) {
            vid.currentTime = duration - 0.05
          }
        },
      })
    }, container)

    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      ctx.revert()
    }
  }, [videoReady, videoDuration])

  return (
    <section ref={containerRef} className="realm-scrollytelling-section" id="realm-journey">
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
          {/* Full Dark Transition Curtain to ensure clean handoff to Chapters only after full completion */}
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
