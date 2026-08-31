import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const DividedWorld = () => {
  const containerRef = useRef(null)
  const stickyRef = useRef(null)
  const word1Ref = useRef(null)
  const word2Ref = useRef(null)
  const word3Ref = useRef(null)
  const word4Ref = useRef(null)
  const phrase2Ref = useRef(null)
  const lineRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = [word1Ref.current, word2Ref.current, word3Ref.current, word4Ref.current]

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=150%',
          pin: stickyRef.current,
          scrub: 1.2,
          anticipatePin: 1,
        },
      })

      // Staggered reveal of each word in "A WORLD DIVIDED BY POWER"
      tl.fromTo(
        words,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.18,
          duration: 1,
          ease: 'power2.out',
        }
      )
      // Reveal accent line
      .fromTo(
        lineRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 0.5, duration: 0.6, ease: 'power2.out' },
        '+=0.1'
      )
      // Reveal "SIX GREAT HOUSES." with dramatic gold radiance
      .fromTo(
        phrase2Ref.current,
        { opacity: 0, y: 35, letterSpacing: '0.15em' },
        {
          opacity: 1,
          y: 0,
          letterSpacing: '0.35em',
          duration: 1.2,
          ease: 'power3.out',
        },
        '+=0.15'
      )
      // Fade out smoothly into the first house (Stark)
      .to(
        [...words, lineRef.current, phrase2Ref.current],
        { opacity: 0, y: -40, duration: 0.8, ease: 'power2.in' },
        '+=0.5'
      )
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="divided-section">
      <div ref={stickyRef} className="divided-sticky">
        <div className="divided-content">
          <div className="divided-eyebrow">THE CHRONICLES OF WESTEROS</div>

          <h2 className="divided-main-heading">
            <span ref={word1Ref} className="divided-word">A WORLD</span>
            <span className="divided-break" />
            <span ref={word2Ref} className="divided-word">DIVIDED</span>
            <span ref={word3Ref} className="divided-word divided-accent">BY</span>
            <span ref={word4Ref} className="divided-word">POWER</span>
          </h2>

          <div ref={lineRef} className="divided-line-wrap">
            <div className="divided-line" />
            <span className="divided-sigil">✦</span>
            <div className="divided-line" />
          </div>

          <p ref={phrase2Ref} className="divided-houses-reveal">
            SIX GREAT HOUSES. ONE IRON THRONE.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DividedWorld
