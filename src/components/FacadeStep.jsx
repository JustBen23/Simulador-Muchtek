import { useEffect, useState } from "react";
import { motion } from "motion/react";
import heic2any from "heic2any";

const TIPS_FOTOGRAFIA = {
  ventanas: {
    title: "Tips para la foto de Ventanas",
    icon: "fa-border-all",
    items: [
      "Foto de frente a la fachada",
      "Marcos visibles y completos",
      "Luz natural, sin contraluz",
      "Sin objetos bloqueando la vista",
    ],
  },
  puertas: {
    title: "Tips para la foto de Puertas",
    icon: "fa-door-closed",
    items: [
      "Puerta centrada y de frente",
      "Marco completo visible",
      "Un poco de pared alrededor",
      "Sin sombras fuertes",
    ],
  },
  piso: {
    title: "Tips para la foto de Pisos",
    icon: "fa-layer-group",
    items: [
      "Cámara a la cintura, ángulo hacia abajo",
      "La mayor superficie de piso posible",
      "Pocos muebles tapando",
      "Iluminación pareja",
    ],
  },
  pared: {
    title: "Tips para la foto de Paredes",
    icon: "fa-brick",
    items: [
      "Pared visible en su mayor extensión",
      "Sin muebles ni plantas tapando",
      "Incluir esquinas para dar contexto 3D",
      "Foto de frente o en ángulo suave",
    ],
  },
  techo: {
    title: "Tips para la foto de Techos",
    icon: "fa-arrow-up",
    items: [
      "Techo claramente visible",
      "Pérgolas: foto desde abajo",
      "Cielorrasos: desde el centro",
      "Buena iluminación general",
    ],
  },
  zocalo: {
    title: "Tips para la foto de Zócalos",
    icon: "fa-ruler-horizontal",
    items: [
      "Unión pared-piso claramente visible",
      "Sin muebles tapando el rodapié",
      "Ángulo ligeramente lateral",
      "Mayor longitud posible visible",
    ],
  },
  general: {
    title: "Consejos clave de fotografía",
    icon: "fa-camera",
    items: [
      "Usá luz natural (evitá el flash)",
      "Foto de frente o en ángulo suave",
      "Acercate (evitá el zoom digital)",
      "Procurá que la foto sea nítida",
    ],
  },
};

