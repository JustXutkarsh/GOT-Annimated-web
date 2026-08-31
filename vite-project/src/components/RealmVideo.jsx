import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const RealmVideo = () => {
  const containerRef = useRef(null)
  const stickyRef = useRef(null)
  const videoRef = useRef(null)
  const progressBarRef = useRef(null)
  const percentTextRef = useRef(null)

  const [duration, setDuration] = useState(37.13)
  const [videoReady, setVideoReady] = useState(false)

  // Target time and seeking lock for silky-smooth seeking
  const targetTimeRef = useRef(0)
  const isSeekingRef = useRef(false)
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

    const onSeeked = () => {
      isSeekingRef.current = false
    }

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('canplaythrough', onMeta)
    video.addEventListener('seeked', onSeeked)

    if (video.readyState >= 1) {
      onMeta()
    }

    // Continuous smooth animation loop to eliminate lag & frame stutter
    const renderLoop = () => {
      const vid = videoRef.current
      if (vid && !isSeekingRef.current) {
        const diff = targetTimeRef.current - vid.currentTime
        if (Math.abs(diff) > 0.02) {
          isSeekingRef.current = true
          // Apply frame
          vid.currentTime = Math.min(vid.duration || duration, Math.max(0, targetTimeRef.current))
        }
      }
      reqIdRef.current = requestAnimationFrame(renderLoop)
    }

    reqIdRef.current = requestAnimationFrame(renderLoop)

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('canplaythrough', onMeta)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [duration])

  useEffect(() => {
    const container = containerRef.current
    const sticky = stickyRef.current
    const video = videoRef.current

    if (!container || !sticky || !video) return

    const vidDuration = video.duration || duration || 37.13
    // Generous scroll distance (8.5x viewport) so all 37 seconds scrub smoothly without rushing
    const scrollDistance = window.innerHeight * 8.5

    const ctx = gsap.context(() => {
      const scrollTween = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: sticky,
        pinSpacing: true,
        scrub: 1.4, // Smooth inertial scrub
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress
          const time = progress * vidDuration
          targetTimeRef.current = time

          // Progress UI
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${progress * 100}%`
          }
          if (percentTextRef.current) {
            percentTextRef.current.textContent = `${Math.round(progress * 100)}%`
          }
        },
      })
    }, container)

    return () => ctx.revert()
  }, [videoReady, duration])

  return (
    <section ref={containerRef} className="realm-scrollytelling-section" id="realm-journey">
      <div ref={stickyRef} className="realm-sticky-stage">
        {/* Fullscreen Scrubbed Video */}
        <div className="realm-video-canvas-wrapper">
          <video
            ref={videoRef}
            className="realm-scrolly-video"
            src="/video/one.mp4"
            muted
            playsInline
            preload="auto"
          />
          {/* Subtle cinematic edge blends */}
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
