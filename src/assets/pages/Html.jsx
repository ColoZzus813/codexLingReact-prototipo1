import React, { useState } from "react";
import imagenvideohtml from "../img/videohtml.jpg";
import logohtml from "../img/html.png";

function Html() {
  const [mensaje, setMensaje] = useState(false);

  const handlePlay = () => {
    setMensaje(true);
    setTimeout(() => setMensaje(false), 2000);
  };

  return (
    <main>
      <div className="course-detail">

  <div className="top-section">
    <div className="card-html">
      <img src={logohtml} alt="HTML logo" />
    </div>

    <div className="video-container">
      <img
        src={imagenvideohtml}
        className="video-placeholder"
        alt="Video HTML Prueba"
      />

      <button type="button" className="play-button" onClick={handlePlay}>
        ▶
      </button>
    </div>
  </div>

  {mensaje && (
    <div className="mensaje-video">
      ▶ Reproduciendo video...
    </div>
  )}

  <div className="course-description">
    <h2>HTML5</h2>
    <p>HTML5 es el lenguaje estándar para estructurar páginas web. Permite organizar contenido e incluir multimedia como video y audio fácilmente.</p>
  </div>

</div>
    </main>
  );
}

export default Html;