import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";


export default function ShareModal({ open, onClose }) {
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
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-2xl max-w-2xl w-7xl p-6 shadow-2xl border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-2xl font-bold text-slate-800">
                Términos de privacidad
              </h4>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="text-slate-500 max-h-80 text-xs mb-4 overflow-y-scroll custom-scrollbar">
              <div class="max-w-3xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-700 leading-relaxed">
                <div class="border-b border-gray-100 pb-4 mb-6">
                  <h2 class="text-xl font-bold text-gray-900 tracking-tight mb-1">
                    Simulador Visual Muchtek
                  </h2>
                  <p class="text-sm text-gray-500">
                    Términos de Privacidad y Condiciones de Uso
                  </p>
                </div>

                <p class="text-sm mb-6 text-gray-600 font-medium">
                  Al utilizar este simulador, usted acepta y da su
                  consentimiento a las siguientes condiciones sobre el
                  tratamiento de sus datos:
                </p>

                <div class="space-y-6 text-sm">
                  <div>
                    <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        1
                      </span>
                      ¿Qué información usamos?
                    </h3>
                    <p class="text-gray-600 pl-6">
                      Subes una foto de tu vivienda para generar la simulación.
                      Si deseas que un asesor te contacte, puedes dejarnos tu
                      nombre, teléfono y/o correo electrónico de forma
                      totalmente opcional. También guardamos datos técnicos de
                      tu visita (como tu dirección IP de forma anónima)
                      únicamente para limitar el uso gratuito del servicio y
                      prevenir abusos.
                    </p>
                  </div>

                  <div>
                    <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        2
                      </span>
                      ¿Para qué usamos tu foto?
                    </h3>
                    <p class="text-gray-600 pl-6">
                      La imagen que subes se procesa automáticamente con
                      inteligencia artificial para generar la simulación visual.
                      No la usamos con ningún otro fin ni la compartimos
                      públicamente.
                    </p>
                  </div>

                  <div>
                    <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        3
                      </span>
                      ¿Quién ve tus datos?
                    </h3>
                    <p class="text-gray-600 pl-6">
                      Tus datos son accesibles únicamente por el equipo de
                      Muchtek y su personal técnico web. No los vendemos,
                      cederemos ni compartiremos con terceros bajo ningún
                      concepto.
                    </p>
                  </div>

                  <div>
                    <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        4
                      </span>
                      ¿Por cuánto tiempo los guardamos?
                    </h3>
                    <p class="text-gray-600 pl-6">
                      Las imágenes y resultados de la simulación se conservan
                      por un tiempo limitado de hasta un máximo de{" "}
                      <span class="font-medium text-gray-900">
                        90 días calendario
                      </span>
                      . Los datos de contacto que dejes voluntariamente se usan
                      solo para que un asesor pueda comunicarse contigo.
                    </p>
                  </div>

                  <div>
                    <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        5
                      </span>
                      ¿Puedes pedir que borremos tus datos?
                    </h3>
                    <p class="text-gray-600 pl-6">
                      Sí. Si deseas que eliminemos tu información en cualquier
                      momento, puedes escribirnos a{" "}
                      <a
                        href="mailto:profiles@muchtek.com"
                        class="text-blue-600 hover:underline font-medium"
                      >
                        profiles@muchtek.com
                      </a>{" "}
                      indicando el dato de contacto que utilizaste.
                    </p>
                  </div>
                </div>

                <div class="mt-8 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                  <p class="text-xs text-gray-500 italic text-center">
                    *Al marcar la casilla de aceptación en el formulario,
                    confirmas haber leído y aceptado estos términos.*
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-xl text-xs transition-colors flex w-full items-center justify-center gap-1 shadow-sm"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
