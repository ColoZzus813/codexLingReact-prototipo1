import React, { useState } from "react";
import imagenvideo from "../img/videophp.png";
import logo from "../img/php.png";

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
        alt="Video PHP Prueba"
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
    <h2>PHP</h2>
    <p>PHP es un lenguaje de programación del lado del servidor usado para crear páginas web dinámicas.
Permite interactuar con bases de datos y generar contenido en tiempo real.</p>
  </div>

</div>
    </main>
  );
}

export default Html;