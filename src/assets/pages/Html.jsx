import { useCallback, useEffect, useState } from "react";
import imagenvideohtml from "../img/videohtml.jpg";
import logohtml from "../img/html.png";
import { API_URL, subscribeToRealtime } from "../../api/realtime";

function Html({ setPage }) {
  const [mensaje, setMensaje] = useState(false);
  const [lessons, setLessons] = useState([]);

  const fetchLessons = useCallback(() => {
    fetch(`${API_URL}/courses/html/lessons`)
      .then((response) => response.json())
      .then((result) => setLessons(result.data || []))
      .catch(() => setLessons([]));
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(
    () => subscribeToRealtime(["html-lessons:updated"], fetchLessons),
    [fetchLessons]
  );

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
            <img src={imagenvideohtml} className="video-placeholder" alt="Video HTML Prueba" />
            <button type="button" className="play-button" onClick={handlePlay}>
              <i className="fas fa-play"></i>
            </button>
          </div>
        </div>

        {mensaje && <div className="mensaje-video">Reproduciendo video...</div>}

        <div className="course-description">
          <h2>HTML5</h2>
          <p>HTML5 es el lenguaje estandar para estructurar paginas web. Permite organizar contenido e incluir multimedia como video y audio facilmente.</p>
          <button className="start-course-button" type="button" onClick={() => setPage("html-course")}>
            Comenzar curso
          </button>
        </div>

        <section className="study-plan-preview">
          <h2>Plan de estudio</h2>
          <div className="study-plan-grid">
            {lessons.map((lesson) => (
              <article className="study-plan-card" key={lesson.id}>
                <div className="study-plan-card-header">
                  <span>Leccion {lesson.order}</span>
                  <h3>{lesson.title}</h3>
                </div>
                <p>{lesson.description}</p>
                <div className="study-level-list">
                  {lesson.levels.map((level) => (
                    <div className="study-level-pill" key={level.id}>
                      <span>{level.order}</span>
                      {level.title}
                    </div>
                  ))}
                  {lesson.levels.length === 0 && (
                    <div className="study-level-pill empty">Sin niveles todavia</div>
                  )}
                </div>
              </article>
            ))}
            {lessons.length === 0 && <p>No hay lecciones registradas todavia.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Html;
