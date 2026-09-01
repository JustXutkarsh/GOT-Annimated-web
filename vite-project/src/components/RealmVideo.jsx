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
  const isAudioPlayingRef = useRef(false)
  const scrollTimeoutRef = useRef(null)

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

    // Global interaction listener that unlocks audio immediately on first click/touch
    const unlockAudio = () => {
      if (audio) {
        audio.load()
        if (isPinnedRef.current && !isAudioPlayingRef.current) {
          audio.play().then(() => {
            isAudioPlayingRef.current = true
          }).catch(() => {})
        }
      }
    }

    window.addEventListener('click', unlockAudio)
    window.addEventListener('touchstart', unlockAudio)
    window.addEventListener('keydown', unlockAudio)

    return () => {
      video.removeEventListener('loadedmetadata', handleMeta)
      video.removeEventListener('canplaythrough', handleMeta)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      window.removeEventListener('click', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const stage = stageRef.current
    const video = videoRef.current
    const audio = audioRef.current

    if (!container || !stage || !video) return

    const vidDur = video.duration || duration || 37.13

    const startSoundtrack = () => {
      if (audio) {
        audio.currentTime = 0
        audio.volume = 1.0
        audio.play().then(() => {
          isAudioPlayingRef.current = true
        }).catch(() => {
          // Retry on first interaction
          const retryPlay = () => {
            if (audio && isPinnedRef.current) {
              audio.play().then(() => {
                isAudioPlayingRef.current = true
              }).catch(() => {})
            }
            window.removeEventListener('click', retryPlay)
            window.removeEventListener('scroll', retryPlay)
          }
          window.addEventListener('click', retryPlay, { once: true })
          window.addEventListener('scroll', retryPlay, { once: true })
        })
      }
    }

    const stopSoundtrack = () => {
      if (audio) {
        audio.pause()
        isAudioPlayingRef.current = false
      }
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

          // If audio is in section but was paused by browser, resume it
          if (audio && audio.paused && isPinnedRef.current) {
            audio.play().catch(() => {})
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
      {/* Background Violin Soundtrack using pure uncompressed WAV and AAC */}
      <audio
        ref={audioRef}
        src="/video/violin_bgm.wav"
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
