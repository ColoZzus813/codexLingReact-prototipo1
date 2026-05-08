import axios from "axios";
import {
  createPythonLesson,
  findAllPythonLessons,
  updatePythonLesson,
  deletePythonLesson,
  createPythonLevel,
  updatePythonLevel,
  deletePythonLevel
} from "../models/pythonLessonModel.js";

export async function getPythonLessons(_req, res, next) {
  try {
    const lessons = await findAllPythonLessons();
    res.json({ data: lessons });
  } catch (error) {
    next(error);
  }
}

export async function postPythonLesson(req, res, next) {
  try {
    const lesson = await createPythonLesson(req.body);
    res.status(201).json({
      message: "Leccion creada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function putPythonLesson(req, res, next) {
  try {
    const lesson = await updatePythonLesson(req.params.id, req.body);
    if (!lesson) {
      return res.status(404).json({ error: { message: "Leccion no encontrada." } });
    }
    res.json({
      message: "Leccion actualizada correctamente.",
      data: lesson
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePythonLesson(req, res, next) {
  try {
    const deleted = await deletePythonLesson(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: { message: "Leccion no encontrada." } });
    }
    res.json({ message: "Leccion eliminada correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function postPythonLevel(req, res, next) {
  try {
    const level = await createPythonLevel(req.params.lessonId, req.body);
    if (!level) {
      return res.status(404).json({ error: { message: "Leccion no encontrada." } });
    }
    res.status(201).json({
      message: "Nivel creado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function putPythonLevel(req, res, next) {
  try {
    const level = await updatePythonLevel(req.params.lessonId, req.params.levelId, req.body);
    if (!level) {
      return res.status(404).json({ error: { message: "Nivel no encontrado." } });
    }
    res.json({
      message: "Nivel actualizado correctamente.",
      data: level
    });
  } catch (error) {
    next(error);
  }
}

export async function deletePythonLevel(req, res, next) {
  try {
    const deleted = await deletePythonLevel(req.params.lessonId, req.params.levelId);
    if (!deleted) {
      return res.status(404).json({ error: { message: "Nivel no encontrado." } });
    }
    res.json({ message: "Nivel eliminado correctamente." });
  } catch (error) {
    next(error);
  }
}

export async function executeCode(req, res, next) {
  try {
    const { source_code, language_id, stdin } = req.body;

    if (!source_code || !language_id) {
      return res.status(400).json({
        error: { message: "Se requiere source_code y language_id." }
      });
    }

    // Enviar código a Judge0
    const submissionResponse = await axios.post("https://judge0-ce.p.rapidapi.com/submissions", {
      source_code,
      language_id: parseInt(language_id),
      stdin: stdin || "",
      expected_output: null,
      cpu_time_limit: 2,
      cpu_extra_time: 0.5,
      wall_time_limit: 5,
      memory_limit: 128000,
      stack_limit: 64000,
      max_file_size: 1024
    }, {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.JUDGE0_API_KEY || "your-judge0-api-key",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
      }
    });

    const token = submissionResponse.data.token;

    // Esperar resultado
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
        headers: {
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY || "your-judge0-api-key",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        }
      });

      if (statusResponse.data.status.id > 2) { // No está en cola o procesando
        result = statusResponse.data;
        break;
      }

      attempts++;
    }

    if (!result) {
      return res.status(408).json({
        error: { message: "Tiempo de espera agotado para la ejecución del código." }
      });
    }

    res.json({
      data: {
        stdout: result.stdout || "",
        stderr: result.stderr || "",
        compile_output: result.compile_output || "",
        time: result.time,
        memory: result.memory,
        status: result.status,
        token
      }
    });
  } catch (error) {
    console.error("Error ejecutando código:", error);
    next(error);
  }
}
