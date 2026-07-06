const DEFAULT_SVG = "M4 4v16h16V4H4zm2 2h12v12H6V6z";

export default function ModelStep({ selectedModel, onSelect, models = [] }) {
  const MODELS = models.map((m) => {
    const name = typeof m === "string" ? m : m.name || m.label || "";
    const svg = typeof m === "string" ? m : m.svg || "";
    return {
      name,
      label: name,
      svg,
    };
  });

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-150/80 transition-all duration-300 hover:shadow-md"
      data-aos="fade-up"
      data-aos-delay="900"
    >
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-brand-50 text-brand-600 text-xs font-bold rounded-full flex items-center justify-center">
            3
          </span>
          <h2 className="text-base font-semibold text-slate-800">
            Selección de producto
          </h2>
        </div>
        {selectedModel.length == 0 ? (
          ""
        ) : (
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
            {selectedModel}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Selecciona el producto que deseas visualizar:
      </p>

      <div className="grid grid-cols-3 gap-3">
        {/* CONTROL DE ESTADO VACÍO: Si no hay modelos cargados, muestra el mensaje */}
        {MODELS.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-sm text-slate-400 font-medium bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
            Seleccione la ubicación a instalar para ver los modelos disponibles
          </div>
        ) : (
          /* Mapeo original intacto */
          MODELS.map((m) => {
            const active = selectedModel === m.name;
            return (
              <button
                key={m.name}
                type="button"
                onClick={() => onSelect(m.name)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl text-center group transition-all duration-300 ${
                  active
                    ? "border-2 border-brand-500 bg-brand-50/20"
                    : "border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${active ? "text-brand-600" : "text-slate-500"}`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d={m.svg || DEFAULT_SVG}
                    />
                  </svg>
                </div>
                <span
                  className={`text-xs ${active ? "font-semibold text-slate-800" : "font-medium text-slate-600 group-hover:text-slate-800"}`}
                >
                  {m.label}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
