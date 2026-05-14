const JUDGE0_URL = "http://localhost:2358";

function clean(value) {
  return value ? String(value).trim() : "";
}

/**
 * Valida codigo usando la API local de Judge0.
 * @param {string} source_code Codigo fuente del estudiante.
 * @param {number} language_id ID del lenguaje, por ejemplo 71 para Python 3.
 * @param {string} expected_output Salida esperada.
 * @returns {Promise<Object>} Resultado normalizado para el frontend.
 */
export async function validateCode(source_code, language_id, expected_output) {
  try {
    const submitResponse = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source_code,
        language_id,
        stdin: "",
        enable_per_process_and_thread_time_limit: true,
        enable_per_process_and_thread_memory_limit: true
      })
    });

    if (!submitResponse.ok) {
      throw new Error(`Error al enviar codigo: ${submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json();
    const token = submitData.token;

    if (!token) {
      throw new Error("No se recibio token de Judge0");
    }

    let result;

    while (true) {
      const statusResponse = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false`);

      if (!statusResponse.ok) {
        throw new Error(`Error al consultar estado: ${statusResponse.statusText}`);
      }

      result = await statusResponse.json();

      if (result.status.id !== 1 && result.status.id !== 2) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const stdout = clean(result.stdout);
    const stderr = clean(result.stderr);
    const compileOutput = clean(result.compile_output);
    const expected = clean(expected_output);
    const status = result.status?.description || "RUNTIME_ERROR";

    if (result.status.id === 3 && stdout === expected) {
      return {
        success: true,
        status,
        message: "Leccion completada exitosamente",
        stdout,
        stderr,
        compileOutput,
        expectedOutput: expected,
        actualOutput: stdout
      };
    }

    if (result.status.id === 3) {
      return {
        success: false,
        status,
        message: `Salida incorrecta. Esperado: "${expected}", Obtenido: "${stdout}"`,
        stdout,
        stderr,
        compileOutput,
        expectedOutput: expected,
        actualOutput: stdout
      };
    }

    return {
      success: false,
      status,
      message: stderr || compileOutput || result.message || status || "Error desconocido",
      stdout,
      stderr,
      compileOutput,
      expectedOutput: expected,
      actualOutput: stdout
    };
  } catch (error) {
    console.error("Error en validateCode:", error);
    return {
      success: false,
      status: "CONNECTION_ERROR",
      message: `Error de conexion: ${error.message}`,
      stdout: "",
      stderr: "",
      compileOutput: "",
      expectedOutput: clean(expected_output),
      actualOutput: ""
    };
  }
}
