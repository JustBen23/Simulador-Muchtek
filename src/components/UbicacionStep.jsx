// Conservamos el string del SVG original para garantizar que la interfaz no sufra cambios visuales
const ICONOS = ["/media/icons/Pared.svg","/media/icons/Piso.svg","/media/icons/Puerta.svg","/media/icons/Techo.svg","/media/icons/Ventana.svg","/media/icons/Zocalo.svg"];

const DEFAULT_SVG = "M4 4v16h16V4H4zm2 2h12v12H6V6z";

export default function UbicacionStep({
  selectedPlace,
  onSelect,
  places = [],
}) {
  const handleSelect = (label) => {
    if (typeof onSelect === "function") {
      onSelect(label);
    }
  };

  const uiPlaces = places.map((p) => {
    const label = typeof p === "string" ? p : p.name || p.label || "";
    const svg = typeof m === "string" ? p : p.svg || "";
    return {
      label,
      svg,
    };
  });

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-150/80 transition-all duration-300 hover:shadow-md"
      data-aos="fade-up"
      data-aos-delay="600"
    >
      <div className="flex items-center justify-between border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-brand-50 text-brand-600 text-xs font-bold rounded-full flex items-center justify-center">
            2
          </span>
          <h2 className="text-base w-max font-semibold text-slate-800">
            ¿Dónde quieres aplicarlo?
          </h2>
        </div>
        {selectedPlace != undefined && (
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
            {selectedPlace}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Selecciona la superficie que deseas transformar:
      </p>

      <div className="grid grid-cols-3 gap-3">
        {uiPlaces.map((m, index) => {
          const active = selectedPlace === m.label;
          return (
            <button
              key={m.label}
              type="button"
              onClick={() => handleSelect(m.label)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl text-center group transition-all duration-300 ${
                active
                  ? "border-2 border-brand-500 bg-brand-50/20"
                  : "border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${active ? "text-brand-600" : "text-slate-500"}`}
              >
                <img src={ICONOS[index]} alt="" className="w-[32px] h-[32px]" />
                {/* <svg
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
                </svg> */}
              </div>
              <span
                className={`text-xs ${active ? "font-semibold text-slate-800" : "font-medium text-slate-600 group-hover:text-slate-800"}`}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
