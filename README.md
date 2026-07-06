# Mûchtek · Simulador In&Out Design (React)

Simulador interactivo de aberturas y recubrimientos de PVC Mûchtek. Permite al
usuario cargar una foto de su fachada, elegir modelo de abertura y acabados, y
ver una comparación **Antes / Después** con un deslizador.

## Stack
- **React 18** + **Vite 5**
- **Tailwind CSS** (vía CDN, configurado en `index.html`)
- **FontAwesome** + fuente **Inter** (CDN)

## Requisitos
- Node.js 18+ y npm

## Puesta en marcha
```bash
npm install      # instala dependencias (genera node_modules/)
npm run dev      # servidor de desarrollo -> http://localhost:5173
npm run build    # compila a producción -> carpeta dist/
npm run preview  # sirve la build de producción para probarla
```

## Estructura
```
muchtek-react/
├─ index.html              # HTML raíz: carga Tailwind, fuentes e iconos (CDN)
├─ package.json            # dependencias y scripts
├─ pnpm-lock.yaml          # versiones bloqueadas (pnpm)
├─ vite.config.js          # config de Vite (base: './', salida a fonts/ y media/)
├─ eslint.config.js        # reglas de ESLint (flat config)
├─ .htaccess               # reglas para hosting Apache (SPA + gzip + caché)
├─ public/                 # assets servidos tal cual
│  ├─ favicon.svg
│  └─ icons.svg
└─ src/
   ├─ main.jsx             # punto de entrada: monta React + SimuladorProvider
   ├─ App.jsx              # layout principal (consume el contexto)
   ├─ App.css              # estilos de la app
   ├─ index.css            # estilos base (scrollbar, smooth scroll)
   ├─ assets/
   │  └─ logo.svg          # logotipo Mûchtek
   ├─ context/
   │  └─ SimuladorContext.jsx  # estado global + lógica (hook useSimulador)
   ├─ styles/
   │  └─ animations.css    # animaciones reutilizables
   ├─ data/
   │  └─ colors.js         # catálogo de los 16 colores Mûchtek
   └─ components/
      ├─ Header.jsx
      ├─ ContactStep.jsx   # Paso 1: datos de contacto
      ├─ ModelStep.jsx     # Paso 2: modelo de abertura
      ├─ ColorStep.jsx     # Paso 3: gama de colores
      ├─ FacadeStep.jsx    # Paso 4: subida de foto + generar
      ├─ Canvas.jsx        # lienzo + slider Antes/Después
      ├─ ResultsFooter.jsx # miniaturas + descargar/compartir
      ├─ ShareModal.jsx    # modal de compartir
      └─ Toasts.jsx        # notificaciones
```

> El proyecto usa **pnpm** (`pnpm install`, `pnpm run dev`). También funciona con
> npm o yarn si se prefiere.

## Notas
- Las imágenes que sube el usuario se procesan **en el navegador** (FileReader);
  no se envían a ningún servidor.
- Los botones *Descargar* y *Compartir* son simulados (demo).
