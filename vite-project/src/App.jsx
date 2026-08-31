import React, { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import AmbientAtmosphere from './components/AmbientAtmosphere'
import ScrollProgress from './components/ScrollProgress'
import HeroVideo from './components/HeroVideo'
import RealmVideo from './components/RealmVideo'
import DividedWorld from './components/DividedWorld'
import HouseChapter from './components/HouseChapter'
import ClimaxSection from './components/ClimaxSection'
import CinematicFooter from './components/CinematicFooter'

import { HOUSES } from './data/housesData'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

function App() {
  useEffect(() => {
    // Refresh ScrollTrigger after assets and fonts load
    window.addEventListener('load', () => {
      ScrollTrigger.refresh()
    })

    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 500)

    return () => {
      clearTimeout(timer)
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div className="got-realm">
      {/* Subtle Grain, Vignette & Ambient Layer */}
      <AmbientAtmosphere />

      {/* Minimal Fixed Scroll Progress on the right edge */}
      <ScrollProgress />

      {/* Main Continuous Scrollytelling Experience */}
      <main className="got-story-flow">
        {/* Section 1: 100vh Fullscreen Dragon Battle Opening */}
        <HeroVideo />

        {/* Section 2: Fullscreen Realm Journey Video (one.mp4) in line */}
        <RealmVideo />

        {/* Section 3: "A World Divided by Power..." Sticky Transition */}
        <DividedWorld />

        {/* Cinematic House Chapters */}
        <div className="houses-sequence">
          {HOUSES.map((house, idx) => (
            <HouseChapter
              key={house.id}
              house={house}
              index={idx}
              totalHouses={HOUSES.length}
            />
          ))}
        </div>

        {/* Final Climax: "In the Game of Thrones... You Win or You Die" */}
        <ClimaxSection />

        {/* Minimal Tribute Footer */}
        <CinematicFooter />
      </main>
    </div>
  )
}

export default App
