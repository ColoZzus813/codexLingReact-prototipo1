import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const PROGRESS_KEY = "codexling-python-progress";

function levelKey(lessonId, levelId) {
  return `${lessonId}:${levelId}`;
}

function readProgress() {
  const savedProgress = localStorage.getItem(PROGRESS_KEY);

  if (!savedProgress) {
    return { completedLevels: [] };
  }

  const parsedProgress = JSON.parse(savedProgress);
  return Array.isArray(parsedProgress) ? { completedLevels: [] } : parsedProgress;
}

function PythonCourse({ setPage }) {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(readProgress);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("codexling-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeLevelId, setActiveLevelId] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/python/lessons`)
      .then((response) => response.json())
      .then((result) => {
        const loadedLessons = result.data || [];
        const firstLesson = loadedLessons[0];
        const firstLevel = firstLesson?.levels?.[0];

        setLessons(loadedLessons);
        setActiveLessonId(firstLesson?.id || null);
        setActiveLevelId(firstLevel?.id || null);
      })
      .catch(() => {
        setLessons([]);
        setMessage("No se pudieron cargar las lecciones. Revisa que el backend este encendido.");
      });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setProgress({
      completedLevels: currentUser.completedPythonLevels || currentUser.profile?.completedPythonLevels || []
    });
  }, [currentUser]);

  useEffect(() => {
    const syncUser = (event) => {
      setCurrentUser(event.detail);
    };

    window.addEventListener("codexling-user-updated", syncUser);
    return () => window.removeEventListener("codexling-user-updated", syncUser);
  }, []);

  const completedLevelKeys = progress.completedLevels || [];
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId);
  const activeLevel = activeLesson?.levels.find((level) => level.id === activeLevelId);

  const isLevelCompleted = (lessonId, levelId) =>
    completedLevelKeys.includes(levelKey(lessonId, levelId));

  const isLessonCompleted = (lesson) =>
    lesson.levels.length > 0 && lesson.levels.every((level) => isLevelCompleted(lesson.id, level.id));

  const unlockedLessonIds = new Set();

  lessons.forEach((lesson, index) => {
    const previousLesson = lessons[index - 1];

    if (index === 0 || isLessonCompleted(previousLesson)) {
      unlockedLessonIds.add(lesson.id);
    }
  });

  const isLevelUnlocked = (lesson, levelIndex) => {
    if (!unlockedLessonIds.has(lesson.id)) {
      return false;
    }

    if (levelIndex === 0) {
      return true;
    }

    const previousLevel = lesson.levels[levelIndex - 1];
    return isLevelCompleted(lesson.id, previousLevel.id);
  };

  const firstPlayableLevel = (lesson) =>
    lesson.levels.find((level, index) => isLevelUnlocked(lesson, index)) || lesson.levels[0];

  const selectLesson = (lesson) => {
    if (!unlockedLessonIds.has(lesson.id)) {
      setMessage("Completa todos los niveles de la leccion anterior para desbloquear esta leccion.");
      return;
    }

    const playableLevel = firstPlayableLevel(lesson);
    setActiveLessonId(lesson.id);
    setActiveLevelId(playableLevel?.id || null);
    setMessage("");
  };

  const selectLevel = (lesson, level, levelIndex) => {
    if (!isLevelUnlocked(lesson, levelIndex)) {
      setMessage("Completa el nivel anterior para desbloquear este apartado.");
      return;
    }

    setActiveLessonId(lesson.id);
    setActiveLevelId(level.id);
    setMessage("");
  };

  const completeLevel = async () => {
    if (!activeLesson || !activeLevel || isLevelCompleted(activeLesson.id, activeLevel.id)) {
      return;
    }

    const completedKey = levelKey(activeLesson.id, activeLevel.id);
    let earnedMessage = "Apartado completado localmente. Inicia sesion para guardar XP en tu perfil.";

    if (currentUser?.id) {
      try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}/progress/python-levels`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: activeLesson.id,
            levelId: activeLevel.id
          })
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error?.message || "No se pudo guardar el progreso.");
        }

        const updatedUser = result.data;
        setCurrentUser(updatedUser);
        localStorage.setItem("codexling-user", JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent("codexling-user-updated", { detail: updatedUser }));
        earnedMessage = result.message;
      } catch (error) {
        setMessage(error.message);
        return;
      }
    }

    const newProgress = {
      completedLevels: [...completedLevelKeys, completedKey]
    };

    setProgress(newProgress);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));

    const currentLevelIndex = activeLesson.levels.findIndex((level) => level.id === activeLevel.id);
    const nextLevel = activeLesson.levels[currentLevelIndex + 1];

    if (nextLevel) {
      setActiveLevelId(nextLevel.id);
      setMessage(`${earnedMessage} Se desbloqueo el siguiente apartado.`);
      return;
    }

    setMessage(`${earnedMessage} Se desbloqueo la siguiente leccion.`);
  };

  const resetProgress = () => {
    const firstLesson = lessons[0];
    const firstLevel = firstLesson?.levels?.[0];

    setProgress({ completedLevels: [] });
    localStorage.removeItem(PROGRESS_KEY);
    setActiveLessonId(firstLesson?.id || null);
    setActiveLevelId(firstLevel?.id || null);
    setMessage("Progreso reiniciado.");
  };

  return (
    <section className="game-course-page">
      <div className="game-course-header">
        <button className="back-course-button" type="button" onClick={() => setPage("python")}>
          <i className="fas fa-arrow-left"></i>
          Volver
        </button>
        <div>
          <span>Curso Python</span>
          <h1>Ruta de niveles</h1>
        </div>
        <button className="back-course-button" type="button" onClick={resetProgress}>
          Reiniciar
        </button>
      </div>

      <div className="game-course-layout">
        <div className="level-map">
          {lessons.map((lesson, index) => {
            const isCompleted = isLessonCompleted(lesson);
            const isUnlocked = unlockedLessonIds.has(lesson.id);
            const isActive = activeLessonId === lesson.id;

            return (
              <button
                className={`map-node ${isCompleted ? "completed" : ""} ${isUnlocked ? "unlocked" : "locked"} ${isActive ? "active" : ""}`}
                type="button"
                key={lesson.id}
                onClick={() => selectLesson(lesson)}
              >
                <span className="node-number">{index + 1}</span>
                <span className="node-title">{lesson.title}</span>
                <i className={`fas fa-${isCompleted ? "check" : isUnlocked ? "play" : "lock"}`}></i>
              </button>
            );
          })}
          {lessons.length === 0 && <p>No hay lecciones registradas todavia.</p>}
        </div>

        <article className="level-detail-panel">
          {activeLesson ? (
            <>
              <div className="level-detail-heading">
                <span>Leccion {activeLesson.order}</span>
                <h2>{activeLesson.title}</h2>
                <p>{activeLesson.description}</p>
              </div>

              <div className="level-stage-list">
                {activeLesson.levels.map((level, index) => {
                  const completed = isLevelCompleted(activeLesson.id, level.id);
                  const unlocked = isLevelUnlocked(activeLesson, index);
                  const active = activeLevelId === level.id;

                  return (
                    <button
                      className={`level-stage-card ${completed ? "completed" : ""} ${unlocked ? "unlocked" : "locked"} ${active ? "active" : ""}`}
                      type="button"
                      key={level.id}
                      onClick={() => selectLevel(activeLesson, level, index)}
                    >
                      <span>{level.order}</span>
                      <strong>{level.title}</strong>
                      <i className={`fas fa-${completed ? "check" : unlocked ? "play" : "lock"}`}></i>
                    </button>
                  );
                })}
                {activeLesson.levels.length === 0 && <p>Esta leccion aun no tiene niveles.</p>}
              </div>

              <div className="single-level-panel">
                {activeLevel ? (
                  <>
                    <span>Apartado {activeLevel.order}</span>
                    <h3>{activeLevel.title}</h3>
                    <p>{activeLevel.description}</p>
                    <div className="level-xp-chip">+{activeLevel.xpReward ?? activeLesson.xpReward ?? 10} XP</div>
                    {activeLevel.content && <div className="level-content-box">{activeLevel.content}</div>}
                    <button
                      className="complete-level-button"
                      type="button"
                      onClick={completeLevel}
                      disabled={isLevelCompleted(activeLesson.id, activeLevel.id)}
                    >
                      {isLevelCompleted(activeLesson.id, activeLevel.id)
                        ? "Apartado completado"
                        : "Completar apartado"}
                    </button>
                  </>
                ) : (
                  <p>Selecciona un apartado disponible para comenzar.</p>
                )}
              </div>
            </>
          ) : (
            <p>Selecciona una leccion disponible para comenzar.</p>
          )}

          {message && <p className="game-message">{message}</p>}
        </article>
      </div>
    </section>
  );
}

export default PythonCourse;
