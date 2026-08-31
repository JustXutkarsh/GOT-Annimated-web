import React from 'react'

const CinematicFooter = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="cinematic-footer">
      <div className="footer-ornament-line">
        <span className="footer-line-left" />
        <span className="footer-sigil">✦</span>
        <span className="footer-line-right" />
      </div>

      <div className="footer-content">
        <p className="footer-eyebrow">
          A CINEMATIC TRIBUTE TO THE WORLD OF WESTEROS
        </p>

        <h2 className="footer-logo">
          GAME OF THRONES
        </h2>

        <button 
          onClick={scrollToTop}
          className="footer-back-top"
          aria-label="Return to the throne"
        >
          <span className="back-top-arrow">&uarr;</span>
          <span className="back-top-text">RETURN TO THE BEGINNING</span>
        </button>

        <p className="footer-disclaimer">
          All images, video assets, trademarks, and lore belong to their respective creators & HBO.
        </p>
      </div>
    </footer>
  )
}

export default CinematicFooter
