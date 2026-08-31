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

  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0

    const onLoaded = () => {
      setVideoReady(true)
      ScrollTrigger.refresh()
    }

    if (video.readyState >= 1) {
      onLoaded()
    } else {
      video.addEventListener('loadedmetadata', onLoaded)
      video.addEventListener('canplay', onLoaded)
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('canplay', onLoaded)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    const sticky = stickyRef.current

    if (!videoReady || !video || !container || !sticky) return

    const duration = video.duration || 10
    const scrollDistance = window.innerHeight * 5.5

    const ctx = gsap.context(() => {
      // Pin sticky container & scrub video directly from scroll
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: sticky,
        pinSpacing: true,
        scrub: 1.2,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Direct frame scrub
          const targetTime = self.progress * duration
          if (video.duration && Math.abs(video.currentTime - targetTime) > 0.03) {
            video.currentTime = targetTime
          }

          // Minimal progress bar at bottom
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${self.progress * 100}%`
          }
          if (percentTextRef.current) {
            percentTextRef.current.textContent = `${Math.round(self.progress * 100)}%`
          }
        },
      })
    }, container)

    return () => ctx.revert()
  }, [videoReady])

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
          {/* Subtle cinematic edge vignettes */}
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
