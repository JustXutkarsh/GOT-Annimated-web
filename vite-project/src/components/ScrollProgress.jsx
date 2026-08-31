import React, { useEffect, useState } from 'react'

const ScrollProgress = ({ activeHouseIndex }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100
        setProgress(Math.min(100, Math.max(0, currentProgress)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <aside className="scroll-indicator" aria-label="Scroll Progress">
      <div className="scroll-indicator-track">
        <div 
          className="scroll-indicator-bar" 
          style={{ height: `${progress}%` }} 
        />
      </div>
      <div className="scroll-indicator-label">
        <span className="scroll-pct">{Math.round(progress)}%</span>
      </div>
    </aside>
  )
}

export default ScrollProgress
