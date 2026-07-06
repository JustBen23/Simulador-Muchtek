const STYLES = {
  success: { cls: 'border-emerald-500', icon: 'fa-solid fa-circle-check text-emerald-500' },
  warning: { cls: 'border-amber-500', icon: 'fa-solid fa-triangle-exclamation text-amber-500' },
  error: { cls: 'border-rose-500', icon: 'fa-solid fa-circle-xmark text-rose-500' },
  info: { cls: 'border-brand-500', icon: 'fa-solid fa-circle-info text-brand-500' },
}

export default function Toasts({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => {
        const s = STYLES[t.type] || STYLES.success
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border border-slate-100 border-l-4 bg-white text-slate-800 min-w-[280px] max-w-sm transition-all duration-300 ${s.cls}`}
          >
            <i className={s.icon}></i>
            <span className="text-xs font-semibold">{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
