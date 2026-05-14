export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export function subscribeToRealtime(types, onUpdate) {
  if (typeof EventSource === "undefined") {
    return () => {};
  }

  const acceptedTypes = new Set(types);
  const events = new EventSource(`${API_URL}/events`);

  events.onmessage = (event) => {
    try {
      const update = JSON.parse(event.data);

      if (acceptedTypes.has(update.type)) {
        onUpdate(update);
      }
    } catch (error) {
      console.error("No se pudo procesar la actualizacion en tiempo real:", error);
    }
  };

  events.onerror = () => {
    console.warn("La conexion en tiempo real se interrumpio; el navegador intentara reconectar.");
  };

  return () => events.close();
}
