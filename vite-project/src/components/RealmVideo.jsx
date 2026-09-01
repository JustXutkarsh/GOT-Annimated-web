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

  const [duration, setDuration] = useState(37.13)
  const [videoReady, setVideoReady] = useState(false)

  // Scroll sync refs
  const targetProgressRef = useRef(0)
  const currentProgressRef = useRef(0)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef(null)
  const reqIdRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0

    const onMeta = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration)
      }
      setVideoReady(true)
      ScrollTrigger.refresh()
    }

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('canplaythrough', onMeta)

    if (video.readyState >= 1) {
      onMeta()
    }

    // High-performance smooth 60fps sync engine
    const syncLoop = () => {
      const vid = videoRef.current
      if (vid && vid.duration) {
        const vidDur = vid.duration

        // Smoothly interpolate current progress towards target scroll progress
        const diff = targetProgressRef.current - currentProgressRef.current
        currentProgressRef.current += diff * 0.12

        const targetTime = currentProgressRef.current * vidDur
        const timeDiff = targetTime - vid.currentTime

        if (isScrollingRef.current) {
          // If scrolling forward and difference is small, use smooth playback rate
          if (timeDiff > 0.05 && timeDiff < 2.0) {
            const speed = Math.max(0.5, Math.min(3.5, timeDiff * 3.0))
            vid.playbackRate = speed
            if (vid.paused) {
              vid.play().catch(() => {})
            }
          } else if (Math.abs(timeDiff) >= 2.0 || timeDiff < -0.05) {
            // Larger jump or backward scroll: seek directly
            vid.pause()
            vid.currentTime = Math.max(0, Math.min(vidDur, targetTime))
          }
        } else {
          // Scrolling stopped: snap to exact frame and pause cleanly
          if (!vid.paused) {
            vid.pause()
          }
          if (Math.abs(timeDiff) > 0.03) {
            vid.currentTime = Math.max(0, Math.min(vidDur, targetTime))
          }
        }

        // Update progress bar
        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${currentProgressRef.current * 100}%`
        }
        if (percentTextRef.current) {
          percentTextRef.current.textContent = `${Math.round(currentProgressRef.current * 100)}%`
        }
      }

      reqIdRef.current = requestAnimationFrame(syncLoop)
    }

    reqIdRef.current = requestAnimationFrame(syncLoop)

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('canplaythrough', onMeta)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current
    const video = videoRef.current

    if (!container || !stage || !video) return

    // Generous scroll span (5x viewport height) for comfortable pacing
    const scrollDistance = window.innerHeight * 5.0

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: stage,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          targetProgressRef.current = self.progress
          isScrollingRef.current = true

          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current)
          }
          scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false
          }, 100)
        },
        onLeave: () => {
          isScrollingRef.current = false
          if (videoRef.current) {
            videoRef.current.pause()
          }
        },
        onLeaveBack: () => {
          isScrollingRef.current = false
          if (videoRef.current) {
            videoRef.current.pause()
          }
        },
      })
    }, container)

    return () => ctx.revert()
  }, [videoReady])

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
          {/* Edge Vignette Overlays for clean dark transitions */}
          <div className="realm-overlay-top-blend" />
          <div className="realm-overlay-vignette" />
          <div className="realm-overlay-bottom-blend" />
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
