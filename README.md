# Mûchtek · Simulador In&Out Design (React)

Simulador interactivo de aberturas y recubrimientos de PVC Mûchtek[cite: 18]. Permite al usuario cargar una foto de su fachada, elegir ubicación, modelo de abertura y un máximo de 4 acabados para ver una comparación **Antes / Después** con un deslizador de contraste impulsado por Inteligencia Artificial[cite: 18].

## Stack Tecnológico
- **Core:** React 18.3.1 + Vite[cite: 18]
- **Gestor de Paquetes:** pnpm
- **Estilos:** Tailwind CSS (vía CDN en `index.html`)[cite: 18]
- **Iconografía y Tipografía:** FontAwesome + fuente Inter (CDN)[cite: 18]
- **Librerías Core:** `motion` (Framer Motion), `aos`, `react-zoom-pan-pinch`, `heic2any`.

## Requisitos del Sistema
- Node.js (entorno ESM soportado)[cite: 18]
- pnpm instalado globalmente (recomendado)

## Puesta en Marcha (Desarrollo Local)
```bash
pnpm install     # Instala dependencias y genera node_modules/
pnpm dev         # Inicia el servidor de desarrollo -> http://localhost:5173
pnpm build       # Compila y optimiza para producción -> carpeta dist/
pnpm preview     # Sirve la build local de producción para pruebas

```

---

# Documentación Técnica del Sistema

## 1. Arquitectura General y Configuración

