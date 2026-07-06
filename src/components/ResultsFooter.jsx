import { useState, useEffect } from "react";

export default function ResultsFooter({
  selectedColors, // Recibe los IDs congelados (submittedColors)
  activeColor,
  onChangeColor,
  onDownload,
  colors = [], // El catálogo global que puede cambiar
  apiResults = [],
}) {
  // 1. Memoria interna: guardará los objetos de color (textura, hex, nombre) permanentemente
  const [colorCache, setColorCache] = useState({});

  // 2. Efecto para capturar y congelar los datos de los colores
  useEffect(() => {
    const newCache = { ...colorCache };
    let hasChanges = false;

    selectedColors.forEach((cid) => {
      // Si el color no está en nuestra caché, lo buscamos en el catálogo actual y lo guardamos
      if (!newCache[cid]) {
        const foundColor = colors.find((c) => c.id === cid);
        if (foundColor) {
          newCache[cid] = foundColor;
          hasChanges = true;
        }
      }
    });

    // Solo actualizamos el estado si encontramos y guardamos un color nuevo
    if (hasChanges) {
      setColorCache(newCache);
    }
  }, [selectedColors, colors]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400 leading-relaxed mb-2">
        Por tu seguridad, esta simulación estará disponible solo por 10 minutos.
        ¡Recuerda descargarla!
      </p>
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Visualizar otros tonos simulados rápidamente:
        </label>

        <div className="grid grid-cols-4 gap-2">
          {selectedColors.map((cid) => {
            // CAMBIO CLAVE: Buscamos en nuestra caché interna, ya no en el catálogo dinámico
            const originalColor = colorCache[cid] || {};

            const resultData = apiResults.find(
              (r) => r.colorId === cid || r.color_id === cid,
            );

            const isActive = activeColor === cid;

            const label =
              originalColor.name ||
              originalColor.label ||
              resultData?.colorName ||
              "Sin nombre";

            const hasTexture = !!originalColor.textureImageUrl;
            const hexColor =
              originalColor.hexValue || originalColor.hex || "#cccccc";

            const bgStyle = hasTexture
              ? {
                  backgroundImage: `url(${originalColor.textureImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  backgroundColor: hexColor,
                };

            // ESTADO 1: La imagen generada ya llegó, el botón es interactivo
            if (resultData) {
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => onChangeColor(cid)}
                  className={`flex flex-col items-center p-1.5 bg-slate-50 border rounded-lg hover:border-slate-300 transition-all duration-300 ${
                    isActive
                      ? "border-brand-500 ring-2 ring-brand-500/20 shadow-sm scale-105"
                      : "border-slate-200"
                  }`}
                >
                  <div
                    className="w-full h-6 rounded bg-slate-200"
                    style={bgStyle}
                  ></div>
                  <span className="text-[9px] font-semibold text-slate-700 mt-1 truncate w-full text-center">
                    {label}
                  </span>
                </button>
              );
            }

            // ESTADO 2: Cargando (mostramos el color base inactivo + un spinner)
            return (
              <div
                key={cid}
                className="flex flex-col items-center p-1.5 bg-slate-50 border border-slate-200 rounded-lg opacity-60 cursor-not-allowed transition-all duration-300"
              >
                <div
                  className="w-full h-6 rounded flex items-center justify-center relative overflow-hidden"
                  style={bgStyle}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <i className="fa-solid fa-circle-notch animate-spin text-white/90 text-[10px] relative z-10"></i>
                </div>
                <span className="text-[9px] font-semibold text-slate-400 mt-1 truncate w-full text-center">
                  Generando...
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onDownload}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <i className="fa-solid fa-download"></i> Descargar esta simulación
        </button>
      </div>
    </div>
  );
}
