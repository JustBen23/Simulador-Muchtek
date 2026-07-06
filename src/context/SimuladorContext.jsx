import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import { MUCHTEK_COLORS, DEFAULT_FACADE } from "../data/colors";

const SimuladorContext = createContext(null);

// Hook de acceso al estado global del simulador
export const useSimulador = () => {
  const ctx = useContext(SimuladorContext);
  if (!ctx)
    throw new Error("useSimulador debe usarse dentro de <SimuladorProvider>");
  return ctx;
};

let toastSeq = 0;

export function SimuladorProvider({ children }) {
  const [contact, setContact] = useState({ name: "", phone: "", email: "" });
  const [selectedModel, setSelectedModel] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState();
  const [selectedColors, setSelectedColors] = useState([]);
  const [submittedColors, setSubmittedColors] = useState([]);
  const [activeColor, setActiveColor] = useState();
  const [uploaded, setUploaded] = useState(null); // { src, name, size }
  const [canvasState, setCanvasState] = useState("empty"); // empty | loading | ready | timeOut
  const [loadingStep, setLoadingStep] = useState({ percent: 0, text: "" });
  const [sliderPos, setSliderPos] = useState(50);
  const [renderSrc, setRenderSrc] = useState(DEFAULT_FACADE);
  const [shareOpen, setShareOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [apiResults, setApiResults] = useState([]);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", timer = 3500) => {
    const id = ++toastSeq;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timer);
  }, []);

  // --- Reinicia al momento de cambiar los productos ---
  useEffect(() => {
    setSelectedModel([]);
    setSelectedColors([]);
  }, [selectedPlace]);

  // --- Reinicia al momento de cambiar el modelo ---
  useEffect(() => {
    setSelectedColors([]);
  }, [selectedModel]);

  // --- Colores ---
  const toggleColor = (id) => {
    setSelectedColors((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          showToast("Debes seleccionar al menos un color.", "warning");
          return prev;
        }
        return prev.filter((c) => c !== id);
      }
      const base = prev.length >= 4 ? prev.slice(1) : prev;
      return [...base, id];
    });
  };

  // --- Modelo ---
  const selectModel = (m) => {
    setSelectedModel(m);
  };

  const selectPlace = (m) => {
    setSelectedPlace(m);
  };

  // ==========================================
  // PROTECCIÓN CONTRA RECARGAS ACCIDENTALES
  // ==========================================
  useEffect(() => {
    // Función que el navegador llama antes de cerrar/recargar la pestaña
    const handleBeforeUnload = (e) => {
      // Solo lanzamos la alerta si está cargando
      if (canvasState === "loading") {
        e.preventDefault();
        // Esta línea es obligatoria en los navegadores modernos para que salga la alerta
        e.returnValue = "";
        return ""; // Soporte para navegadores antiguos
      }
    };

    // Si el estado es loading, "encendemos" el detector
    if (canvasState === "loading") {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    // Cleanup: Cuando termina de cargar (o si desmonta), apagamos el detector
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [canvasState]);

  // --- Archivo ---
  const handleFile = (file) => {
    if (!file) return;

    // Opcional: Formateo del peso para que se vea bien en el FacadeStep (ej. "1.5 MB")
    const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    // Creamos la URL temporal para si la necesitas de previsualización
    const objectUrl = URL.createObjectURL(file);

    setUploaded({
      file: file,
      name: file.name,
      size: formattedSize,
      src: objectUrl,
    });
  };

  // Y asegúrate de que tu resetFile libere la memoria correctamente
  const resetFile = () => {
    if (uploaded && uploaded.src) {
      URL.revokeObjectURL(uploaded.src);
    }
    setUploaded(null);
  };

  // --- Simulación ---
  // =========================================================
  // NUEVAS FUNCIONES DE ESTADO PARA LA API
  // =========================================================

  // 1. Inicia la animación del canvas cuando se hace click en Generar
  const startLoadingCanvas = () => {
    setSubmittedColors(selectedColors);
    setCanvasState("loading");
    setSliderPos(50);
    setLoadingStep({ percent: 30, text: "Subiendo imagen y procesando IA..." });
  };

  const clearForm = () => {
    setContact({ name: "", phone: "", email: "" });
    setSelectedModel([]);
    setSelectedPlace();
    setSelectedColors([]);
    setActiveColor("");
    setUploaded(null); // { src, name, size }
    setCanvasState("empty"); // empty | loading | ready

    if (window.innerWidth < 1024) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      const formContainer = document.getElementById("form-scroll-container");
      if (formContainer) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  };

  // 2. Opcional: Actualizar el texto del canvas durante el polling
  const updateLoadingProgress = (percent, text) => {
    setLoadingStep({ percent, text });
  };

  // 3. Se ejecuta cuando la API devuelve estado "COMPLETED"
  const handleSimulationSuccess = (results) => {
    if (!results || results.length === 0) {
      setCanvasState("empty");
      showToast("No se recibieron imágenes del servidor.", "error");
      return;
    }

    setApiResults(results); // Guardamos las 4 imágenes en el contexto

    // Tomamos la primera imagen por defecto
    const firstResult = results[0];
    const renderUrl =
      typeof firstResult === "string"
        ? firstResult
        : firstResult.url ||
          firstResult.resultImageUrl ||
          firstResult.resultUrl ||
          firstResult.image ||
          firstResult.image_url;

    if (renderUrl) {
      setRenderSrc(renderUrl);

      // Asignamos el primer color que eligió el usuario como el activo inicialmente
      if (selectedColors && selectedColors.length > 0) {
        setActiveColor(selectedColors[0]);
      }

      setCanvasState("ready");
      showToast("¡Simulación Mûchtek generada con éxito!", "success");
    } else {
      setCanvasState("empty");
      showToast("La imagen generada no tiene un formato válido.", "error");
    }
  };

  // Se ejecuta constantemente durante el polling cada vez que hay resultados
  const handleSimulationProgress = (results) => {
    if (!results || results.length === 0) return;

    setApiResults(results);
    setCanvasState((prevState) => {
      if (prevState === "loading") {
        const firstResult = results[0];

        setRenderSrc(firstResult.resultImageUrl);
        setActiveColor(firstResult.colorId);

        showToast("¡Primera imagen lista! Generando el resto...", "success");
        return "ready"; // Liberamos el Canvas
      }
      return prevState;
    });
  };

  // 4. Se ejecuta si falla la API
  const handleSimulationError = () => {
    setCanvasState("empty");
    showToast("Hubo un error al generar la fachada.", "error");
  };

  const changeSimulatedColor = (id) => {
    setActiveColor(id);
    const match = apiResults.find((r) => r.colorId === id);

    if (match && match.resultImageUrl) {
      setRenderSrc(match.resultImageUrl);
    }
  };

  // --- Resultado ---
  const downloadSimulation = async () => {
    if (!renderSrc) {
      showToast("No hay ninguna imagen para descargar aún.", "error");
      return;
    }

    try {
      const response = await fetch(renderSrc);

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;

      a.download = `muchtek-simulacion-${activeColor || "fachada"}.jpg`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      showToast(
        "Preparando renderizado final para descarga...",
        "info",
      );
    } catch (error) {
      console.error("Error al descargar la imagen:", error);

      showToast("Abriendo la imagen en una nueva pestaña...", "info");
      window.open(renderSrc, "_blank");
    }
  };

  const activeHex =
    (MUCHTEK_COLORS.find((c) => c.id === activeColor) || {}).hex || "#000000";

  const value = {
    apiResults,
    contact,
    setContact,
    selectedModel,
    selectModel,
    selectedPlace,
    selectPlace,
    selectedColors,
    toggleColor,
    activeColor,
    changeSimulatedColor,
    uploaded,
    handleFile,
    resetFile,
    canvasState,
    loadingStep,
    sliderPos,
    setSliderPos,
    renderSrc,
    shareOpen,
    setShareOpen,
    previewOpen,
    setPreviewOpen,
    toasts,
    showToast,
    downloadSimulation,
    activeHex,
    startLoadingCanvas,
    updateLoadingProgress,
    handleSimulationSuccess,
    handleSimulationError,
    handleSimulationProgress,
    submittedColors,
    clearForm,
  };

  useEffect(() => {
    let timeoutId;

    // Solo activamos el temporizador si el canvas está en modo "ready"
    if (canvasState === "ready") {
      // 10 minutos = 10 * 60 segundos * 1000 milisegundos = 600000
      timeoutId = setTimeout(() => {
        // Devolvemos el canvas a su estado original
        setCanvasState("timeOut");

        // Le avisamos al usuario por qué desapareció su imagen
        showToast(
          "La sesión de la simulación ha expirado por inactividad.",
          "info",
          8000,
        );
      }, 600000);
    }

    // Cleanup: Si el estado cambia a 'empty' o 'loading' antes de los 10 min,
    // o si el componente se desmonta, destruimos el temporizador para que no se ejecute en el fondo.
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [canvasState]);

  return (
    <SimuladorContext.Provider value={value}>
      {children}
    </SimuladorContext.Provider>
  );
}
