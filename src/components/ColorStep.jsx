export default function ColorStep({ selectedColors, onToggle, colors = [] }) {
  const count = selectedColors.length
  const complete = count === 4

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-150/80 transition-all duration-300 hover:shadow-md" >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-brand-50 text-brand-600 text-xs font-bold rounded-full flex items-center justify-center">4</span>
          <h2 className="text-base font-semibold text-slate-800">Gama de colores</h2>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${complete ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
          Seleccionados: {count}/4
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Elige exactamente 4 acabados de alta resistencia para habilitar tu simulación interactiva.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {colors.length === 0 ? (
          <div className="col-span-2 sm:col-span-3 text-center py-8 text-sm text-slate-400 font-medium bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
            Seleccione el producto para ver los colores disponibles
          </div>
        ) : (
          colors.map((color) => {
            const selected = selectedColors.includes(color.id)
            const label = color.name || color.label || 'Sin nombre';
            const hasTexture = !!color.textureImageUrl;
            
            // CORRECCIÓN: La API de Mûchtek envía el color en la propiedad `hex_value`
            const hexColor = color.hexValue || color.hex || '#cccccc';

            // Generamos el estilo dinámico priorizando la textura. 
            // Si es sólido, usa backgroundColor con el HEX.
            const bgStyle = hasTexture 
              ? { 
                  backgroundImage: `url(${color.textureImageUrl})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                } 
              : { 
                  backgroundColor: hexColor 
                };

            return (
              <button
                key={color.id}
                type="button"
                onClick={() => onToggle(color.id)}
                className={`relative flex flex-col p-2.5 bg-white border rounded-xl text-left transition-all duration-200 select-none cursor-pointer ${
                  selected ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div
                  className="border border-slate-200 w-full h-14 rounded-lg mb-2 flex items-end p-1.5 justify-between relative overflow-hidden"
                  style={bgStyle}
                >
                  {(!hasTexture && color.isWood) && (
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:4px_4px]"></div>
                  )}
                  <div className={`w-4 h-4 rounded-full bg-white flex items-center justify-center text-brand-600 shadow-sm transition-transform ${selected ? 'scale-100' : 'scale-0'}`}>
                    <i className="fa-solid fa-check text-[10px]"></i>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-700 truncate block w-full">{label}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}