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
  const [adminData, setAdminData] = useState({ courses: [], users: [], pythonLessons: [] });
  const [adminSection, setAdminSection] = useState("courses");
  const [newLesson, setNewLesson] = useState({ title: "", description: "", order: "" });
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
    setAdminData({ courses: [], users: [], pythonLessons: [] });
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
      setNewLesson({ title: "", description: "", order: "" });
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
        [lessonId]: { title: "", description: "", content: "", order: "" }
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

    if (adminSection === "pythonLessons") {
      return (
        <div className="admin-panel">
          <div className="admin-actions">
            <div className="admin-switch">
              <button type="button" onClick={() => setAdminSection("courses")}>
                Cursos
              </button>
              <button type="button" onClick={() => setAdminSection("users")}>
                Usuarios
              </button>
              <button className="active" type="button" onClick={() => setAdminSection("pythonLessons")}>
                Python
              </button>
            </div>
            <button className="admin-link" type="button" onClick={() => fetchAdminData()}>
              Actualizar
            </button>
            <button className="admin-link danger" type="button" onClick={handleAdminLogout}>
              Salir admin
            </button>
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
              order
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
                {["title", "description", "order"].map((field) => (
                  <label key={field}>
                    {field}
                    <input
                      type={field === "order" ? "number" : "text"}
                      min={field === "order" ? "1" : undefined}
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
                      {["title", "description", "content", "order"].map((field) => (
                        <label key={field}>
                          {field}
                          <input
                            type={field === "order" ? "number" : "text"}
                            min={field === "order" ? "1" : undefined}
                            value={level[field] || ""}
                            onChange={(event) =>
                              updateLevelField(lesson.id, level.id, field, event.target.value)
                            }
                          />
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
                    {["title", "description", "content", "order"].map((field) => (
                      <label key={field}>
                        {field}
                        <input
                          type={field === "order" ? "number" : "text"}
                          min={field === "order" ? "1" : undefined}
                          value={newLevelByLesson[lesson.id]?.[field] || ""}
                          onChange={(event) => handleNewLevelChange(lesson.id, field, event.target.value)}
                        />
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

          {authMessage && <p className="auth-message">{authMessage}</p>}
        </div>
      );
    }

    const collection = adminSection === "courses" ? adminData.courses : adminData.users;
    const fields =
      adminSection === "courses"
        ? ["title", "icon", "description", "page", "type"]
        : ["name", "email"];

    return (
      <div className="admin-panel">
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
              className={adminSection === "pythonLessons" ? "active" : ""}
              type="button"
              onClick={() => setAdminSection("pythonLessons")}
            >
              Python
            </button>
          </div>
          <button className="admin-link" type="button" onClick={() => fetchAdminData()}>
            Actualizar
          </button>
          <button className="admin-link danger" type="button" onClick={handleAdminLogout}>
            Salir admin
          </button>
        </div>

        <div className="admin-list">
          {collection.map((item) => (
            <div className="admin-record" key={`${adminSection}-${item.id}`}>
              <div className="admin-record-header">
                <strong>ID {item.id}</strong>
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
                  {field}
                  <input
                    value={item[field] || ""}
                    onChange={(event) =>
                      updateAdminField(adminSection, item.id, field, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>
          ))}
          {collection.length === 0 && <p className="auth-message">No hay registros guardados.</p>}
        </div>

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
                <div className="auth-session">
                  <p className="auth-title">Hola, {currentUser.name}</p>
                  <p className="auth-email">{currentUser.email}</p>
                  <button className="auth-submit" type="button" onClick={handleLogout}>
                    Cerrar sesion
                  </button>
                  {authMessage && <p className="auth-message">{authMessage}</p>}
                </div>
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