* **Repositorio Principal:** La base de código centralizada del proyecto se encuentra alojada de forma pública en GitHub bajo la dirección: [https://github.com/[User]/Simulador-Muchtek](https://www.google.com/search?q=https://github.com/%5BUser%5D/Simulador-Muchtek).
* **Entorno y Control de Versiones:** La aplicación se encuentra completamente desplegada en el entorno de producción operando de forma exclusiva sobre la rama estable `main`.
* **Variables y Entorno:** La aplicación en producción opera consumiendo endpoints relativos a su dominio, descartando el uso e implementación de configuraciones basadas en archivos externos `.env.example`.

---

## 2. Gestión de Estado Global (`SimuladorContext.jsx`)

La lógica de negocio y la sincronización de la interfaz se gobiernan centralizadamente mediante la Context API de React a través del archivo `SimuladorContext.jsx`.

* **Mecanismo de Acceso (`useSimulador`):** Se expone el hook personalizado `useSimulador` para permitir a los componentes consumir el estado. Este cuenta con una cláusula de salvaguarda que arroja un error explícito si el hook es invocado por fuera del proveedor `<SimuladorProvider>`.
* **Estados de Formulario y Configuración:**
* `contact`: Almacena un objeto con los datos personales del usuario (`name`, `phone`, `email`).
* `selectedPlace`: Controla la ubicación o superficie arquitectónica seleccionada por el usuario.
* `selectedModel`: Almacena el modelo específico de producto seleccionado.
* `selectedColors`: Matriz dinámica de identificadores correspondientes a los acabados que el usuario añade en su configuración actual.
* `submittedColors`: Copia inmutable de los colores seleccionados que se bloquea y envía formalmente al inicializar el proceso con la IA.


* **Estados del Canvas y de la API:**
* `canvasState`: Controla el ciclo de vida de la renderización del lienzo admitiendo los estados lógicos `"empty"`, `"loading"`, `"ready"` y `"timeOut"`.
* `loadingStep`: Define un objeto con el porcentaje numérico (`percent`) y la descripción textual (`text`) que indican el avance asíncrono del backend.
* `renderSrc`: Puntero de origen de la imagen activa en pantalla, inicializado por defecto con la constante `DEFAULT_FACADE`.
* `apiResults`: Matriz que indexa y preserva la colección total de respuestas e imágenes devueltas por el servidor.
* `activeColor`: Almacena el identificador del acabado de color que se está inspeccionando activamente en el visor.


* **Control de Modales y Notificaciones:**
* `shareOpen` / `previewOpen`: Variables booleanas encargadas de conmutar la visibilidad de las ventanas emergentes de compartición y visualización extendida.
* `toasts`: Matriz que gestiona las alertas flotantes asíncronas de la app, provista de una función `showToast` que añade identificadores secuenciales únicos y remueve automáticamente la notificación tras expirar su temporizador.



---

## 3. Flujos de Trabajo y Reglas de Negocio

* **Sincronización de Pasos Cascading:** Un efecto secundario (`useEffect`) monitorea el cambio de ubicación (`selectedPlace`), ejecutando un reset automático sobre las variables de modelos y colores seleccionados para prevenir incongruencias en el flujo. De igual manera, alterar el modelo (`selectedModel`) limpia de forma automática la selección de acabados.
* **Restricción de Selección Cromática (`toggleColor`):** La lógica de selección implementa restricciones rígidas. Si el usuario intenta desmarcar un color cuando este representa el único elemento activo en su matriz, el sistema impide la acción y emite una advertencia obligando a mantener al menos un color seleccionado. Si se añade un color y el arreglo ya cuenta con 4 elementos, el sistema aplica una cola de tipo FIFO (First In, First Out) mediante la función `slice(1)` para descartar de forma automática el acabado más antiguo y dar espacio al nuevo ingreso.
* **Procesamiento de Archivos Multimedia (`handleFile` / `resetFile`):** Al cargar una imagen de fachada, `handleFile` intercepta el binario plano, calcula y formatea su peso final a una cadena legible en Megabytes (MB) y genera una URL de objeto en memoria local (`URL.createObjectURL`) para renderización inmediata en el frontend. Al descartar o reiniciar el archivo, la función `resetFile` ejecuta explícitamente `URL.revokeObjectURL` sobre el puntero de origen, destruyendo el enlace temporal de la memoria del navegador para evitar fugas de rendimiento (*memory leaks*).
* **Blanqueo de Formulario (`clearForm`):** Restablece todos los estados del simulador y del cliente a sus valores nulos o iniciales, evaluando de forma simultánea el ancho de la pantalla del dispositivo para realizar una transición de scroll suave (`window.scrollTo`) enfocada hacia la parte superior de la interfaz.

---

## 4. Integración y Polling de la API de Inteligencia Artificial

* **Inicialización del Procesamiento (`startLoadingCanvas`):** Al hacer clic en el disparador de generación, el sistema congela los acabados seleccionados dentro de `submittedColors`, conmuta el estado del lienzo a `"loading"`, centra la barra de comparación (`sliderPos`) al 50% y parametriza el progreso inicial de carga en un 30%.
* **Estrategia de Carga Progresiva (`handleSimulationProgress`):** Durante el proceso de sondeo (*polling*), el sistema captura las respuestas preliminares del servidor mediante `handleSimulationProgress` e inyecta los datos dentro de `apiResults`. Si el lienzo se encuentra bloqueado en estado `"loading"`, el método extrae el primer render disponible (`resultImageUrl`) junto con su `colorId` y libera la pantalla transicionando inmediatamente al estado `"ready"`, permitiendo al usuario interactuar con la primera imagen completada mientras el backend procesa las variantes restantes en segundo plano.
* **Resolución Exitosa del Proceso (`handleSimulationSuccess`):** Al recibir la confirmación absoluta del servidor, guarda los resultados completos en el contexto. La función inspecciona de forma polimórfica la estructura del primer elemento para extraer su URL válida evaluando múltiples propiedades posibles del backend (`url`, `resultImageUrl`, `resultUrl`, `image`, `image_url`). Una vez resuelta la imagen, la asigna a `renderSrc`, sincroniza el color activo con el primer acabado de la cola del usuario, establece el lienzo en `"ready"` y emite un mensaje de éxito.
* **Control de Errores en Red (`handleSimulationError`):** Si ocurre una falla crítica de comunicación o procesamiento en las peticiones de la API, el método degrada inmediatamente el estado del lienzo a `"empty"` y notifica el fallo a través de un Toast de alerta.
* **Conmutación en el Visor (`changeSimulatedColor`):** Permite cambiar el acabado renderizado instantáneamente en pantalla. Modifica `activeColor` con el identificador seleccionado y realiza una búsqueda indexada (`find`) dentro de la matriz `apiResults` para extraer la propiedad `resultImageUrl` asociada, actualizando reactivamente el lienzo.

---

## 5. Seguridad de Interfaz, Descargas y Control de Sesión

* **Medida Anti-recargas Accidentales:** Se implementa un escuchador (`useEffect`) asociado al evento nativo del navegador `beforeunload`. Si el usuario intenta refrescar la página, presionar F5 o cerrar la pestaña por error mientras el estado del lienzo es `"loading"`, el sistema intercepta la acción, ejecuta un `preventDefault()` y despliega un cuadro de diálogo de advertencia estándar para salvaguardar la llamada activa de la IA. El manejador es removido de manera segura en la función de limpieza (*cleanup*) del efecto una vez culminada la carga.
* **Bypass de Restricciones de Descarga (`downloadSimulation`):** Para sortear bloqueos de apertura o de políticas CORS al descargar imágenes remotas, el método realiza un `fetch` asíncronamente directo sobre el render activo (`renderSrc`) para transformarlo en un binario plano de tipo `Blob`. Posteriormente, genera una URL de objeto local, crea un elemento de anclaje `<a>` oculto en el DOM, define el atributo `download` bajo el patrón dinámico `muchtek-simulacion-[colorId].jpg`, simula su pulsación mecánica y destruye inmediatamente el elemento y su URL para liberar memoria. Cuenta con un mecanismo de resiliencia que abre la imagen en una pestaña limpia del navegador con `window.open` si se produce un fallo en la solicitud de red.
* **Expiración Automatizada de Sesión:** Con el fin de evitar el estancamiento de datos y optimizar el rendimiento, el contexto enciende un temporizador reactivo al momento en que el lienzo pasa a estado `"ready"`. Si transcurren exactamente **10 minutos de inactividad continuada (600,000 milisegundos)**, el sistema degrada de forma automática el lienzo al estado `"timeOut"`, bloquea la visualización del render y emite una alerta flotante informativa extendida a 8 segundos para explicar al usuario el cierre de su sesión. Cualquier mutación de estado previa limpia y destruye el temporizador mediante su *cleanup* correspondiente.

---

## 6. Despliegue y Mantenimiento de Producción

* **Generación de Artefactos de Distribución:** El despliegue de la aplicación se ejecuta compilando el código mediante el comando `pnpm build`, el cual genera los elementos optimizados listos para producción dentro del directorio local `/dist`.
* **Protocolo de Transferencia:** Los archivos resultantes de la compilación son cargados e inyectados en el servidor web remoto a través del protocolo **FTPS**.

---

## 7. Arquitectura de Interfaz y Estructura de Directorios

El frontend está estructurado bajo un patrón de diseño modular, separando responsabilidades entre el estado global, las vistas (pasos del simulador) y los componentes compartidos. La aplicación opera como una *Single Page Application* (SPA) gestionando su navegación e interfaces de forma declarativa.

### Estructura de Carpetas

```text
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

---

## 8. Inventario de Componentes y Flujo de Interacción

Todos los componentes de presentación consumen la lógica central mediante el hook personalizado `useSimulador`.

### A. Componentes de Flujo (Steps)

Estos componentes construyen el embudo de configuración del usuario, mutando de forma secuencial las variables de estado en el contexto.

* **`ContactStep.jsx` (Paso 1):** Captura los datos demográficos y de contacto. Despacha actualizaciones hacia el objeto `contact` en el estado global.
* **`UbicacionStep.jsx`:** Renderiza las opciones de superficies arquitectónicas. Modifica la variable `selectedPlace`, lo cual dispara un efecto en cascada que limpia selecciones posteriores para evitar inconsistencias.
* **`ModelStep.jsx` (Paso 2):** Permite elegir la perfilería o abertura específica, inyectando el valor en `selectedModel`.
* **`ColorStep.jsx` (Paso 3):** Despliega el catálogo de acabados. Interactúa con el método `toggleColor` del contexto para mantener una estricta matriz dinámica (`selectedColors`) de máximo 4 opciones simultáneas.
* **`FacadeStep.jsx` (Paso 4):** Gestor de carga de la fachada base; convierte imágenes HEIC a JPG y asegura el envío del archivo en un formato binario compatible hacia el backend.

### B. Lienzo y Herramientas Visuales (Visores)

Componentes estrictamente reactivos a la respuesta de la simulación.

* **`Canvas.jsx`:** El núcleo visual interactivo. Evalúa `canvasState`. Cuando el estado es `"ready"`, renderiza la imagen base junto con el render activo devuelto por la IA (`renderSrc`), montando sobre ellos el deslizador de comparación **Antes / Después**.
* **`PreviewModal.jsx`:** Visor extendido de pantalla completa. Implementa interacción avanzada con gestos táctiles (zoom y paneo) de los renders generados, optimizando la experiencia en dispositivos móviles.
* **`ResultsFooter.jsx`:** Mapea la matriz `apiResults`. Renderiza miniaturas de los 4 acabados procesados y permite conmutar la imagen activa en el lienzo interactuando con la función `changeSimulatedColor`.

### C. Retroalimentación y Utilidades Compartidas

* **`Header.jsx`:** Componente de encabezado persistente que alberga la identidad visual de la marca.
* **`ShareModal.jsx`:** Interfaz emergente atada al estado booleano `shareOpen` del contexto. Controla la lógica de divulgación del render.
* **`Toasts.jsx`:** Suscrito al arreglo `toasts` del estado global. Renderiza alertas flotantes dinámicas sobre la UI para comunicar errores de red, expiración de sesión o restricciones de negocio.

---

## 9. Sincronización UI - Context (Data Flow)

El puente entre la interfaz y la lógica de negocio opera bajo un flujo de datos unidireccional (*One-Way Data Binding*):

1. **Lectura (UI):** Los componentes de React se redibujan automáticamente (aprovechando las clases responsivas de Tailwind CSS) cada vez que detectan un cambio en propiedades críticas del contexto, como `canvasState` o `loadingStep`.
2. **Mutación (Eventos):** Cuando el usuario interactúa (ej. sube una foto o elige un color), el componente no almacena el dato localmente, sino que invoca las funciones mutadoras del `SimuladorContext` (`handleFile`, `toggleColor`).
3. **Resolución (Feedback):** El Context resuelve las restricciones de negocio o las peticiones de red y propaga el nuevo estado hacia abajo, forzando a los componentes a reflejar visualmente el resultado final.

```

```