import { useCallback, useEffect, useRef, useState } from "react";
import { API_URL, subscribeToRealtime } from "../../api/realtime";

const legacyPythonProgressKey = "codexling-python-progress";

function progressKey(courseType) {
  return `codexling-${courseType}-progress`;
}

function levelKey(lessonId, levelId) {
  return `${lessonId}:${levelId}`;
}

function readProgress(courseType) {
  const savedProgress =
    localStorage.getItem(progressKey(courseType)) ||
    (courseType === "python" ? localStorage.getItem(legacyPythonProgressKey) : null);

  if (!savedProgress) {
    return { completedLevels: [] };
  }

  const parsedProgress = JSON.parse(savedProgress);
  return Array.isArray(parsedProgress) ? { completedLevels: [] } : parsedProgress;
}

function PythonCourse({
  setPage,
  courseType = "python",
  courseTitle = "Python",
  backPage = "python"
}) {
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(() => readProgress(courseType));
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("codexling-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeLevelId, setActiveLevelId] = useState(null);
  const activeLessonIdRef = useRef(null);
  const activeLevelIdRef = useRef(null);
  const [sourceCode, setSourceCode] = useState("");
  const [compilerOutput, setCompilerOutput] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [message, setMessage] = useState("");
  const lessonsEventType = `${courseType}-lessons:updated`;

  useEffect(() => {
    activeLessonIdRef.current = activeLessonId;
  }, [activeLessonId]);

  useEffect(() => {
    activeLevelIdRef.current = activeLevelId;
  }, [activeLevelId]);

  const loadLessons = useCallback((keepCurrentSelection = false) => {
    return fetch(`${API_URL}/courses/${courseType}/lessons`)
      .then((response) => response.json())
      .then((result) => {
        const loadedLessons = result.data || [];
        const selectedLesson = keepCurrentSelection
          ? loadedLessons.find((lesson) => lesson.id === activeLessonIdRef.current)
          : null;
        const firstLesson = selectedLesson || loadedLessons[0];
        const selectedLevel = keepCurrentSelection
          ? firstLesson?.levels?.find((level) => level.id === activeLevelIdRef.current)
          : null;
        const firstLevel = selectedLevel || firstLesson?.levels?.[0];

        setLessons(loadedLessons);
        setActiveLessonId(firstLesson?.id || null);
        setActiveLevelId(firstLevel?.id || null);
        setSourceCode(firstLevel?.content || "");
      })
      .catch(() => {
        setLessons([]);
        setMessage("No se pudieron cargar las lecciones. Revisa que el backend este encendido.");
      });
  }, [courseType]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  useEffect(() => {
    return subscribeToRealtime([lessonsEventType], () => loadLessons(true));
  }, [lessonsEventType, loadLessons]);

  useEffect(() => {
    setProgress(readProgress(courseType));
    setMessage("");
  }, [courseType]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setProgress({
      completedLevels:
        currentUser.completedCourseLevels?.[courseType] ||
        currentUser.profile?.completedCourseLevels?.[courseType] ||
        (courseType === "python"
          ? currentUser.completedPythonLevels || currentUser.profile?.completedPythonLevels || []
          : [])
    });
  }, [courseType, currentUser]);

  const completedLevelKeys = progress.completedLevels || [];
  const isLevelCompleted = (lessonId, levelId) =>
    completedLevelKeys.includes(levelKey(lessonId, levelId));

  // Calcula activeLevel
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId);
  const activeLevel = activeLesson?.levels.find((level) => level.id === activeLevelId);
  const activeLevelCompleted = activeLesson && activeLevel
    ? isLevelCompleted(activeLesson.id, activeLevel.id)
    : false;
  const requiresValidCode = Boolean(activeLevel?.requiresValidation);
  const hasValidCodeResult = Boolean(compilerOutput?.success);
  const canCompleteActiveLevel = !activeLevelCompleted && (!requiresValidCode || hasValidCodeResult);

  useEffect(() => {
    if (activeLevel) {
      setSourceCode(activeLevel.content || "");
      setCompilerOutput(null);
      setValidationStatus(null);
    }
  }, [activeLevel]);

  useEffect(() => {
    const syncUser = (event) => {
      setCurrentUser(event.detail);
    };

    window.addEventListener("codexling-user-updated", syncUser);
    return () => window.removeEventListener("codexling-user-updated", syncUser);
  }, []);

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

    if (activeLevel.requiresValidation && !compilerOutput?.success) {
      setMessage("Ejecuta el codigo y valida la salida esperada antes de avanzar.");
      return;
    }

    const completedKey = levelKey(activeLesson.id, activeLevel.id);
    let earnedMessage = "Apartado completado localmente. Inicia sesion para guardar XP en tu perfil.";

    if (currentUser?.id) {
      try {
        const response = await fetch(`${API_URL}/users/${currentUser.id}/progress/courses/${courseType}/levels`, {
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
    localStorage.setItem(progressKey(courseType), JSON.stringify(newProgress));

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
    localStorage.removeItem(progressKey(courseType));
    if (courseType === "python") {
      localStorage.removeItem(legacyPythonProgressKey);
    }
    setActiveLessonId(firstLesson?.id || null);
    setActiveLevelId(firstLevel?.id || null);
    setMessage("Progreso reiniciado.");
  };

  const formatContent = (text) => {
    if (!text) return null;
    const normalized = String(text).replace(/\r\n/g, "\n");
    const paragraphs = normalized.split(/\n{2,}/);

    return paragraphs.map((para, pIndex) => {
      const lines = para.split("\n");
      return (
        <p key={pIndex}>
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      );
    });
  };

  return (
    <section className="game-course-page">
      <div className="game-course-header">
        <button className="back-course-button" type="button" onClick={() => setPage(backPage)}>
          <i className="fas fa-arrow-left"></i>
          Volver
        </button>
        <div>
          <span>Curso {courseTitle}</span>
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
                    {activeLevel.content && (
                      <div className="level-content-box">{formatContent(activeLevel.content)}</div>
                    )}

                    {activeLevel.requiresValidation ? (
                      <div className="code-compiler-section">
                        <div className="compiler-editor">
                          <label>Escribe tu codigo {courseTitle}:</label>
                          <textarea
                            className="code-editor"
                            value={sourceCode}
                            onChange={(e) => {
                              setSourceCode(e.target.value);
                              setCompilerOutput(null);
                              setValidationStatus(null);
                            }}
                            placeholder="# Escribe tu codigo aqui"
                          />
                          <div className="compiler-buttons">
                            <button
                              className="run-code-button"
                              type="button"
                              onClick={async () => {
                                setIsValidating(true);
                                setCompilerOutput(null);
                                setValidationStatus(null);
                                try {
                                  const response = await fetch(
                                    `${API_URL}/courses/${courseType}/lessons/${activeLesson.id}/levels/${activeLevel.id}/validate`,
                                    {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ source_code: sourceCode })
                                    }
                                  );
                                  const result = await response.json();

                                  if (!response.ok) {
                                    setCompilerOutput({
                                      success: false,
                                      status: "error",
                                      message: result?.error?.message || "No se pudo validar el codigo.",
                                      stdout: "",
                                      stderr: ""
                                    });
                                    setValidationStatus("error");
                                    return;
                                  }

                                  setCompilerOutput(result);

                                  if (result?.success) {
                                    setValidationStatus("completed");
                                  } else {
                                    setValidationStatus(result?.status || "error");
                                  }
                                } catch (error) {
                                  setCompilerOutput({
                                    success: false,
                                    message: error.message,
                                    stdout: "",
                                    stderr: "",
                                    status: "CONNECTION_ERROR"
                                  });
                                  setValidationStatus("error");
                                } finally {
                                  setIsValidating(false);
                                }
                              }}
                              disabled={isValidating}
                            >
                              {isValidating ? "Ejecutando..." : "Ejecutar codigo"}
                            </button>
                          </div>
                        </div>

                        {compilerOutput && (
                          <div className={`compiler-output ${validationStatus}`}>
                            <h4>Resultado:</h4>
                            <pre>
                              {compilerOutput.stdout ||
                                compilerOutput.stderr ||
                                compilerOutput.compileOutput ||
                                compilerOutput.message ||
                                JSON.stringify(compilerOutput, null, 2)}
                            </pre>

                            {compilerOutput.expectedOutput !== undefined && (
                              <p>
                                <strong>Esperado:</strong>
                                <br />
                                <code>{String(compilerOutput.expectedOutput)}</code>
                              </p>
                            )}

                            {compilerOutput.actualOutput !== undefined && (
                              <p>
                                <strong>Obtenido:</strong>
                                <br />
                                <code>{String(compilerOutput.actualOutput)}</code>
                              </p>
                            )}

                            {compilerOutput.stderr && (
                              <p>
                                <strong>stderr (errores):</strong>
                                <br />
                                <code>{String(compilerOutput.stderr)}</code>
                              </p>
                            )}

                            {compilerOutput.compileOutput && (
                              <p>
                                <strong>Compilacion:</strong>
                                <br />
                                <code>{String(compilerOutput.compileOutput)}</code>
                              </p>
                            )}

                            {compilerOutput.stdout && (
                              <p>
                                <strong>stdout (salida):</strong>
                                <br />
                                <code>{String(compilerOutput.stdout)}</code>
                              </p>
                            )}

                            {compilerOutput.success && (
                              <p className="validation-success">✓ Código validado correctamente</p>
                            )}
                            {!compilerOutput.success && (
                              <p className="validation-error">✗ No coincide la salida / o hubo un error de ejecución</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : null}

                    <button
                      className="complete-level-button"
                      type="button"
                      onClick={completeLevel}
                      disabled={!canCompleteActiveLevel}
                    >
                      {activeLevelCompleted
                        ? "Apartado completado"
                        : requiresValidCode && !hasValidCodeResult
                          ? "Valida el codigo para continuar"
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
