import React, { useState } from "react";
import imagenvideo from "../img/videojava.jpg";
import logo from "../img/java.png";

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
      <img src={logo} alt="Java logo" />
    </div>

    <div className="video-container">
      <img
        src={imagenvideo}
        className="video-placeholder"
        alt="Video Java Prueba"
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
    <h2>JAVA</h2>
    <p>Java es un lenguaje de programación potente y versátil, es seguro, rápido y orientado a objetos, ideal para quienes quieren crear softwares profesionales.</p>
  </div>

</div>
    </main>
  );
}

export default Html;