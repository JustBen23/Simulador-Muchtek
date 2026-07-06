function Field({ label, icon, type = "text", value, placeholder, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
          <i className={`${icon} text-sm`}></i>
        </span>
        <input
          type={type}
          // Agregamos un fallback || '' para evitar warnings de React sobre inputs no controlados
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent focus:bg-white transition-all placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

export default function ContactStep({ contact = {}, setContact }) {
  // Mantenemos tu función de actualización, agregando una verificación para asegurar
  // que setContact existe antes de llamarla.
  const update = (key) => (val) => {
    if (typeof setContact === "function") {
      setContact((prevContact) => ({
        ...prevContact,
        [key]: val,
      }));
    }
  };

  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-150/80 transition-all duration-300 hover:shadow-md"
      data-aos="fade-up"
      data-aos-delay="300"
    >
      <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
        <span className="w-7 h-7 bg-brand-50 text-brand-600 text-xs font-bold rounded-full flex items-center justify-center">
          1
        </span>
        <h2 className="text-base font-semibold text-slate-800">
          Tus datos de contacto
        </h2>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Si lo deseas, puedes compartir tus datos de contacto; esta sección es totalmente opcional.
      </p>
      <div className="space-y-4">
        <Field
          label="Nombre Completo"
          icon="fa-regular fa-user"
          value={contact.name}
          placeholder="Ej. Juan Pérez"
          onChange={update("name")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Teléfono"
            icon="fa-solid fa-phone"
            type="tel"
            value={contact.phone}
            placeholder="+54 9 11 1234 5678"
            onChange={update("phone")}
          />
          <Field
            label="E-mail"
            icon="fa-regular fa-envelope"
            type="email"
            value={contact.email}
            placeholder="juan@ejemplo.com"
            onChange={update("email")}
          />
        </div>
      </div>
    </div>
  );
}