export default function FacadeStep({
  uploaded,
  onFile,
  onReset,
  onGenerate,
  clearForm,
  intentos,
  showToast,
  onShare,
  selectedModel,
}) {
  const [terms, setTerms] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    setTerms(false);
  }, [selectedModel]);

  // NUEVO: Estado para saber si estamos convirtiendo/cargando la imagen
  const [isProcessing, setIsProcessing] = useState(false);

  const getCategoriaTips = (modelo) => {
    // Si no hay modelo o el array está vacío, devolvemos general
    if (!modelo || (Array.isArray(modelo) && modelo.length === 0)) {
      return "general";
    }

    // Si es un array, unimos sus elementos en un solo texto. Si ya es texto, lo forzamos a String por seguridad.
    const mod = Array.isArray(modelo)
      ? modelo.join(" ").toLowerCase()
      : String(modelo).toLowerCase();

    if (
      mod.includes("guillotina") ||
      mod.includes("corrediza") ||
      mod.includes("ventana")
    )
      return "ventanas";
    if (mod.includes("puerta")) return "puertas";
    if (mod.includes("piso") || mod.includes("deck")) return "piso";
    if (mod.includes("revestimiento") || mod.includes("pared")) return "pared";
    if (mod.includes("techo") || mod.includes("pergola")) return "techo";
    if (mod.includes("zocalo") || mod.includes("rodapie")) return "zocalo";

    return "general";
  };
  const categoria = getCategoriaTips(selectedModel);
  const activeTips = TIPS_FOTOGRAFIA[categoria] || TIPS_FOTOGRAFIA["general"];

  const handleColor = () => {
    if (intentos === 3) {
      return "green";
    } else if (intentos === 2) {
      return "yellow";
    } else if (intentos === 1) {
      return "red";
    } else if (intentos === 0) {
      return "gray";
    }
  };

  const processUploadedFile = async (file) => {
    if (!file || file.size === 0) return;

    // --- NUEVO: VALIDACIÓN DE TIPO DE ARCHIVO ---
    const isImage =
      file.type.startsWith("image/") ||
      file.name.toLowerCase().endsWith(".heic");

    if (!isImage) {
      if (typeof showToast === "function") {
        showToast("El archivo cargado no es una imagen válida.", "error");
      }
      return; // Detiene el proceso y no guarda el archivo
    }
    // --------------------------------------------

    // 1. Encendemos la animación de carga
    setIsProcessing(true);

    try {
      const isHeic =
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic");

      if (isHeic) {
        const arrayBuffer = await file.arrayBuffer();
        const cleanBlob = new Blob([arrayBuffer], {
          type: file.type || "image/heic",
        });

        const convertedBlob = await heic2any({
          blob: cleanBlob,
          toType: "image/jpeg",
          quality: 0.8,
        });

        const finalBlob = Array.isArray(convertedBlob)
          ? convertedBlob[0]
          : convertedBlob;
        const newFileName = file.name.replace(/\.heic$/i, ".jpg");
        const convertedFile = new File([finalBlob], newFileName, {
          type: "image/jpeg",
        });

        onFile(convertedFile);
      } else {
        onFile(file);
      }
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
    } finally {
      // 2. Apagamos la animación de carga sin importar qué pase
      setIsProcessing(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = () => {
    if (terms) {
      if (typeof onGenerate === "function") {
        onGenerate({ acceptedTerms: terms });
      }
    } else {
      showToast(
        "Por favor, lee y acepta nuestros Términos y Condiciones del Servicio antes de continuar.",
        "info",
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-150/80 transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
        <span className="w-7 h-7 bg-brand-50 text-brand-600 text-xs font-bold rounded-full flex items-center justify-center">
          5
        </span>
        <h2 className="text-base font-semibold text-slate-800">
          Fotografía de tu fachada
        </h2>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Carga tu foto: Asegúrate de que haya buena iluminación para mejores
        resultados.
      </p>
      <div className="space-y-5">
        {!uploaded && (
          <div
            className="relative group cursor-pointer"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              // Mantenemos el input deshabilitado si está procesando para que no suban 2 veces
              disabled={isProcessing}
              className={`absolute inset-0 w-full h-full z-10 ${isProcessing ? "cursor-not-allowed hidden" : "cursor-pointer opacity-0"}`}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processUploadedFile(e.target.files[0]);
                }
              }}
            />
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none py-8">
                <i className="fa-solid fa-circle-notch animate-spin text-brand-500 text-3xl"></i>
                <p className="text-sm text-slate-500 font-medium">
                  Procesando imagen...
                </p>
                <p className="text-[10px] text-slate-400">
                  Preparando formato ideal para la IA
                </p>
              </div>
            ) : (
              <div
                // Añadimos 'relative' y 'overflow-hidden' al contenedor principal
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
                  dragOver
                    ? "border-brand-400 bg-brand-50/10"
                    : "border-slate-200 bg-slate-50/40 group-hover:border-brand-400 group-hover:bg-brand-50/10"
                }`}
              >
                {/* 1. CONTENIDO NORMAL (Se vuelve transparente al arrastrar, pero mantiene la altura de la caja intacta) */}
                <div
                  className={`flex flex-col items-center pointer-events-none transition-opacity duration-300 ${
                    dragOver ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 flex items-center justify-center mb-4 transition-colors">
                    <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-700 transition-colors">
                    Sube una imagen
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Arrastra tu foto o haz clic para explorar
                  </span>
                  <span className="text-[10px] text-slate-300 uppercase mt-4">
                    JPG, PNG, WEBP, HEIC (Máx. 20MB)
                  </span>
                </div>

                {/* 2. MENSAJE DRAG & DROP (Aparece en el centro con posición absoluta) */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ${
                    dragOver
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90 pointer-events-none"
                  }`}
                >
                  <i className="fa-solid fa-file-arrow-down text-4xl text-brand-500 mb-2 animate-bounce"></i>
                  <span className="text-base font-bold text-brand-600">
                    Arrastra tu archivo aquí
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {uploaded && (
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                <i className="fa-regular fa-image text-lg"></i>
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-700 truncate max-w-[180px]">
                  {uploaded.name}
                </p>
                <p className="text-[10px] text-slate-400">{uploaded.size}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
            >
              <i className="fa-regular fa-circle-xmark text-lg"></i>
            </button>
          </div>
        )}

        {/* --- INICIO: TIPS DINÁMICOS --- */}
        {!uploaded &&
          activeTips && ( // <--- Agregamos '&& activeTips' aquí
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-50/50 border border-brand-100 rounded-xl p-4 flex flex-col gap-3 mt-1 shadow-sm"
            >
              <div className="flex items-center gap-2 text-brand-700 font-bold text-xs uppercase tracking-wide">
                <i className={`fa-solid ${activeTips.icon}`}></i>
                {activeTips.title}
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {/* Agregamos el '?' antes del .map por seguridad */}
                {activeTips.items?.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-slate-600 font-medium leading-tight"
                  >
                    <i className="fa-solid fa-circle-check text-brand-500 mt-[2px] text-[10px]"></i>
                    {tip}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        {/* --- FIN: TIPS DINÁMICOS --- */}

        <div className="flex items-start gap-3 pt-2">
          <div className="flex items-center h-5">
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500 focus:ring-2 transition-all"
            />
          </div>
          <label
            htmlFor="terms-checkbox"
            className="text-xs text-slate-500 leading-normal select-none"
          >
            Acepto los{" "}
            <button
              onClick={onShare}
              className="text-brand-600 hover:underline font-medium"
            >
              términos de privacidad
            </button>{" "}
            y autorizo el uso temporal de la imagen para la simulación.
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-sliders"></i>
          Generar simulación interactiva
        </button>

        <span className="text-xs text-slate-500 w-full font-medium bg-slate-100 py-1.5 px-3 rounded-full flex justify-center items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full bg-${handleColor()}-400`}
          ></span>
          <p>Generaciones disponibles: {intentos}</p>
        </span>
      </div>
    </div>
  );
}
