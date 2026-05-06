import { ApiError } from "../utils/ApiError.js";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCredentials(body) {
  return {
    name: typeof body.name === "string" ? body.name.trim() : body.name,
    email: typeof body.email === "string" ? body.email.trim() : body.email,
    password: typeof body.password === "string" ? body.password : body.password
  };
}

export function validateRegister(req, _res, next) {
  const user = normalizeCredentials(req.body);
  const errors = [];

  if (typeof user.name !== "string" || user.name.length < 2) {
    errors.push("name debe tener minimo 2 caracteres.");
  }

  if (typeof user.email !== "string" || !validateEmail(user.email)) {
    errors.push("email debe tener un formato valido.");
  }

  if (typeof user.password !== "string" || user.password.length < 6) {
    errors.push("password debe tener minimo 6 caracteres.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para registrar el usuario.", errors));
    return;
  }

  req.body = user;
  next();
}

export function validateLogin(req, _res, next) {
  const credentials = normalizeCredentials(req.body);
  const errors = [];

  if (typeof credentials.email !== "string" || !validateEmail(credentials.email)) {
    errors.push("email debe tener un formato valido.");
  }

  if (typeof credentials.password !== "string" || credentials.password.length === 0) {
    errors.push("password es obligatorio.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para iniciar sesion.", errors));
    return;
  }

  req.body = {
    email: credentials.email,
    password: credentials.password
  };
  next();
}

export function validatePartialUser(req, _res, next) {
  const user = normalizeCredentials(req.body);
  const cleanUser = {};
  const errors = [];

  if (user.name !== undefined) {
    if (typeof user.name !== "string" || user.name.length < 2) {
      errors.push("name debe tener minimo 2 caracteres.");
    } else {
      cleanUser.name = user.name;
    }
  }

  if (user.email !== undefined) {
    if (typeof user.email !== "string" || !validateEmail(user.email)) {
      errors.push("email debe tener un formato valido.");
    } else {
      cleanUser.email = user.email;
    }
  }

  if (user.password !== undefined) {
    if (typeof user.password !== "string" || user.password.length < 6) {
      errors.push("password debe tener minimo 6 caracteres.");
    } else {
      cleanUser.password = user.password;
    }
  }

  if (Object.keys(cleanUser).length === 0) {
    errors.push("Debes enviar al menos un campo valido para actualizar.");
  }

  if (errors.length > 0) {
    next(new ApiError(400, "Datos invalidos para actualizar el usuario.", errors));
    return;
  }

  req.body = cleanUser;
  next();
}
