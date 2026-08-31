import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const RealmVideo = () => {
  const sectionRef = useRef(null)
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const captionRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // IntersectionObserver to auto-play when in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)

    // GSAP ScrollTrigger for cinematic entrance & exit fade
    const ctx = gsap.context(() => {
      gsap.fromTo(
        videoRef.current,
        { scale: 1.08, opacity: 0.7 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'center center',
            scrub: 1,
          },
        }
      )

      gsap.fromTo(
        captionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
          },
        }
      )
    }, sectionRef)

    return () => {
      observer.disconnect()
      ctx.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} className="realm-video-section" id="realm-cinematic">
      {/* Fullscreen Background Video (one.mp4) */}
      <div className="realm-video-wrapper">
        <video
          ref={videoRef}
          className="realm-video"
          src="/video/one.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        {/* Layered cinematic gradients for seamless blend */}
        <div className="realm-overlay-top" />
        <div ref={overlayRef} className="realm-overlay-radial" />
        <div className="realm-overlay-bottom" />
      </div>

      {/* Subtle Cinematic Caption */}
      <div ref={captionRef} className="realm-caption">
        <span className="realm-caption-rune">✦</span>
        <h2 className="realm-caption-title">THE REALM OF WESTEROS</h2>
        <p className="realm-caption-sub">AN ANCIENT LAND FORGED IN WAR AND AMBITION</p>
      </div>
    </section>
  )
}

export default RealmVideo
