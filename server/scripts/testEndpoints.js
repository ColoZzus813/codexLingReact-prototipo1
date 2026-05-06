import { app } from "../app.js";
import { ensureDatabase, readDatabase, writeDatabase } from "../config/database.js";

await ensureDatabase();

const server = app.listen(0);
const port = server.address().port;
const baseUrl = `http://localhost:${port}/api`;

async function parseJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await parseJson(response);

  return {
    status: response.status,
    body
  };
}

let testEmail = "";

async function cleanupTestUser() {
  if (!testEmail) {
    return;
  }

  const database = await readDatabase();
  database.users = database.users.filter((user) => user.email !== testEmail);
  await writeDatabase(database);
}

try {
  const health = await request("/health");
  const courses = await request("/courses");
  const created = await request("/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "TEST",
      icon: "fab fa-test",
      description: "Curso temporal",
      page: "test",
      type: "test"
    })
  });
  const updated = await request(`/courses/${created.body.data.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      description: "Curso temporal actualizado"
    })
  });
  const deleted = await request(`/courses/${created.body.data.id}`, {
    method: "DELETE"
  });
  testEmail = `test-${Date.now()}@codexling.test`;
  const registered = await request("/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Usuario Test",
      email: testEmail,
      password: "123456"
    })
  });
  const loggedIn = await request("/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: "123456"
    })
  });
  const adminLogin = await request("/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey: "admin123" })
  });
  const database = await request("/admin/database", {
    headers: { "x-admin-key": "admin123" }
  });
  const pythonLessons = await request("/python/lessons");
  const adminUpdatedCourse = await request("/admin/courses/1", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": "admin123"
    },
    body: JSON.stringify({
      description: database.body.data.courses[0].description
    })
  });
  const createdLesson = await request("/admin/python-lessons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": "admin123"
    },
    body: JSON.stringify({
      title: "Leccion temporal",
      description: "Leccion creada por la prueba automatica",
      order: 99
    })
  });
  const createdLevel = await request(`/admin/python-lessons/${createdLesson.body.data.id}/levels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": "admin123"
    },
    body: JSON.stringify({
      title: "Nivel temporal",
      description: "Nivel creado por la prueba automatica",
      content: "Contenido temporal",
      order: 1
    })
  });
  const updatedLevel = await request(
    `/admin/python-lessons/${createdLesson.body.data.id}/levels/${createdLevel.body.data.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": "admin123"
      },
      body: JSON.stringify({
        content: "Contenido temporal actualizado"
      })
    }
  );
  const deletedLesson = await request(`/admin/python-lessons/${createdLesson.body.data.id}`, {
    method: "DELETE",
    headers: { "x-admin-key": "admin123" }
  });

  const result = {
    health: health.body.status,
    coursesBeforeTest: courses.body.data.length,
    get: courses.status,
    post: created.status,
    put: updated.status,
    delete: deleted.status,
    register: registered.status,
    login: loggedIn.status,
    adminLogin: adminLogin.status,
    adminDatabase: database.status,
    pythonLessons: pythonLessons.status,
    adminUpdateCourse: adminUpdatedCourse.status,
    adminCreatePythonLesson: createdLesson.status,
    adminCreatePythonLevel: createdLevel.status,
    adminUpdatePythonLevel: updatedLevel.status,
    adminDeletePythonLesson: deletedLesson.status
  };

  console.log(JSON.stringify(result, null, 2));

  if (
    result.health !== "ok" ||
    result.get !== 200 ||
    result.post !== 201 ||
    result.put !== 200 ||
    result.delete !== 204 ||
    result.register !== 201 ||
    result.login !== 200 ||
    result.adminLogin !== 200 ||
    result.adminDatabase !== 200 ||
    result.pythonLessons !== 200 ||
    result.adminUpdateCourse !== 200 ||
    result.adminCreatePythonLesson !== 201 ||
    result.adminCreatePythonLevel !== 201 ||
    result.adminUpdatePythonLevel !== 200 ||
    result.adminDeletePythonLesson !== 204
  ) {
    process.exitCode = 1;
  }
} finally {
  await cleanupTestUser();
  server.close();
}
