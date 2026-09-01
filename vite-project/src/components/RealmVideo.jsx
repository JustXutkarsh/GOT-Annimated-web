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

  const isPinnedRef = useRef(false)
  const scrollTimeoutRef = useRef(null)

  // Web Audio API refs for studio-quality, zero-latency playback
  const audioCtxRef = useRef(null)
  const audioBufferRef = useRef(null)
  const audioSourceRef = useRef(null)
  const gainNodeRef = useRef(null)

  // Web Audio + HTML5 Audio playback controller
  const startSoundtrack = () => {
    const ctx = audioCtxRef.current
    const buffer = audioBufferRef.current

    // Primary: Web Audio API (High volume, zero lag, bypasses element locks)
    if (ctx && buffer) {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }

      // Stop existing source if any
      if (audioSourceRef.current) {
        try {
          audioSourceRef.current.stop()
          audioSourceRef.current.disconnect()
        } catch (_) {}
        audioSourceRef.current = null
      }

      try {
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.loop = true

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(2.0, ctx.currentTime) // Boosted loud and clear studio volume

        source.connect(gain)
        gain.connect(ctx.destination)
        source.start(0)

        audioSourceRef.current = source
        gainNodeRef.current = gain
      } catch (_) {}
    }

    // Secondary Fallback: HTML5 Audio
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
      audio.volume = 1.0
      audio.muted = false
      audio.play().catch(() => {})
    }
  }

  const stopSoundtrack = () => {
    // Stop Web Audio
    if (audioSourceRef.current) {
      try {
        const ctx = audioCtxRef.current
        if (gainNodeRef.current && ctx) {
          gainNodeRef.current.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        }
        audioSourceRef.current.stop(ctx ? ctx.currentTime + 0.2 : 0)
      } catch (_) {}
      audioSourceRef.current = null
    }

    // Stop HTML5 Audio
    const audio = audioRef.current
    if (audio) {
      audio.pause()
    }
  }

  // Initialize Web Audio API and pre-load soundtrack buffer
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
      const ctx = new AudioContext()
      audioCtxRef.current = ctx

      // Load fast 240KB AAC stream
      fetch('/video/violin_bgm.m4a')
        .then((res) => res.arrayBuffer())
        .then((arrBuf) => ctx.decodeAudioData(arrBuf))
        .then((decoded) => {
          audioBufferRef.current = decoded
          // If the user is already inside Realm section when audio finishes loading, start immediately!
          if (isPinnedRef.current) {
            startSoundtrack()
          }
        })
        .catch(() => {
          // Fallback to WAV
          fetch('/video/violin_bgm.wav')
            .then((res) => res.arrayBuffer())
            .then((arrBuf) => ctx.decodeAudioData(arrBuf))
            .then((decoded) => {
              audioBufferRef.current = decoded
              if (isPinnedRef.current) {
                startSoundtrack()
              }
            })
            .catch(() => {})
        })
    }

    const unlockContext = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {})
      }
      if (audioRef.current && isPinnedRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {})
      }
    }

    window.addEventListener('click', unlockContext)
    window.addEventListener('touchstart', unlockContext)
    window.addEventListener('scroll', unlockContext)
    window.addEventListener('keydown', unlockContext)

    return () => {
      window.removeEventListener('click', unlockContext)
      window.removeEventListener('touchstart', unlockContext)
      window.removeEventListener('scroll', unlockContext)
      window.removeEventListener('keydown', unlockContext)
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const audio = audioRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0

    if (audio) {
      audio.volume = 1.0
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

    const vidDur = video.duration || duration || 37.13

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
          startSoundtrack()
        },
        onEnterBack: () => {
          isPinnedRef.current = true
          startSoundtrack()
        },
        onLeave: () => {
          isPinnedRef.current = false
          stopSoundtrack()
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = vidDur
          }
        },
        onLeaveBack: () => {
          isPinnedRef.current = false
          stopSoundtrack()
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
          }
        },
        onUpdate: (self) => {
          const vid = videoRef.current
          if (!vid) return

          // If in section and Web Audio isn't playing yet (e.g. initial gesture needed), try starting
          if (isPinnedRef.current && !audioSourceRef.current && audioBufferRef.current) {
            startSoundtrack()
          }

          const p = self.progress
          const targetTime = p * vidDur
          const timeDiff = targetTime - vid.currentTime

          if (timeDiff > 0.04) {
            const speed = Math.max(0.8, Math.min(3.2, timeDiff * 2.2))
            vid.playbackRate = speed
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
      stopSoundtrack()
      ctx.revert()
    }
  }, [videoReady, duration])

  return (
    <section ref={containerRef} className="realm-scrollytelling-section" id="realm-journey">
      {/* HTML5 Audio Dual Fallback */}
      <audio
        ref={audioRef}
        src="/video/violin_bgm.m4a"
        preload="auto"
        loop
        playsInline
      />

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
