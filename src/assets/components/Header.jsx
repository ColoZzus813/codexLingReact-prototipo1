import { useEffect, useState } from "react";
import logo from "../img/logocodex.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const result = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const detail = result?.error?.details?.[0];
    throw new Error(detail || result?.error?.message || "No se pudo completar la solicitud.");
  }

  return result;
}

function Header({
  setPage,
  toggleMenu,
  search,
  setSearch,
  showSearch,
  setShowSearch
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminKey, setAdminKey] = useState("");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [adminData, setAdminData] = useState({
    courses: [],
    users: [],
    pythonLessons: [],
    userLevels: []
  });
  const [adminSection, setAdminSection] = useState("courses");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [newLesson, setNewLesson] = useState({ title: "", description: "", xpReward: "", order: "" });
  const [newUserLevel, setNewUserLevel] = useState({
    title: "",
    description: "",
    minXp: "",
    badge: ""
  });
  const [newLevelByLesson, setNewLevelByLesson] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("codexling-user");
    const savedAdminKey = localStorage.getItem("codexling-admin-key");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    if (savedAdminKey) {
      setAdminKey(savedAdminKey);
      setAdminAuthed(true);
      requestJson("/admin/database", {
        headers: { "x-admin-key": savedAdminKey }
      })
        .then((result) => setAdminData(result.data))
        .catch(() => {
          localStorage.removeItem("codexling-admin-key");
          setAdminAuthed(false);
          setAdminKey("");
        });
    }
  }, []);

  useEffect(() => {
    const syncUser = (event) => {
      setCurrentUser(event.detail);
    };

    window.addEventListener("codexling-user-updated", syncUser);
    return () => window.removeEventListener("codexling-user-updated", syncUser);
  }, []);

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

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    setPage("home");
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage("home");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value
    }));
  };

  const resetAuthForm = () => {
    setFormData({
      name: "",
      email: "",
      password: ""
    });
  };

  const handleAuthMode = (mode) => {
    setAuthMode(mode);
    setAuthMessage("");
    resetAuthForm();

    if (mode === "admin" && adminAuthed) {
      fetchAdminData(adminKey);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("codexling-user");
    setCurrentUser(null);
    setAuthMessage("Sesion cerrada correctamente.");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    const endpoint = authMode === "register" ? "/users/register" : "/users/login";
    const body =
      authMode === "register"
        ? formData
        : {
            email: formData.email,
            password: formData.password
          };

    try {
      const result = await requestJson(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      setCurrentUser(result.data);
      localStorage.setItem("codexling-user", JSON.stringify(result.data));
      setAuthMessage(result.message);
      resetAuthForm();
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAdminData = async (key = adminKey) => {
    if (!key) {
      return;
    }

    const result = await requestJson("/admin/database", {
      headers: { "x-admin-key": key }
    });
    setAdminData(result.data);
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage("");

    try {
      const result = await requestJson("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey })
      });

      setAdminAuthed(true);
      localStorage.setItem("codexling-admin-key", adminKey);
      setAuthMessage(result.message);
      await fetchAdminData(adminKey);
    } catch (error) {
      setAdminAuthed(false);
      localStorage.removeItem("codexling-admin-key");
      setAuthMessage(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setAdminAuthed(false);
    setAdminKey("");
    setAdminData({ courses: [], users: [], pythonLessons: [], userLevels: [] });
    setSelectedCourseId("");
    localStorage.removeItem("codexling-admin-key");
    setAuthMessage("Administrador desconectado.");
  };

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
    const payload =
      collection === "courses"
        ? {
            title: item.title,
            icon: item.icon,
            description: item.description,
            page: item.page,
            type: item.type
          }
        : {
            name: item.name,
            email: item.email
          };

    try {
      const result = await requestJson(path, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(payload)
      });
      setAuthMessage(result.message);
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const deleteAdminRecord = async (collection, id) => {
    const path = collection === "courses" ? `/admin/courses/${id}` : `/admin/users/${id}`;

    try {
      await requestJson(path, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      setAuthMessage("Registro eliminado correctamente.");
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const updateLevelField = (lessonId, levelId, field, value) => {
    setAdminData((currentData) => ({
      ...currentData,
      pythonLessons: currentData.pythonLessons.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              levels: lesson.levels.map((level) =>
                level.id === levelId ? { ...level, [field]: value } : level
              )
            }
          : lesson
      )
    }));
  };

  const handleNewLevelChange = (lessonId, field, value) => {
    setNewLevelByLesson((currentLevels) => ({
      ...currentLevels,
      [lessonId]: {
        title: "",
        description: "",
        content: "",
        xpReward: "",
        order: "",
        ...currentLevels[lessonId],
        [field]: value
      }
    }));
  };

  const createLesson = async (event) => {
    event.preventDefault();

    try {
      const result = await requestJson("/admin/python-lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(newLesson)
      });
      setAuthMessage(result.message);
      setNewLesson({ title: "", description: "", xpReward: "", order: "" });
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const saveLesson = async (lesson) => {
    try {
      const result = await requestJson(`/admin/python-lessons/${lesson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({
          title: lesson.title,
          description: lesson.description,
          xpReward: lesson.xpReward,
          order: lesson.order
        })
      });
      setAuthMessage(result.message);
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const deleteLesson = async (lessonId) => {
    try {
      await requestJson(`/admin/python-lessons/${lessonId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      setAuthMessage("Leccion eliminada correctamente.");
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const createLevel = async (lessonId) => {
    const level = newLevelByLesson[lessonId] || {};

    try {
      const result = await requestJson(`/admin/python-lessons/${lessonId}/levels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify(level)
      });
      setAuthMessage(result.message);
      setNewLevelByLesson((currentLevels) => ({
        ...currentLevels,
        [lessonId]: { title: "", description: "", content: "", xpReward: "", order: "" }
      }));
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const saveLevel = async (lessonId, level) => {
    try {
      const result = await requestJson(`/admin/python-lessons/${lessonId}/levels/${level.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey
        },
        body: JSON.stringify({
          title: level.title,
          description: level.description,
          content: level.content,
          xpReward: level.xpReward,
          order: level.order
        })
      });
      setAuthMessage(result.message);
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const deleteLevel = async (lessonId, levelId) => {
    try {
      await requestJson(`/admin/python-lessons/${lessonId}/levels/${levelId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      setAuthMessage("Nivel eliminado correctamente.");
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
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
      setAuthMessage(result.message);
      setNewUserLevel({ title: "", description: "", minXp: "", badge: "" });
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
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
      setAuthMessage(result.message);
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const deleteUserLevel = async (levelId) => {
    try {
      await requestJson(`/admin/user-levels/${levelId}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      setAuthMessage("Nivel de experiencia eliminado correctamente.");
      await fetchAdminData();
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const renderAdminActions = () => (
    <div className="admin-actions">
      <div className="admin-switch">
        <button
          className={adminSection === "courses" ? "active" : ""}
          type="button"
          onClick={() => setAdminSection("courses")}
        >
          Cursos
        </button>
        <button
          className={adminSection === "users" ? "active" : ""}
          type="button"
          onClick={() => setAdminSection("users")}
        >
          Usuarios
        </button>
        <button
          className={adminSection === "userLevels" ? "active" : ""}
          type="button"
          onClick={() => setAdminSection("userLevels")}
        >
          Niveles XP
        </button>
      </div>
      <button className="admin-link" type="button" onClick={() => fetchAdminData()}>
        Actualizar
      </button>
      <button className="admin-link danger" type="button" onClick={handleAdminLogout}>
        Salir admin
      </button>
    </div>
  );

  const renderPythonLessonManager = () => (
    <div className="python-admin-section">
      <div className="admin-section-title">
        <strong>Contenido del curso Python</strong>
        <span>Lecciones y niveles</span>
      </div>

      <form className="admin-record" onSubmit={createLesson}>
        <div className="admin-record-header">
          <strong>Nueva leccion de Python</strong>
          <button type="submit">Agregar</button>
        </div>
        <label>
          title
          <input
            value={newLesson.title}
            onChange={(event) => setNewLesson({ ...newLesson, title: event.target.value })}
            required
          />
        </label>
        <label>
          description
          <input
            value={newLesson.description}
            onChange={(event) => setNewLesson({ ...newLesson, description: event.target.value })}
          />
        </label>
        <label>
          xp
          <input
            type="number"
            min="0"
            value={newLesson.xpReward}
            onChange={(event) => setNewLesson({ ...newLesson, xpReward: event.target.value })}
          />
        </label>
        <label>
          orden
          <input
            type="number"
            min="1"
            value={newLesson.order}
            onChange={(event) => setNewLesson({ ...newLesson, order: event.target.value })}
          />
        </label>
      </form>

      <div className="admin-list">
        {adminData.pythonLessons.map((lesson) => (
          <div className="admin-record python-admin-record" key={`python-lesson-${lesson.id}`}>
            <div className="admin-record-header">
              <strong>Leccion {lesson.id}</strong>
              <div>
                <button type="button" onClick={() => saveLesson(lesson)}>
                  Guardar
                </button>
                <button type="button" onClick={() => deleteLesson(lesson.id)}>
                  Eliminar
                </button>
              </div>
            </div>
            {["title", "description", "xpReward", "order"].map((field) => (
              <label key={field}>
                {adminFieldLabels[field] || field}
                <input
                  type={field === "order" || field === "xpReward" ? "number" : "text"}
                  min={field === "order" ? "1" : field === "xpReward" ? "0" : undefined}
                  value={lesson[field] || ""}
                  onChange={(event) =>
                    updateAdminField("pythonLessons", lesson.id, field, event.target.value)
                  }
                />
              </label>
            ))}

            <div className="level-admin-list">
              <strong>Niveles</strong>
              {lesson.levels.map((level) => (
                <div className="level-admin-record" key={`level-${lesson.id}-${level.id}`}>
                  <div className="admin-record-header">
                    <span>Nivel {level.id}</span>
                    <div>
                      <button type="button" onClick={() => saveLevel(lesson.id, level)}>
                        Guardar
                      </button>
                      <button type="button" onClick={() => deleteLevel(lesson.id, level.id)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                  {[
                    "title",
                    "description",
                    "content",
                    "xpReward",
                    "order",
                    "hasCompiler",
                    "expectedOutput",
                    "language",
                    "compilerInstructions"
                  ].map((field) => (
                    <label key={field}>
                      {adminFieldLabels[field] || field}
                      {field === "hasCompiler" ? (
                        <input
                          type="checkbox"
                          checked={level[field] || false}
                          onChange={(event) =>
                            updateLevelField(lesson.id, level.id, field, event.target.checked)
                          }
                        />
                      ) : (
                        <input
                          type={field === "order" || field === "xpReward" ? "number" : "text"}
                          min={field === "order" ? "1" : field === "xpReward" ? "0" : undefined}
                          value={level[field] || ""}
                          onChange={(event) =>
                            updateLevelField(lesson.id, level.id, field, event.target.value)
                          }
                        />
                      )}
                    </label>
                  ))}
                </div>
              ))}

              <div className="level-admin-record new-level">
                <div className="admin-record-header">
                  <span>Nuevo nivel</span>
                  <button type="button" onClick={() => createLevel(lesson.id)}>
                    Agregar nivel
                  </button>
                </div>
                {[
                  "title",
                  "description",
                  "content",
                  "xpReward",
                  "order",
                  "hasCompiler",
                  "expectedOutput",
                  "language",
                  "compilerInstructions"
                ].map((field) => (
                  <label key={field}>
                    {adminFieldLabels[field] || field}
                    {field === "hasCompiler" ? (
                      <input
                        type="checkbox"
                        checked={newLevelByLesson[lesson.id]?.[field] || false}
                        onChange={(event) => handleNewLevelChange(lesson.id, field, event.target.checked)}
                      />
                    ) : (
                      <input
                        type={field === "order" || field === "xpReward" ? "number" : "text"}
                        min={field === "order" ? "1" : field === "xpReward" ? "0" : undefined}
                        value={newLevelByLesson[lesson.id]?.[field] || ""}
                        onChange={(event) => handleNewLevelChange(lesson.id, field, event.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
        {adminData.pythonLessons.length === 0 && (
          <p className="auth-message">No hay lecciones de Python guardadas.</p>
        )}
      </div>
    </div>
  );

  const isPythonCourse = (course) => course?.type === "python" || course?.page === "python";
  const adminFieldLabels = {
    title: "Titulo",
    icon: "Icono",
    description: "Descripcion",
    content: "Contenido",
    xpReward: "XP al completar",
    minXp: "XP minima",
    badge: "Insignia",
    order: "Orden",
    page: "Pagina",
    type: "Tipo",
    name: "Nombre",
    email: "Correo",
    hasCompiler: "Tiene compilador",
    expectedOutput: "Salida esperada",
    language: "Lenguaje",
    compilerInstructions: "Instrucciones del compilador"
  };

  const renderUserLevelManager = () => (
    <div className="admin-panel">
      {renderAdminActions()}

      <form className="admin-record" onSubmit={createUserLevel}>
        <div className="admin-record-header">
          <strong>Nuevo nivel de experiencia</strong>
          <button type="submit">Agregar</button>
        </div>
        {["title", "badge", "minXp", "description"].map((field) => (
          <label key={`new-user-level-${field}`}>
            {adminFieldLabels[field] || field}
            <input
              type={field === "minXp" ? "number" : "text"}
              min={field === "minXp" ? "0" : undefined}
              value={newUserLevel[field] || ""}
              onChange={(event) =>
                setNewUserLevel({ ...newUserLevel, [field]: event.target.value })
              }
              required={field === "title" || field === "minXp"}
            />
          </label>
        ))}
      </form>

      <div className="admin-list">
        {[...adminData.userLevels]
          .sort((first, second) => Number(first.minXp || 0) - Number(second.minXp || 0))
          .map((level) => (
            <div className="admin-record" key={`user-level-${level.id}`}>
              <div className="admin-record-header">
                <strong>{level.title || `Nivel ${level.id}`}</strong>
                <div>
                  <button type="button" onClick={() => saveUserLevel(level)}>
                    Guardar
                  </button>
                  <button type="button" onClick={() => deleteUserLevel(level.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
              {["title", "badge", "minXp", "description"].map((field) => (
                <label key={`user-level-${level.id}-${field}`}>
                  {adminFieldLabels[field] || field}
                  <input
                    type={field === "minXp" ? "number" : "text"}
                    min={field === "minXp" ? "0" : undefined}
                    value={level[field] || ""}
                    onChange={(event) =>
                      updateAdminField("userLevels", level.id, field, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>
          ))}
        {adminData.userLevels.length === 0 && (
          <p className="auth-message">No hay niveles de experiencia guardados.</p>
        )}
      </div>

      {authMessage && <p className="auth-message">{authMessage}</p>}
    </div>
  );

  const renderAdminRecord = (item, fields) => (
    <div className="admin-record" key={`${adminSection}-${item.id}`}>
      <div className="admin-record-header">
        <strong>{adminSection === "courses" ? "Datos del curso" : `Usuario ${item.id}`}</strong>
        <div>
          <button type="button" onClick={() => saveAdminRecord(adminSection, item)}>
            Guardar
          </button>
          <button type="button" onClick={() => deleteAdminRecord(adminSection, item.id)}>
            Eliminar
          </button>
        </div>
      </div>
      {fields.map((field) => (
        <label key={field}>
          {adminFieldLabels[field] || field}
          <input
            value={item[field] || ""}
            onChange={(event) => updateAdminField(adminSection, item.id, field, event.target.value)}
          />
        </label>
      ))}
    </div>
  );

  const renderCourseSelector = (selectedCourse) => (
    <div className="admin-course-selector">
      <div className="admin-section-title">
        <strong>Cursos disponibles</strong>
        <span>{adminData.courses.length} cursos</span>
      </div>
      <div className="admin-course-options">
        {adminData.courses.map((course) => (
          <button
            className={String(course.id) === String(selectedCourse?.id) ? "active" : ""}
            key={`course-option-${course.id}`}
            type="button"
            onClick={() => setSelectedCourseId(String(course.id))}
          >
            <strong>{course.title || `Curso ${course.id}`}</strong>
            <span>{course.type || course.page || `ID ${course.id}`}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderUserProfile = () => {
    const profile = currentUser?.profile || {};
    const currentLevel = profile.currentLevel || { title: "Aprendiz", badge: "LVL 1", minXp: 0 };
    const nextLevel = profile.nextLevel;
    const completedCount = profile.completedPythonLevelsCount || 0;
    const totalLevels = profile.totalPythonLevels || 0;
    const levelProgress = Math.min(Math.max(profile.levelProgress ?? 0, 0), 100);

    return (
      <div className="auth-session profile-panel">
        <div className="profile-heading">
          <div className="profile-avatar">{currentUser.name?.charAt(0)?.toUpperCase() || "U"}</div>
          <div className="profile-info">
            <p className="auth-title">{currentUser.name}</p>
            <p className="profile-role">Estudiante CodexLing</p>
            <p className="auth-email">{currentUser.email}</p>
          </div>
        </div>

        <div className="profile-summary">
          <div className="profile-level-chip">{currentLevel.badge || "Nivel actual"}</div>
          <div className="profile-level-details">
            <strong>{currentLevel.title}</strong>
            <p>{profile.experience || 0} XP acumulada</p>
          </div>
        </div>

        <div className="profile-progress-card">
          <div className="profile-progress-header">
            <span>Progreso actual</span>
            <strong>{levelProgress}%</strong>
          </div>
          <div className="profile-progress">
            <span style={{ width: `${levelProgress}%` }} />
          </div>
          <small>
            {nextLevel
              ? `${profile.xpToNextLevel} XP para ${nextLevel.title}`
              : "Nivel máximo alcanzado"}
          </small>
        </div>

        <div className="profile-stats">
          <div className="profile-stat-card">
            <strong>{completedCount}</strong>
            <span>Apartados completados</span>
          </div>
          <div className="profile-stat-card">
            <strong>{totalLevels}</strong>
            <span>Apartados disponibles</span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="profile-button"
            type="button"
            onClick={() => {
              setPage("home");
              setAuthOpen(false);
            }}
          >
            Ver mis cursos
          </button>
          <button className="auth-submit profile-logout" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        {authMessage && <p className="auth-message">{authMessage}</p>}
      </div>
    );
  };

  const renderAdminPanel = () => {
    if (!adminAuthed) {
      return (
        <form className="auth-form" onSubmit={handleAdminLogin}>
          <label>
            Clave de administrador
            <input
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              required
            />
          </label>
          <button className="auth-submit" type="submit" disabled={authLoading}>
            {authLoading ? "Validando..." : "Entrar como admin"}
          </button>
          {authMessage && <p className="auth-message">{authMessage}</p>}
        </form>
      );
    }

    if (adminSection === "userLevels") {
      return renderUserLevelManager();
    }

    const isCoursesSection = adminSection === "courses";
    const selectedCourse =
      adminData.courses.find((course) => String(course.id) === String(selectedCourseId)) ||
      adminData.courses[0];
    const collection = isCoursesSection ? (selectedCourse ? [selectedCourse] : []) : adminData.users;
    const fields = isCoursesSection ? ["title", "icon", "description", "page", "type"] : ["name", "email"];

    return (
      <div className="admin-panel">
        {renderAdminActions()}

        {isCoursesSection && collection.length > 0 ? (
          <div className="admin-course-workspace">
            {renderCourseSelector(selectedCourse)}
            <div className="admin-course-editor">
              {collection.map((item) => renderAdminRecord(item, fields))}
              {isPythonCourse(selectedCourse) && renderPythonLessonManager()}
            </div>
          </div>
        ) : (
          <div className="admin-list">
            {collection.map((item) => renderAdminRecord(item, fields))}
            {collection.length === 0 && <p className="auth-message">No hay registros guardados.</p>}
          </div>
        )}
        {authMessage && <p className="auth-message">{authMessage}</p>}
      </div>
    );
  };

  return (
    <header>
      <div className="logo" onClick={() => setPage("home")}>
        <div className="logo-icon">
          <img src={logo} alt="CodexLing Logo" style={{ width: "80px" }} />
        </div>
        <div
          className="logo-text"
          style={{
            fontFamily: "VT323, monospace",
            fontSize: "50px"
          }}
        >
          CODEXLING
        </div>
      </div>

      <div className="nav-icons">
        <div className={`search-container ${showSearch ? "active" : ""}`}>
          {showSearch && (
            <input
              className="search-header"
              type="search"
              placeholder="Buscar curso"
              value={search}
              onChange={handleSearchChange}
              autoFocus
            />
          )}
          <button className="nav-icon" type="button" onClick={toggleSearch} aria-label="Buscar cursos">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="auth-container">
          <button
            className={`nav-icon ${authOpen ? "active" : ""}`}
            type="button"
            onClick={() => setAuthOpen(!authOpen)}
            aria-label="Cuenta de usuario"
          >
            <i className="fas fa-user"></i>
          </button>

          {authOpen && (
            <div className={`auth-panel ${authMode === "admin" ? "admin-open" : ""}`}>
              <div className="auth-tabs three-tabs">
                <button
                  className={authMode === "login" ? "active" : ""}
                  type="button"
                  onClick={() => handleAuthMode("login")}
                >
                  Iniciar
                </button>
                <button
                  className={authMode === "register" ? "active" : ""}
                  type="button"
                  onClick={() => handleAuthMode("register")}
                >
                  Registro
                </button>
                <button
                  className={authMode === "admin" ? "active" : ""}
                  type="button"
                  onClick={() => handleAuthMode("admin")}
                >
                  Admin
                </button>
              </div>

              {authMode === "admin" ? (
                renderAdminPanel()
              ) : currentUser ? (
                renderUserProfile()
              ) : (
                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === "register" && (
                    <label>
                      Nombre
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        minLength="2"
                        required
                      />
                    </label>
                  )}

                  <label>
                    Correo
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </label>

                  <label>
                    Contrasena
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      minLength={authMode === "register" ? "6" : "1"}
                      required
                    />
                  </label>

                  <button className="auth-submit" type="submit" disabled={authLoading}>
                    {authLoading ? "Procesando..." : authMode === "register" ? "Crear cuenta" : "Entrar"}
                  </button>

                  {authMessage && <p className="auth-message">{authMessage}</p>}
                </form>
              )}
            </div>
          )}
        </div>

        <button className="nav-icon" type="button" onClick={toggleMenu} aria-label="Abrir menu">
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </header>
  );
}

export default Header;
