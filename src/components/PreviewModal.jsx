import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function PreviewModal({ open, onClose, image, onDownload }) {
  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [open]);

  const modalHeight = () => {
    if (window.innerWidth < 1024) {
      return "flex flex-col ";
    } else {
      return "";
    }
  };

  const modalWidth = () => {
    if (window.innerWidth < 1024) {
      return "max-w-[90dvw] w-[90dvw]";
    } else {
      return "max-w-[80dvw] w-[70dvw]";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={`bg-white rounded-2xl ${modalWidth()} p-6 shadow-2xl border space-y-4 max-h-[95vh] ${modalHeight()} border-slate-100 overflow-hidden flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="text-2xl font-bold text-slate-800">
                Imagen generada
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* CONTENEDOR DEL VISOR INTERACTIVO */}
            <div className="relative w-full flex-1 min-h-0 overflow-hidden rounded-2xl bg-slate-50 cursor-grab active:cursor-grabbing">
              <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={3}
                centerOnInit={true}
                wheel={{ step: 0.1 }}
              >
                {({ zoomIn, resetTransform, state }) => (
                  <>
                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full flex items-center justify-center"
                    >
                      <img
                        src={image}
                        alt="Simulación completa"
                        className="max-w-full max-h-full object-contain rounded-2xl pointer-events-none"
                        draggable="false"
                      />
                    </TransformComponent>

                    {/* BOTÓN DESCARGAR */}
                    <div className="absolute top-3 left-3 bg-black/60 hover:bg-black/80 transition-colors text-white p-2 rounded-full flex cursor-pointer z-10">
                      <button onClick={onDownload} title="Descargar imagen">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* CONTROLES DE ZOOM */}
                    <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
                      
                      {/* Lupa Acercar (+) */}
                      <button
                        onClick={() => {
                          // Si está por debajo de 1.5, calcula la diferencia exacta y hace zoom.
                          // Si ya está en 1.5 o más, simplemente no hace nada.
                          if (state.scale < 1.5) {
                            zoomIn(1.5 - state.scale);
                          }
                        }}
                        title="Acercar imagen a un valor fijo"
                        className="p-2 rounded-full shadow-lg transition-all text-white bg-black/60 hover:bg-black/80 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </button>

                      {/* Lupa Restablecer (-) */}
                      <button
                        onClick={() => resetTransform()}
                        title="Restablecer tamaño original"
                        className="p-2 rounded-full shadow-lg transition-all text-white bg-black/60 hover:bg-black/80 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                          />
                        </svg>
                      </button>

                    </div>
                  </>
                )}
              </TransformWrapper>
            </div>

            <p className="text-slate-400 text-xs text-center max-w-full mx-auto font-light shrink-0">
              La imagen ha sido creada mediante Inteligencia Artificial
              Generativa, la cual puede producir artefactos no fieles a la
              realidad. Esto es solo una demostración de la aplicación de
              nuestros productos.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}