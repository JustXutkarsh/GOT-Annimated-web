import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CHRONICLES = [
  {
    range: [0, 0.22],
    tag: 'WESTEROS',
    title: 'THE MAP OF DESTINY',
    lore: 'From the frozen peaks of the Wall to the scorching red sands of Dorne, seven kingdoms lie under the shadow of war.',
  },
  {
    range: [0.22, 0.50],
    tag: 'DYNASTIES',
    title: 'FORGED IN CONQUEST',
    lore: 'Centuries of bloodlines, ancient vows, and bitter feuds. Every lord schemes for power, and every smile conceals a blade.',
  },
  {
    range: [0.50, 0.78],
    tag: 'THE IRON THRONE',
    title: 'A THOUSAND BLADES',
    lore: 'One thousand swords surrendered to Aegon the Conqueror. Melted by dragonflame into the most dangerous seat in the realm.',
  },
  {
    range: [0.78, 1.0],
    tag: 'THE REALM AWAITS',
    title: 'POWER HAS NO MERCY',
    lore: 'The ravens have taken flight. Winter is no longer a warning—it is here.',
  },
]

const RealmVideo = () => {
  const containerRef = useRef(null)
  const stickyRef = useRef(null)
  const videoRef = useRef(null)
  const titleRef = useRef(null)
  const tagRef = useRef(null)
  const loreRef = useRef(null)
  const progressLineRef = useRef(null)
  const activeIndexRef = useRef(-1)

  const [activeChapter, setActiveChapter] = useState(0)
  const [videoLoaded, setVideoLoaded] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0

    const handleLoaded = () => {
      setVideoLoaded(true)
      ScrollTrigger.refresh()
    }

    if (video.readyState >= 1) {
      handleLoaded()
    } else {
      video.addEventListener('loadedmetadata', handleLoaded)
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!videoLoaded || !video) return

    const duration = video.duration || 1

    const ctx = gsap.context(() => {
      // Main Scrubbing Timeline driven directly by scroll
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        onUpdate: (self) => {
          // Frame-accurate video scrub
          const targetTime = self.progress * duration
          if (Math.abs(video.currentTime - targetTime) > 0.03) {
            video.currentTime = targetTime
          }

          // Progress line
          if (progressLineRef.current) {
            progressLineRef.current.style.width = `${self.progress * 100}%`
          }

          // Dynamic Chapter Transition
          const p = self.progress
          const idx = CHRONICLES.findIndex(c => p >= c.range[0] && p < c.range[1])
          const resolvedIdx = idx === -1 ? CHRONICLES.length - 1 : idx

          if (activeIndexRef.current !== resolvedIdx) {
            activeIndexRef.current = resolvedIdx
            setActiveChapter(resolvedIdx)

            const ch = CHRONICLES[resolvedIdx]

            // Cinematic text fade
            gsap.timeline()
              .to([tagRef.current, titleRef.current, loreRef.current], {
                opacity: 0,
                y: -15,
                duration: 0.25,
                ease: 'power2.in',
                onComplete: () => {
                  if (tagRef.current) tagRef.current.textContent = ch.tag
                  if (titleRef.current) titleRef.current.textContent = ch.title
                  if (loreRef.current) loreRef.current.textContent = ch.lore
                },
              })
              .fromTo(
                [tagRef.current, titleRef.current, loreRef.current],
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }
              )
          }
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [videoLoaded])

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
          {/* Layered cinematic overlays */}
          <div className="realm-overlay-top-blend" />
          <div className="realm-overlay-vignette" />
          <div className="realm-overlay-bottom-blend" />
        </div>

        {/* Dynamic Scrollytelling Story Overlay */}
        <div className="realm-story-overlay">
          <div className="realm-story-card">
            <span ref={tagRef} className="realm-story-tag">
              {CHRONICLES[0].tag}
            </span>
            <h2 ref={titleRef} className="realm-story-title">
              {CHRONICLES[0].title}
            </h2>
            <div className="realm-story-divider">
              <span className="story-divider-line" />
              <span className="story-divider-diamond" />
              <span className="story-divider-line" />
            </div>
            <p ref={loreRef} className="realm-story-lore">
              {CHRONICLES[0].lore}
            </p>
          </div>
        </div>

        {/* Scrollytelling Video Timeline Tracker */}
        <div className="realm-timeline-tracker">
          <div className="timeline-counter">
            <span>0{activeChapter + 1}</span>
            <span className="timeline-sep">/</span>
            <span>0{CHRONICLES.length}</span>
          </div>
          <div className="timeline-bar-bg">
            <div ref={progressLineRef} className="timeline-bar-fill" />
          </div>
          <span className="timeline-label">SCROLL TO ADVANCE JOURNEY</span>
        </div>
      </div>
    </section>
  )
}

export default RealmVideo
