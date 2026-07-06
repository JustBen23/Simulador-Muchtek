export default function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between gap-10 items-center">
        <div className="flex items-center gap-3">
          <div className="flex flex-row gap-3">
            <img
              src="/media/Logo_Muchtek_negro.png"
              alt=""
              className="brand-logo"
            />
            <p className="text-2xl">|</p>
            <img
              src="/media/Logo_in_and_out.png"
              alt=""
              className="brand-logo"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
