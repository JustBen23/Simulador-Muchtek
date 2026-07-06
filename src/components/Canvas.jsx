import { useEffect, useRef, useState } from "react";

// Agregamos originalSrc a las props
export default function Canvas({
  canvasState,
  loadingStep,
  originalSrc,
  renderSrc,
  model,
  activeHex,
  sliderPos,
  setSliderPos,
  PreviewOpen,
}) {
  const containerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [originalImage, setOriginalImage] = useState();

  // 1. Estado para rastrear si la nueva imagen está descargándose
  const [isSwitchingColor, setIsSwitchingColor] = useState(false);

  // 2. Encender el modo carga CADA VEZ que detecte una nueva URL en renderSrc
  useEffect(() => {
    // Solo lo encendemos si el canvas ya está en modo "ready" y hay una imagen
    if (canvasState === "ready" && renderSrc) {
      setIsSwitchingColor(true);
    }
  }, [renderSrc, canvasState]);

  useEffect(() => {
    if (!dragging) return;
    const move = (clientX) => {
      const rect = containerRef.current.getBoundingClientRect();
      let p = (clientX - rect.left) / rect.width;
      p = Math.max(0, Math.min(1, p));
      setSliderPos(p * 100);
    };
    const onMouseMove = (e) => move(e.clientX);
    const onTouchMove = (e) => {
      if (e.touches[0]) move(e.touches[0].clientX);
    };
    const stop = () => setDragging(false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stop);
    };
  }, [dragging, setSliderPos]);

  useEffect(() => {
    if (canvasState === "ready") {
      setOriginalImage(originalSrc);
    }
  }, [canvasState]);

  const iconHeight = () => {
    if (window.innerWidth < 1024) {
      return "top-[0%]";
    } else {
      return "";
    }
  };

  const canvasHeight = () => {
    if (window.innerWidth < 1024) {
      return "aspect-[1/1]";
    } else {
      return "aspect-[4/3]";
    }
  };

  const innerWidth = sliderPos > 0 ? `${10000 / sliderPos}%` : "0%";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl bg-slate-900 ${canvasHeight()} group shadow-inner`}
    >
      {/* ESTADO 1: vacío */}
      {canvasState === "empty" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#e07613_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-6 text-brand-500 animate-bounce">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h4 className="text-slate-200 font-bold text-lg mb-2">
            Esperando tu configuración
          </h4>
          <p className="text-slate-400 text-sm max-w-sm font-light">
            Completa tus datos, selecciona un tipo de producto y sube una foto
            de tu fachada actual para renderizar la simulación.
          </p>
        </div>
      )}

      {/* ESTADO 2: cargando */}
      {canvasState === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-950/95 z-20">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 round border-4 border-slate-800"></div>
            <div className="absolute inset-0 round border-4 border-t-brand-500 animate-spin"></div>
            <div
              className={`absolute inset-0 flex ${iconHeight()} items-center justify-center`}
            >
              <i className="fa-solid fa-cube text-slate-600 text-2xl animate-pulse"></i>
            </div>
          </div>
          <h4 className="text-white font-bold text-xl mb-1">
            Renderizando fachada <p>No salgas de esta pantalla</p>
          </h4>
          <p className="text-brand-500 text-sm font-semibold mb-6 animate-pulse">
            {loadingStep.text}
          </p>
          <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${loadingStep.percent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* ESTADO 3: resultado con slider antes/después */}
      {canvasState === "ready" && (
        <div
          className={`absolute inset-0 select-none bg-[url(${originalImage})]`}
        >
          <div className="relative w-full h-full select-none">
            {/* Capa ANTES (Usamos la imagen original subida por el usuario) */}
            <div className="absolute inset-0 w-full h-full flex justify-center backdrop-blur-md backdrop-brightness-50">
              <img
                src={originalImage}
                className="h-full object-cover"
                alt="Fachada antes"
                draggable="false"
              />
              <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full z-1 border border-white/10">
                Antes
              </span>
            </div>

            {/* Capa DESPUÉS (Usamos el resultado de la API) */}
            <div
              className={`absolute inset-0 h-full overflow-hidden bg-[url(${renderSrc})]`}
              style={{ width: `${sliderPos}%` }}
            >
              {/* 3. EL VELO DE CARGA FLOTANTE */}
              {isSwitchingColor && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-slate-900/20 backdrop-blur-[2px] transition-all duration-300">
                  <div className="bg-white/90 p-4 rounded-2xl shadow-lg flex flex-col items-center gap-2">
                    <i className="fa-solid fa-circle-notch animate-spin text-brand-500 text-2xl"></i>
                    <span className="text-xs font-semibold text-slate-700">
                      Aplicando color...
                    </span>
                  </div>
                </div>
              )}
              <div
                className="absolute inset-0 h-full flex justify-center backdrop-blur-md backdrop-brightness-50"
                style={{ width: innerWidth }}
              >
                <img
                  src={renderSrc}
                  className="h-full object-cover filter brightness-[1.02] z-50"
                  alt="Fachada simulada"
                  onLoad={() => setIsSwitchingColor(false)}
                  draggable="false"
                />
              </div>

              <span className="absolute top-4 left-4 w-max bg-brand-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full z-10 shadow-md">
                Después (Mûchtek)
              </span>
            </div>

            <button
              onClick={PreviewOpen}
              className="absolute bottom-4 right-4 w-max text-white text-[10px] uppercase tracking-wider font-extrabold px-1 py-1 rounded-full z-100 bg-[#f8fafc] shadow-md hover:bg-[#cfdfdf] transition-all cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width="32"
                height="32"
              >
                <g
                  stroke="#1A1A1A"
                  stroke-width="2.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  fill="none"
                >
                  <line x1="18.5" y1="13.5" x2="24.5" y2="7.5" />
                  <path d="M 20 7.5 L 24.5 7.5 L 24.5 12" />

                  <line x1="13.5" y1="18.5" x2="7.5" y2="24.5" />
                  <path d="M 12 24.5 L 7.5 24.5 L 7.5 20" />
                </g>
              </svg>
            </button>

            {/* Controlador del slider */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
              onMouseDown={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onTouchStart={() => setDragging(true)}
            >
              <div className="w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center shadow-xl border-2 border-brand-500 cursor-ew-resize active:scale-110 transition-transform">
                <i className="fa-solid fa-arrows-left-right text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ESTADO 4: timeOut */}
      {canvasState === "timeOut" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#e07613_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-6 text-brand-500 animate-bounce">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M12 6v6l4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h4 className="text-slate-200 font-bold text-lg mb-2">
            Tiempo de visualización agotado
          </h4>
          <p className="text-slate-400 text-sm max-w-sm font-light">
            Las simulaciones generadas están disponibles por un máximo de 10
            minutos. Vuelve a configurar los parámetros y generar el renderizado
            para continuar visualizando el proyecto.
          </p>
        </div>
      )}
    </div>
  );
}
