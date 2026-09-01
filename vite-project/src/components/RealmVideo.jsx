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

  // Direct scrub target and lock
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

    // Direct, instant frame seek loop with zero lag
    const scrubLoop = () => {
      const vid = videoRef.current
      if (vid && !isSeekingRef.current) {
        const target = targetTimeRef.current
        if (Math.abs(vid.currentTime - target) > 0.02) {
          isSeekingRef.current = true
          if ('fastSeek' in vid) {
            vid.fastSeek(target)
          } else {
            vid.currentTime = target
          }
        }
      }
      reqIdRef.current = requestAnimationFrame(scrubLoop)
    }

    reqIdRef.current = requestAnimationFrame(scrubLoop)

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('canplaythrough', onMeta)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current
    const video = videoRef.current

    if (!container || !stage || !video) return

    const vidDuration = video.duration || duration || 37.13
    // Generous 7.5x viewport scroll distance to comfortably scrub through the entire 37 seconds
    const scrollDistance = window.innerHeight * 7.5

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: `+=${scrollDistance}`,
          pin: stage,
          pinSpacing: true,
          scrub: 1.0,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress

            // Map progress: 0% -> 90% scrubs 0s -> full 37.13s video
            // 90% -> 100% holds final frame and smoothly fades to pitch black before chapter entrance
            const videoProgress = Math.min(1, p / 0.90)
            const targetTime = videoProgress * vidDuration
            targetTimeRef.current = targetTime

            // Progress bar
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${Math.round(videoProgress * 100)}%`
            }
            if (percentTextRef.current) {
              percentTextRef.current.textContent = `${Math.round(videoProgress * 100)}%`
            }

            // Dark fade curtain at end of video before transitioning into the Great Houses
            if (darkFadeRef.current) {
              if (p > 0.88) {
                const fadeOpacity = (p - 0.88) / 0.12
                darkFadeRef.current.style.opacity = String(fadeOpacity)
              } else {
                darkFadeRef.current.style.opacity = '0'
              }
            }
          },
        },
      })
    }, container)

    return () => ctx.revert()
  }, [videoReady, duration])

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
          {/* Full Dark Transition Curtain to ensure clean handoff to Chapters */}
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
