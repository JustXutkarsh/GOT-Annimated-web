import React from 'react'

const AmbientAtmosphere = () => {
  return (
    <div className="ambient-layer" aria-hidden="true">
      {/* Dynamic Vignette */}
      <div className="ambient-vignette" />
      
      {/* SVG Grain filter for authentic filmic look */}
      <div className="ambient-grain" />
      
      {/* Subtle depth lighting */}
      <div className="ambient-glow" />
    </div>
  )
}

export default AmbientAtmosphere
