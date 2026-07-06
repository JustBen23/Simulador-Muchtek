import { useState, useEffect, useRef } from "react";
import { useSimulador } from "./context/SimuladorContext";
import Header from "./components/Header";
import ContactStep from "./components/ContactStep";
import ModelStep from "./components/ModelStep";
import ColorStep from "./components/ColorStep";
import FacadeStep from "./components/FacadeStep";
import Canvas from "./components/Canvas";
import ResultsFooter from "./components/ResultsFooter";
import ShareModal from "./components/ShareModal";
import Toasts from "./components/Toasts";
import UbicacionStep from "./components/UbicacionStep";
import AOS from "aos";
import "aos/dist/aos.css";
import "./App.css";
import PreviewModal from "./components/PreviewModal";

export default function App() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    // Forzamos la animación de todos los elementos después de que AOS inicialice
    setTimeout(() => {
      const aosElements = document.querySelectorAll("[data-aos]");
      aosElements.forEach((el) => {
        el.classList.add("aos-animate");
      });
    }, 100);
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);
  const {
    apiResults,
    contact,
    setContact,
    selectedModel,
    selectModel,
    selectPlace,
    selectedPlace,
    selectedColors,
    toggleColor,
    activeColor,
    changeSimulatedColor,
    uploaded,
    handleFile,
    resetFile,
    canvasState,
    loadingStep,
    sliderPos,
    setSliderPos,
    renderSrc,
    shareOpen,
    setShareOpen,
    previewOpen,
    setPreviewOpen,
    toasts,
    showToast,
    downloadSimulation,
    copyShareLink,
    activeHex,
    startLoadingCanvas,
    updateLoadingProgress,
    handleSimulationSuccess,
    handleSimulationError,
    handleSimulationProgress,
    submittedColors,
    clearForm,
  } = useSimulador();

  // ==========================================
  // ESTADOS PARA MANEJO DE API
  // ==========================================
  const [visitorData, setVisitorData] = useState(null);
  const [productClasses, setProductClasses] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [currentSimulationId, setCurrentSimulationId] = useState(null);
  const [simulationResults, setSimulationResults] = useState([]);
  const [userError, setUserError] = useState("");
  const btnInfoRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ v: "top", h: "center" });

  const pollingRef = useRef(null);

  const calculateTooltipPosition = () => {
    if (!btnInfoRef.current) return;
    const rect = btnInfoRef.current.getBoundingClientRect();
    const vw = window.innerWidth;

    // 1. ¿Hay espacio arriba?
    const isTop = rect.top > 250;

    // 2. Calculamos el centro exacto del botón
    const btnCenter = rect.left + rect.width / 2;

    // 3. Calculamos cuánto empujar el globo (Shift)
    // El globo mide máximo 280px. Su mitad es 140px. Le sumamos 10px de margen de seguridad = 150px.
    let shift = 0;
    if (btnCenter < 150) {
      shift = 150 - btnCenter; // Empuja hacia la derecha si choca con la pared izquierda
    } else if (vw - btnCenter < 150) {
      shift = -(150 - (vw - btnCenter)); // Empuja hacia la izquierda si choca con la pared derecha
    }

    setTooltipPos({ v: isTop ? "top" : "bottom", shiftX: shift });
  };

  // ==========================================
  // EFECTOS DE INICIALIZACIÓN
  // ==========================================
  useEffect(() => {
    initVisitor();
    fetchProductClasses();
    fetchProducts();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ==========================================
  // FUNCIONES DE API (FETCH & POST)
  // ==========================================

  const initVisitor = async () => {
    try {
      const timestamp = new Date().getTime();

      const response = await fetch(`/api/public/me?t=${timestamp}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setVisitorData(data);
      }
    } catch (error) {
      console.error("Error inicializando visitante:", error);
    }
  };

  const fetchProductClasses = async () => {
    try {
      const response = await fetch("/api/public/product-classes", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setProductClasses(data);
      }
    } catch (error) {
      console.error("Error obteniendo clases de productos:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/public/products", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setProductsCatalog(data);
      }
    } catch (error) {
      console.error("Error obteniendo catálogo de productos:", error);
    }
  };

  // 3. Crear simulación anónima (multipart/form-data)
  const startSimulationAPI = async (
    imageFile,
    productId,
    colorIds,
    clientInfo = {},
  ) => {
    if (visitorData && visitorData.generations_remaining <= 0) {
      showToast(
        "Has alcanzado el límite de generaciones disponibles.",
        "error",
      );
      handleSimulationError();
      return;
    }

    if (window.innerWidth < 1024) {
      const area_container = document.getElementById("generation_area");
      if (area_container) {
        area_container.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    try {
      startLoadingCanvas();

      const formData = new FormData();

      // Extracción estricta del binario (como lo configuramos previamente)
      const fileBinary = imageFile.file || imageFile.originFileObj || imageFile;
      formData.append("image", fileBinary, fileBinary.name || "fachada.jpg");

      formData.append("productId", productId);
      colorIds.forEach((id) => formData.append("colorIds", id));

      if (clientInfo.name) formData.append("clientName", clientInfo.name);
      if (clientInfo.phone) formData.append("clientPhone", clientInfo.phone);
      if (clientInfo.email) formData.append("clientEmail", clientInfo.email);
      if (clientInfo.acceptedTerms !== undefined) {
        formData.append(
          "clientAcceptedTerms",
          String(clientInfo.acceptedTerms),
        );
      }

      const response = await fetch("/api/public/simulations", {
        method: "POST",
        credentials: "include",
        body: formData,
        // Recordatorio: NO setear Content-Type aquí para que el navegador genere el boundary
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSimulationId(data.id);
        startPolling(data.id);
      } else {
        const errorData = await response.json();
        console.error("Error al enviar la simulación:", errorData);
        showToast("Ha ocurrido un error al generar la imagen", "error");
      }
    } catch (error) {
      console.error("Fallo crítico enviando simulación:", error);
    }
  };

  // 4. Polling del estado de la simulación
  const startPolling = (simulationId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/public/simulations/${simulationId}`,
          { method: "GET", credentials: "include" },
        );

        if (response.ok) {
          const data = await response.json();

          // 1. RENDERIZADO PROGRESIVO:
          if (data.results && data.results.length > 0) {
            handleSimulationProgress(data.results);
          } else {
            updateLoadingProgress(70, "Procesando texturas y mapeo 3D...");
          }

          // 2. CONTROL DEL INTERVALO:
          if (data.status === "COMPLETED") {
            clearInterval(pollingRef.current);
            initVisitor();
          } else if (data.status === "FAILED") {
            clearInterval(pollingRef.current);
            console.error("La generación falló en el servidor.");
            handleSimulationError();
          }
        }
      } catch (error) {
        console.error("Error en polling:", error);
        clearInterval(pollingRef.current);
        handleSimulationError();
      }
    }, 15000); // Polling cada 15 segundos
  };

  // ==========================================
  // LÓGICA INTERMEDIA Y FILTROS
  // ==========================================

  const handleTriggerSimulation = (facadeData) => {
    if (!uploaded) {
      return showToast("Por favor sube una imagen de la fachada.", "error");
    }
    if (selectedPlace === undefined) {
      return showToast(
        "Por favor selecciona un el lugar que deseas simular.",
        "error",
      );
    }
    if (selectedModel.length == 0) {
      return showToast("Por favor selecciona un producto.", "error");
    }
    if (selectedColors.length !== 4) {
      return showToast("Debes seleccionar exactamente 4 colores.", "error");
    }

    const product = productsCatalog.find(
      (p) => p.name === selectedModel || p.id === selectedModel,
    );
    if (!product) {
      return showToast("Producto inválido.", "error");
    }

    const clientInfo = {
      ...contact,
      acceptedTerms: facadeData.acceptedTerms,
    };

    startSimulationAPI(uploaded, product.id, selectedColors, clientInfo);
  };

  // Filtramos el catálogo por la ubicación seleccionada (Techo, Ventana, etc.)
  const filteredProducts = productsCatalog.filter((product) => {
    if (!selectedPlace) return false;
    const className = product.productClass?.name || product.category;
    return className?.toLowerCase() === selectedPlace.toLowerCase();
  });

  // Obtenemos los colores del producto actualmente seleccionado
  const selectedProductData = productsCatalog.find(
    (p) => p.name === selectedModel || p.id === selectedModel,
  );
  const availableColors = selectedProductData
    ? selectedProductData.colors || []
    : [];

  // ==========================================
  // RENDERIZADO
  // ==========================================
  return (
    <div className="app-shell">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* IZQUIERDA: formulario */}
          <section
            id="form-scroll-container"
            className="lg:col-span-5 space-y-6 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto pr-0 lg:pr-4 custom-scrollbar"
          >
            <div className="space-y-3" data-aos="fade-up">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Simulador Antes/Después
              </h1>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                Diseña tu espacio
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Simula la integración de las soluciones arquitectónicas de
                In&Out: revestimientos, wall panels, tubulares, decks y zócalos
                junto con las aberturas de PVC de{" "}
                <strong className="font-semibold text-brand-500">
                  Mûchtek
                </strong>{" "}
                que combinan diseño, resistencia y fácil mantenimiento para
                proyectos de interior y exterior.
              </p>
            </div>

            <ContactStep contact={contact} setContact={setContact} />

            <UbicacionStep
              selectedPlace={selectedPlace}
              onSelect={selectPlace}
              places={productClasses}
            />

            <ModelStep
              selectedModel={selectedModel}
              onSelect={selectModel}
              models={filteredProducts}
            />

            <ColorStep
              selectedColors={selectedColors}
              onToggle={toggleColor}
              colors={availableColors}
            />

            <FacadeStep
              uploaded={uploaded}
              onFile={handleFile}
              onReset={resetFile}
              onGenerate={handleTriggerSimulation}
              clearForm={clearForm}
              intentos={visitorData?.generations_remaining}
              showToast={showToast}
              onShare={() => setShareOpen(true)}
              selectedModel={selectedModel}
            />
            <button
              className="text-xs text-slate-400 w-full leading-relaxed -mt-2"
              onClick={clearForm}
            >
              Limpiar formulario
            </button>
          </section>

          {/* DERECHA: lienzo */}
          <section
            className={`lg:col-span-7 lg:sticky lg:top-28 ${window.innerWidth < 1024 ? "min-h-[90vh]" : ""}`}
            id="generation_area"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-3">
              <div className="space-y-1 flex w-full justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Lienzo de visualización
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-brand-500"></span>
                    Renderizado en alta fidelidad Mûchtek
                  </p>
                </div>
                <button
                  ref={btnInfoRef}
                  onMouseEnter={calculateTooltipPosition}
                  onClick={calculateTooltipPosition}
                  className="relative group flex items-center gap-2 rounded-full text-xs font-semibold justify-center transition-colors"
                >
                  <i className="fa-solid fa-circle-info text-[16px]"></i>
                  <div
                    className={`absolute w-[280px] max-w-[calc(100vw-32px)]  p-3 bg-slate-900 text-white text-[10px] leading-relaxed font-normal rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl pointer-events-none text-center ${tooltipPos.v === "top" ? "bottom-[calc(100%+8px)]" : "top-[calc(100%+8px)]"} onTop`}
                    style={{
                      left: "50%",
                      // Magia: Se centra por defecto, y le suma el empuje necesario (si lo hay)
                      transform: `translateX(calc(-50% + ${tooltipPos.shiftX}px))`,
                    }}
                  >
                    La imagen ha sido creada mediante Inteligencia Artificial
                    Generativa, la cual puede producir artefactos no fieles a la
                    realidad. Esto es solo una demostración de la aplicación de
                    nuestros productos.
                    <div
                      className={`absolute border-[6px] border-transparent ${tooltipPos.v === "top" ? "top-full border-t-slate-900" : "bottom-full border-b-slate-900"}`}
                      style={{
                        left: "50%",
                        // Magia inversa: Si el globo se movió a la derecha, el triángulo se mueve a la izquierda para seguir apuntando al botón
                        transform: `translateX(calc(-50% - ${tooltipPos.shiftX}px))`,
                      }}
                    ></div>
                  </div>
                </button>
              </div>

              <Canvas
                canvasState={canvasState}
                loadingStep={loadingStep}
                originalSrc={uploaded?.src}
                renderSrc={renderSrc}
                model={selectedModel}
                activeHex={activeHex}
                sliderPos={sliderPos}
                setSliderPos={setSliderPos}
                PreviewOpen={() => setPreviewOpen(true)}
              />

              {canvasState === "ready" && (
                <ResultsFooter
                  selectedColors={submittedColors}
                  activeColor={activeColor}
                  onChangeColor={changeSimulatedColor}
                  onDownload={downloadSimulation}
                  simulationResults={simulationResults}
                  colors={availableColors}
                  apiResults={apiResults}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />

      <PreviewModal
        open={previewOpen}
        onDownload={downloadSimulation}
        onClose={() => setPreviewOpen(false)}
        image={renderSrc}
      />
      <Toasts toasts={toasts} />
    </div>
  );
}
