# Mûchtek · Simulador In&Out Design (React)

Simulador interactivo de aberturas y recubrimientos de PVC Mûchtek[cite: 18]. Permite al usuario cargar una foto de su fachada, elegir ubicación, modelo de abertura y un máximo de 4 acabados para ver una comparación **Antes / Después** con un deslizador impulsado por Inteligencia Artificial[cite: 18].

## Stack Principal

- **React 18.3.1** + **Vite**[cite: 18]
- **Gestor de paquetes:** pnpm
- **Estilos:** Tailwind CSS (vía CDN, configurado en `index.html`)[cite: 18]
- **Iconografía y Tipografía:** FontAwesome + fuente Inter (CDN)[cite: 18]
- **Librerías Core:** `motion` (Framer Motion), `aos`, `react-zoom-pan-pinch`, `heic2any`.

## Requisitos

- Node.js (entorno ESM soportado)[cite: 18]
- pnpm (recomendado como gestor principal)

## Puesta en marcha

El proyecto usa **pnpm** para la gestión de dependencias[cite: 18].

```bash
pnpm install     # instala dependencias (genera node_modules/)
pnpm dev         # servidor de desarrollo local -> http://localhost:5173
pnpm build       # compila a producción -> carpeta dist/
pnpm preview     # sirve la build de producción para probarla localmente
```

## Estructura

```
muchtek-react/
├─ dist/                   # Build compilado listo para producción
├─ public/                 # Assets estáticos servidos en la raíz del host
│  └─ media/               # Logos de la marca (Logo_in_and_out.png, etc.) y tab_icon.png
├─ src/
│  ├─ assets/              # Recursos multimedia internos del código
│  ├─ components/          # Componentes modulares de la interfaz
│  │  ├─ Canvas.jsx        # Lienzo interactivo y comparador IA (slider)
│  │  ├─ ColorStep.jsx     # Paso 3: Selección estricta de 4 acabados
│  │  ├─ ContactStep.jsx   # Paso 1: Formulario opcional de datos
│  │  ├─ FacadeStep.jsx    # Paso 4: Carga, drag & drop y conv. HEIC
│  │  ├─ Header.jsx        # Encabezado principal de la app
│  │  ├─ ModelStep.jsx     # Paso 2: Selección del modelo de abertura
│  │  ├─ PreviewModal.jsx  # Modal de pantalla completa con zoom interactivo
│  │  ├─ ResultsFooter.jsx # Pie de página con selector de resultados y caché
│  │  ├─ ShareModal.jsx    # Modal legal y de privacidad
│  │  ├─ Toasts.jsx        # Sistema de notificaciones asíncronas
│  │  └─ UbicacionStep.jsx # Selección del plano arquitectónico
│  ├─ context/
│  │  └─ SimuladorContext.jsx  # Centralización del estado, hook global y peticiones
│  ├─ data/                # Catálogos estáticos e información en duro
│  ├─ styles/              # Hojas de estilo adicionales
│  ├─ App.jsx              # Layout principal
│  ├─ App.css              # Estilos propios del contenedor App
│  ├─ index.css            # Reseteo CSS genérico
│  └─ main.jsx             # Punto de entrada de React
├─ .htaccess               # Reglas de enrutamiento Apache para SPA
├─ eslint.config.js        # Reglas de linting
├─ index.html              # HTML raíz (Tailwind, fuentes, FontAwesome)
├─ package.json            # Scripts y dependencias generales
├─ pnpm-lock.yaml          # Árbol de dependencias bloqueadas para pnpm
├─ pnpm-workspace.yaml     # Configuración del espacio de trabajo
└─ vite.config.js          # Configuración del bundler y proxy de desarrollo
```

> El proyecto usa **pnpm** (`pnpm install`, `pnpm run dev`). También funciona con
> npm o yarn si se prefiere.