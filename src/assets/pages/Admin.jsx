import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:3001/api";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const result = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const detail = result?.error?.details?.[0];
    throw new Error(detail || result?.error?.message || "No se pudo completar la solicitud.");
  }

  return result;
}

function Admin() {
  const [adminKey, setAdminKey] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminData, setAdminData] = useState({
    courses: [],
    users: [],
    pythonLessons: [],
    userLevels: [],
    forumTopics: []
  });
  const [adminSection, setAdminSection] = useState("courses");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para lecciones Python (existentes)
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", xpReward: 0, order: 0 });
  const [levelForm, setLevelForm] = useState({
    title: "",
    description: "",
    content: "",
    xpReward: 10,
    order: 0,
    requiresValidation: false,
    expectedOutput: "",
    languageId: 71
  });
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const selectedCourse =
    adminData.courses.find((course) => String(course.id) === String(selectedCourseId)) ||
    adminData.courses[0] ||
    null;
  const selectedCourseType = selectedCourse?.type || selectedCourse?.page || "python";

  // Estados para nuevos elementos
  const [newUserLevel, setNewUserLevel] = useState({
    title: "",
    description: "",
    minXp: "",
    badge: ""
  });

  const fetchAdminData = useCallback(async (key = adminKey) => {
    try {
      const result = await requestJson("/admin/database", {
        headers: { "x-admin-key": key }
      });
      setAdminData(result.data);
    } catch (error) {
      setMessage(error.message);
      setAdminAuthed(false);
      localStorage.removeItem("codexling-admin-key");
    }
  }, [adminKey]);

  useEffect(() => {
    const savedAdminKey = localStorage.getItem("codexling-admin-key");
    if (savedAdminKey) {
      setAdminKey(savedAdminKey);
      setAdminAuthed(true);
      fetchAdminData(savedAdminKey);
    }
  }, [fetchAdminData]);

  useEffect(() => {
    if (adminData.courses.length === 0) {
      setSelectedCourseId("");
      return;
    }

    const selectedCourseExists = adminData.courses.some(
      (course) => String(course.id) === String(selectedCourseId)
    );

    if (!selectedCourseExists) {
      setSelectedCourseId(String(adminData.courses[0].id));
    }
  }, [adminData.courses, selectedCourseId]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await requestJson("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey })
      });

      setAdminAuthed(true);
      localStorage.setItem("codexling-admin-key", adminKey);
      await fetchAdminData();
      setMessage("Acceso concedido como administrador.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = useCallback(async (courseType = selectedCourseType) => {
    try {
      const response = await fetch(`${API_URL}/courses/${courseType}/lessons`);
      const data = await response.json();
      const loadedLessons = data.data || [];
      setLessons(loadedLessons);
      setSelectedLesson((currentLesson) =>
        currentLesson
          ? loadedLessons.find((lesson) => lesson.id === currentLesson.id) || null
          : null
      );
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    }
  }, [selectedCourseType]);

  useEffect(() => {
    if (!adminAuthed || !selectedCourseType) {
      return;
    }

    setSelectedLesson(null);
    fetchLessons(selectedCourseType);
  }, [adminAuthed, selectedCourseType, fetchLessons]);

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingLesson
        ? `${API_URL}/admin/courses/${selectedCourseType}/lessons/${editingLesson.id}`
        : `${API_URL}/admin/courses/${selectedCourseType}/lessons`;
      const method = editingLesson ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(lessonForm),
      });

      if (response.ok) {
        fetchLessons(selectedCourseType);
        await fetchAdminData();
        setShowLessonForm(false);
        setLessonForm({ title: "", description: "", xpReward: 0, order: 0 });
        setEditingLesson(null);
        setMessage("Lección guardada correctamente.");
      } else {
        const error = await response.json();
        setMessage(error.error?.message || "Error al guardar la lección.");
      }
    } catch (error) {
      setMessage("Error al guardar la lección: " + error.message);
    }
  };

  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLesson) return;

    try {
      const url = editingLevel
        ? `${API_URL}/admin/courses/${selectedCourseType}/lessons/${selectedLesson.id}/levels/${editingLevel.id}`
        : `${API_URL}/admin/courses/${selectedCourseType}/lessons/${selectedLesson.id}/levels`;
      const method = editingLevel ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(levelForm),
      });

      if (response.ok) {
        fetchLessons(selectedCourseType);
        await fetchAdminData();
        setShowLevelForm(false);
        setLevelForm({
          title: "",
          description: "",
          content: "",
          xpReward: 10,
          order: 0,
          requiresValidation: false,
          expectedOutput: "",
          languageId: 71
        });
        setEditingLevel(null);
        setMessage("Nivel guardado correctamente.");
      } else {
        const error = await response.json();
        setMessage(error.error?.message || "Error al guardar el nivel.");
      }
    } catch (error) {
      setMessage("Error al guardar el nivel: " + error.message);
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta lección?")) return;
    try {
      const response = await fetch(`${API_URL}/admin/courses/${selectedCourseType}/lessons/${lessonId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      if (response.ok) {
        fetchLessons(selectedCourseType);
        await fetchAdminData();
        if (selectedLesson && selectedLesson.id === lessonId) {
          setSelectedLesson(null);
        }
        setMessage("Lección eliminada correctamente.");
      } else {
        const error = await response.json();
        setMessage(error.error?.message || "Error al eliminar la lección.");
      }
    } catch (error) {
      setMessage("Error al eliminar la lección: " + error.message);
    }
  };

  const deleteLevel = async (levelId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este nivel?")) return;
    try {
      const response = await fetch(`${API_URL}/admin/courses/${selectedCourseType}/lessons/${selectedLesson.id}/levels/${levelId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      if (response.ok) {
        fetchLessons(selectedCourseType);
        await fetchAdminData();
        setMessage("Nivel eliminado correctamente.");
      } else {
        const error = await response.json();
        setMessage(error.error?.message || "Error al eliminar el nivel.");
      }
    } catch (error) {
      setMessage("Error al eliminar el nivel: " + error.message);
    }
  };

  const editLesson = (lesson) => {
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      xpReward: lesson.xpReward,
      order: lesson.order,
    });
    setEditingLesson(lesson);
    setShowLessonForm(true);
  };

  const editLevel = (level) => {
    setLevelForm({
      title: level.title,
      description: level.description,
      content: level.content,
      xpReward: level.xpReward,
      order: level.order,
      requiresValidation: level.requiresValidation || false,
      expectedOutput: level.expectedOutput || "",
      languageId: level.languageId || 71,
    });
    setEditingLevel(level);
    setShowLevelForm(true);
  };

  // Funciones para cursos, usuarios y niveles de usuario
  const updateAdminField = (collection, id, field, value) => {
    setAdminData((currentData) => ({
      ...currentData,
      [collection]: currentData[collection].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const saveAdminRecord = async (collection, item) => {
    const path = collection === "courses" ? `/admin/courses/${item.id}` : `/admin/users/${item.id}`;
    const payload = collection === "courses"
      ? { title: item.title, icon: item.icon, description: item.description, page: item.page, type: item.type }
      : { name: item.name, email: item.email };

    try {
      const result = await requestJson(path, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(payload)
      });
      setMessage(result.message);
      await fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteAdminRecord = async (collection, id) => {
    const path = collection === "courses" ? `/admin/courses/${id}` : `/admin/users/${id}`;

    try {
      await requestJson(path, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      setMessage("Registro eliminado correctamente.");
      await fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveForumTopic = async (topic) => {
    try {
      const result = await requestJson(`/admin/forum/topics/${topic.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({ title: topic.title, body: topic.body })
      });
      setMessage(result.message);
      await fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteForumTopic = async (topicId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este tema del foro?")) return;

    try {
      await requestJson(`/admin/forum/topics/${topicId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      setMessage("Tema eliminado correctamente.");
      await fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteForumComment = async (topicId, commentId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario?")) return;

    try {
      await requestJson(`/admin/forum/topics/${topicId}/comments/${commentId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      setMessage("Comentario eliminado correctamente.");
      await fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const createUserLevel = async (event) => {
    event.preventDefault();

    try {
      const result = await requestJson("/admin/user-levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(newUserLevel)
      });
      setMessage(result.message);
      setNewUserLevel({ title: "", description: "", minXp: "", badge: "" });
      await fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveUserLevel = async (level) => {
    try {
      const result = await requestJson(`/admin/user-levels/${level.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({
          title: level.title,
          description: level.description,
          minXp: level.minXp,
          badge: level.badge
        })
      });
      setMessage(result.message);
      await fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteUserLevel = async (levelId) => {
    try {
      await requestJson(`/admin/user-levels/${levelId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      setMessage("Nivel de experiencia eliminado correctamente.");
      await fetchAdminData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!adminAuthed) {
    return (
      <div className="admin-login">
        <h1>Acceso de Administrador</h1>
        <form onSubmit={handleAdminLogin}>
          <label>
            Clave de administrador
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Validando..." : "Entrar como admin"}
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    );
  }

  const renderAdminActions = () => (
    <div className="admin-tabs">
      <button
        className={adminSection === "courses" ? "active" : ""}
        onClick={() => setAdminSection("courses")}
      >
        Cursos
      </button>
      <button
        className={adminSection === "users" ? "active" : ""}
        onClick={() => setAdminSection("users")}
      >
        Usuarios
      </button>
      <button
        className={adminSection === "userLevels" ? "active" : ""}
        onClick={() => setAdminSection("userLevels")}
      >
        Niveles XP
      </button>
      <button
        className={adminSection === "forum" ? "active" : ""}
        onClick={() => setAdminSection("forum")}
      >
        Foro
      </button>
    </div>
  );

  const renderCoursesSection = () => {
    return (
      <div className="admin-section">
        <h2>Gestión de Cursos</h2>
        <div className="course-selector">
          <label>Seleccionar curso:</label>
          <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
            {adminData.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title || `Curso ${course.id}`}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div className="admin-record">
            <h3>Editar Curso</h3>
            {["title", "icon", "description", "page", "type"].map((field) => (
              <label key={field}>
                {field}
                <input
                  value={selectedCourse[field] || ""}
                  onChange={(e) => updateAdminField("courses", selectedCourse.id, field, e.target.value)}
                />
              </label>
            ))}
            <div className="admin-actions">
              <button
                className="admin-action-button save"
                type="button"
                onClick={() => saveAdminRecord("courses", selectedCourse)}
              >
                <i className="fas fa-save" aria-hidden="true"></i>
                Guardar
              </button>
              <button
                className="admin-action-button delete"
                type="button"
                onClick={() => deleteAdminRecord("courses", selectedCourse.id)}
              >
                <i className="fas fa-trash-alt" aria-hidden="true"></i>
                Eliminar
              </button>
            </div>
          </div>
        )}

        {selectedCourse && (
          <div className="admin-course-content">
            <div className="section-header">
              <h3>Contenido del curso {selectedCourse.title || selectedCourseType.toUpperCase()}</h3>
              <button onClick={() => { setShowLessonForm(true); setEditingLesson(null); setSelectedLesson(null); }}>
                Nueva Lección
              </button>
            </div>
            {lessons.length === 0 ? (
              <p>No hay lecciones agregadas todavía para este curso.</p>
            ) : (
              <div className="lessons-list">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className={`lesson-item ${selectedLesson?.id === lesson.id ? 'selected' : ''}`}>
                    <div className="lesson-info" onClick={() => setSelectedLesson(lesson)}>
                      <h3>{lesson.title}</h3>
                      <p>{lesson.description}</p>
                      <span>XP: {lesson.xpReward} | Orden: {lesson.order}</span>
                    </div>
                    <div className="lesson-actions">
                      <button
                        className="admin-action-button edit"
                        type="button"
                        onClick={() => editLesson(lesson)}
                      >
                        <i className="fas fa-pen" aria-hidden="true"></i>
                        Editar
                      </button>
                      <button
                        className="admin-action-button delete"
                        type="button"
                        onClick={() => deleteLesson(lesson.id)}
                      >
                        <i className="fas fa-trash-alt" aria-hidden="true"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedLesson ? (
              <div className="levels-section">
                <div className="section-header">
                  <h3>Niveles de "{selectedLesson.title}"</h3>
                  <button onClick={() => setShowLevelForm(true)}>Nuevo Nivel</button>
                </div>
                <div className="levels-list">
                  {selectedLesson.levels.map((level) => (
                    <div key={level.id} className="level-item">
                      <div className="level-info">
                        <h4>{level.title}</h4>
                        <p>{level.description}</p>
                        <div className="level-details">
                          <span>XP: {level.xpReward}</span>
                          <span>Orden: {level.order}</span>
                          {level.requiresValidation && (
                            <span className="validation-badge">Validación activada</span>
                          )}
                        </div>
                      </div>
                      <div className="level-actions">
                        <button
                          className="admin-action-button edit"
                          type="button"
                          onClick={() => editLevel(level)}
                        >
                          <i className="fas fa-pen" aria-hidden="true"></i>
                          Editar
                        </button>
                        <button
                          className="admin-action-button delete"
                          type="button"
                          onClick={() => deleteLevel(level.id)}
                        >
                          <i className="fas fa-trash-alt" aria-hidden="true"></i>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="no-levels">Selecciona una lección para ver y editar sus niveles.</p>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderUsersSection = () => (
    <div className="admin-section">
      <h2>Gestión de Usuarios</h2>
      <div className="admin-list">
        {adminData.users.map((user) => (
          <div key={user.id} className="admin-record">
            <h3>Usuario {user.id}</h3>
            {["name", "email"].map((field) => (
              <label key={field}>
                {field}
                <input
                  value={user[field] || ""}
                  onChange={(e) => updateAdminField("users", user.id, field, e.target.value)}
                />
              </label>
            ))}
            <div className="admin-actions">
              <button onClick={() => saveAdminRecord("users", user)}>Guardar</button>
              <button onClick={() => deleteAdminRecord("users", user.id)} className="delete">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserLevelsSection = () => (
    <div className="admin-section">
      <h2>Gestión de Niveles de Experiencia</h2>

      <form onSubmit={createUserLevel} className="admin-form">
        <h3>Crear Nuevo Nivel</h3>
        <input
          type="text"
          placeholder="Título"
          value={newUserLevel.title}
          onChange={(e) => setNewUserLevel({ ...newUserLevel, title: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Badge"
          value={newUserLevel.badge}
          onChange={(e) => setNewUserLevel({ ...newUserLevel, badge: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="XP mínimo"
          value={newUserLevel.minXp}
          onChange={(e) => setNewUserLevel({ ...newUserLevel, minXp: e.target.value })}
          required
        />
        <textarea
          placeholder="Descripción"
          value={newUserLevel.description}
          onChange={(e) => setNewUserLevel({ ...newUserLevel, description: e.target.value })}
        />
        <button type="submit">Crear Nivel</button>
      </form>

      <div className="admin-list">
        {[...adminData.userLevels]
          .sort((a, b) => Number(a.minXp || 0) - Number(b.minXp || 0))
          .map((level) => (
            <div key={level.id} className="admin-record">
              <h3>{level.title || `Nivel ${level.id}`}</h3>
              {["title", "badge", "minXp", "description"].map((field) => (
                <label key={field}>
                  {field}
                  <input
                    type={field === "minXp" ? "number" : "text"}
                    value={level[field] || ""}
                    onChange={(e) => updateAdminField("userLevels", level.id, field, e.target.value)}
                  />
                </label>
              ))}
              <div className="admin-actions">
                <button onClick={() => saveUserLevel(level)}>Guardar</button>
                <button onClick={() => deleteUserLevel(level.id)} className="delete">Eliminar</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderForumSection = () => (
    <div className="admin-section">
      <h2>Gestión del Foro</h2>

      {adminData.forumTopics.length === 0 ? (
        <p>No hay temas en el foro todavía.</p>
      ) : (
        <div className="forum-topics-list">
          {adminData.forumTopics.map((topic) => (
            <div key={topic.id} className="forum-record">
              <h3>Tema #{topic.id}</h3>
              <label>
                Título
                <input
                  type="text"
                  value={topic.title || ""}
                  onChange={(e) => updateAdminField("forumTopics", topic.id, "title", e.target.value)}
                />
              </label>
              <label>
                Contenido
                <textarea
                  value={topic.body || ""}
                  onChange={(e) => updateAdminField("forumTopics", topic.id, "body", e.target.value)}
                />
              </label>
              <div className="admin-actions">
                <button onClick={() => saveForumTopic(topic)}>Guardar</button>
                <button className="delete" onClick={() => deleteForumTopic(topic.id)}>
                  Eliminar Tema
                </button>
              </div>

              <div className="forum-comments">
                <h4>Comentarios</h4>
                {topic.comments?.length > 0 ? (
                  topic.comments.map((comment) => (
                    <div key={comment.id} className="forum-comment">
                      <p>
                        <strong>{comment.authorName}</strong>: {comment.message}
                      </p>
                      <span>{new Date(comment.createdAt).toLocaleString()}</span>
                      <button
                        className="admin-action-button delete"
                        type="button"
                        onClick={() => deleteForumComment(topic.id, comment.id)}
                      >
                        Eliminar Comentario
                      </button>
                    </div>
                  ))
                ) : (
                  <p>No hay comentarios en este tema.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Panel de Administración</h1>
        <button onClick={() => {
          setAdminAuthed(false);
          setAdminKey("");
          localStorage.removeItem("codexling-admin-key");
        }} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>

      {renderAdminActions()}

      {message && <p className="message">{message}</p>}

      {adminSection === "courses" && renderCoursesSection()}
      {adminSection === "users" && renderUsersSection()}
      {adminSection === "forum" && renderForumSection()}
      {adminSection === "pythonLessons" && (
        <div className="admin-section">
          <h2>Gestión de Lecciones Python</h2>

          <div className="admin-content">
            <div className="lessons-section">
              <div className="section-header">
                <h2>Lecciones</h2>
                <button onClick={() => setShowLessonForm(true)}>Nueva Lección</button>
              </div>

              <div className="lessons-list">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className={`lesson-item ${selectedLesson?.id === lesson.id ? 'selected' : ''}`}>
                    <div className="lesson-info" onClick={() => setSelectedLesson(lesson)}>
                      <h3>{lesson.title}</h3>
                      <p>{lesson.description}</p>
                      <span>XP: {lesson.xpReward} | Orden: {lesson.order}</span>
                    </div>
                    <div className="lesson-actions">
                      <button
                        className="admin-action-button edit"
                        type="button"
                        onClick={() => editLesson(lesson)}
                      >
                        <i className="fas fa-pen" aria-hidden="true"></i>
                        Editar
                      </button>
                      <button
                        className="admin-action-button delete"
                        type="button"
                        onClick={() => deleteLesson(lesson.id)}
                      >
                        <i className="fas fa-trash-alt" aria-hidden="true"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedLesson && (
              <div className="levels-section">
                <div className="section-header">
                  <h2>Niveles de "{selectedLesson.title}"</h2>
                  <button onClick={() => setShowLevelForm(true)}>Nuevo Nivel</button>
                </div>

                <div className="levels-list">
                  {selectedLesson.levels.map((level) => (
                    <div key={level.id} className="level-item">
                      <div className="level-info">
                        <h4>{level.title}</h4>
                        <p>{level.description}</p>
                        <div className="level-details">
                          <span>XP: {level.xpReward}</span>
                          <span>Orden: {level.order}</span>
                          {level.requiresValidation && (
                            <span className="validation-badge">Validación activada</span>
                          )}
                        </div>
                      </div>
                      <div className="level-actions">
                        <button
                          className="admin-action-button edit"
                          type="button"
                          onClick={() => editLevel(level)}
                        >
                          <i className="fas fa-pen" aria-hidden="true"></i>
                          Editar
                        </button>
                        <button
                          className="admin-action-button delete"
                          type="button"
                          onClick={() => deleteLevel(level.id)}
                        >
                          <i className="fas fa-trash-alt" aria-hidden="true"></i>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {adminSection === "userLevels" && renderUserLevelsSection()}

      {showLessonForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingLesson ? 'Editar Lección' : 'Nueva Lección'}</h3>
            <form onSubmit={handleLessonSubmit}>
              <input
                type="text"
                placeholder="Título"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Descripción"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Recompensa XP"
                value={lessonForm.xpReward}
                onChange={(e) => setLessonForm({...lessonForm, xpReward: Number(e.target.value)})}
              />
              <input
                type="number"
                placeholder="Orden"
                value={lessonForm.order}
                onChange={(e) => setLessonForm({...lessonForm, order: Number(e.target.value)})}
              />
              <div className="modal-actions">
                <button type="submit">{editingLesson ? 'Actualizar' : 'Crear'}</button>
                <button type="button" onClick={() => {
                  setShowLessonForm(false);
                  setLessonForm({ title: "", description: "", xpReward: 0, order: 0 });
                  setEditingLesson(null);
                }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLevelForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingLevel ? 'Editar Nivel' : 'Nuevo Nivel'}</h3>
            <form onSubmit={handleLevelSubmit}>
              <input
                type="text"
                placeholder="Título"
                value={levelForm.title}
                onChange={(e) => setLevelForm({...levelForm, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Descripción"
                value={levelForm.description}
                onChange={(e) => setLevelForm({...levelForm, description: e.target.value})}
              />
              <textarea
                placeholder="Contenido"
                value={levelForm.content}
                onChange={(e) => setLevelForm({...levelForm, content: e.target.value})}
              />
              <input
                type="number"
                placeholder="Recompensa XP"
                value={levelForm.xpReward}
                onChange={(e) => setLevelForm({...levelForm, xpReward: Number(e.target.value)})}
              />
              <input
                type="number"
                placeholder="Orden"
                value={levelForm.order}
                onChange={(e) => setLevelForm({...levelForm, order: Number(e.target.value)})}
              />

              <div className="validation-section">
                <label>
                  <input
                    type="checkbox"
                    checked={levelForm.requiresValidation}
                    onChange={(e) => setLevelForm({...levelForm, requiresValidation: e.target.checked})}
                  />
                  Requiere validación de código
                </label>

                {levelForm.requiresValidation && (
                  <div className="validation-fields">
                    <input
                      type="text"
                      placeholder="Salida esperada"
                      value={levelForm.expectedOutput}
                      onChange={(e) => setLevelForm({...levelForm, expectedOutput: e.target.value})}
                      required
                    />
                    <input
                      type="number"
                      placeholder="ID del lenguaje (71 = Python)"
                      value={levelForm.languageId}
                      onChange={(e) => setLevelForm({...levelForm, languageId: Number(e.target.value)})}
                      required
                    />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit">{editingLevel ? 'Actualizar' : 'Crear'}</button>
                <button type="button" onClick={() => {
                  setShowLevelForm(false);
                  setLevelForm({
                    title: "",
                    description: "",
                    content: "",
                    xpReward: 10,
                    order: 0,
                    requiresValidation: false,
                    expectedOutput: "",
                    languageId: 71
                  });
                  setEditingLevel(null);
                }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
