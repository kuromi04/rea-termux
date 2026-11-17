const fs = require('fs');
const path = require('path');

const commandsFile = fs.existsSync(path.join(__dirname, 'rea-commands.json'))
  ? path.join(__dirname, 'rea-commands.json')
  : '/data/data/com.termux/files/home/proyects/rea-termux/rea-commands.json';

const commands = JSON.parse(fs.readFileSync(commandsFile, 'utf8'));

// Base de Conocimiento Educativa de Clusters
const clustersInfo = {
  CORE: {
    id: 'CORE',
    label: 'Core & Engine',
    color: '#00f3ff',
    icon: '⚡',
    title: 'REA Core, Motor & Diagnósticos',
    subtitle: 'Núcleo de orquestación, contratos y servidor MCP para IA',
    whatIs: 'Es el cerebro y motor central de Reverse Engineer Anything (REA). Coordina los módulos de análisis, valida contratos de datos estructurados, evalúa la salud de las herramientas del sistema y ofrece una pasarela MCP (Model Context Protocol) para que modelos de IA ejecuten tareas autónomas de ingeniería inversa.',
    usage: 'Se utiliza para comprobar el estado y dependencias en Termux (doctor), descubrir qué proveedores y decompiladores están disponibles en el entorno (providers), consultar las capacidades activas (capabilities) y orquestar sesiones de análisis automatizado.',
    workflow: [
      '1. Diagnóstico Inicial: Ejecuta "rea doctor" para verificar dependencias, rutas y compiladores en Termux.',
      '2. Auditoría de Capacidades: Lanza "rea providers" y "rea capabilities" para conocer las herramientas disponibles.',
      '3. Integración con Agentes IA: Inicia "rea mcp" para exponer las capacidades de REA a asistentes como Gemini o Claude.'
    ],
    tools: ['Motor TypeScript/Node.js', 'Model Context Protocol (MCP)', 'JSON Schema Contracts', 'Termux Fast-Path Runner'],
    difficulty: 'Fundamental',
    keyCommands: [
      { name: 'doctor', cmd: 'rea doctor', desc: 'Verifica la integridad de los proveedores y el entorno Termux.' },
      { name: 'providers', cmd: 'rea providers', desc: 'Lista los motores de análisis y descompiladores activos.' },
      { name: 'capabilities', cmd: 'rea capabilities', desc: 'Muestra todas las operaciones soportadas por REA.' },
      { name: 'evaluate-mcp-catalog', cmd: 'rea evaluate-mcp-catalog', desc: 'Valida las herramientas del catálogo MCP para agentes IA.' }
    ],
    match: /^(analyze|doctor|setup|uninstall|update|providers|capabilities|evidence|evaluate)/
  },
  ANDROID: {
    id: 'ANDROID',
    label: 'Android & ADB',
    color: '#00ff88',
    icon: '📱',
    title: 'Android, ADB & Mobile Forensics',
    subtitle: 'Interacción en vivo vía ADB, inspección de APKs y runtime móvil',
    whatIs: 'Módulo especializado en análisis dinámico y estático de dispositivos Android (físicos o emuladores) y aplicaciones APK. Aprovecha el puente ADB para inspeccionar procesos en memoria, capturar estados de pantalla y extraer bases de datos SQLite o preferencias privadas.',
    usage: 'Auditar aplicaciones móviles, inspeccionar tráfico o almacenamiento local sin requerir interfaz gráfica compleja, capturar pantallas de apps en ejecución, verificar manifiestos de permisos (AndroidManifest.xml) y monitorear llamadas al sistema en vivo.',
    workflow: [
      '1. Vinculación ADB: Conecta tu móvil por USB o WiFi ("adb devices" o "rea list-adb-connected-devices").',
      '2. Captura Visual: Ejecuta "rea capture-adb-screen" para registrar el estado de la app en pantalla.',
      '3. Extracción Forense: Descarga bases de datos SQLite o XMLs privados ("read-adb-app-shared-preferences").',
      '4. Monitoreo en Vivo: Trazado dinámico de llamadas y procesos con "rea trace-android-device".'
    ],
    tools: ['ADB (Android Debug Bridge)', 'Apktool / AAPT', 'Logcat & Dumpsys', 'SQLite Inspector', 'Android Activity Manager'],
    difficulty: 'Intermedio',
    keyCommands: [
      { name: 'capture-adb-screen', cmd: 'rea capture-adb-screen', desc: 'Captura un frame de la pantalla del dispositivo como PNG digerido.' },
      { name: 'collect-adb-system-properties', cmd: 'rea collect-adb-system-properties', desc: 'Extrae build.prop y propiedades del hardware/sistema.' },
      { name: 'decode-android-app-manifest', cmd: 'rea decode-android-app-manifest', desc: 'Decodifica el AndroidManifest.xml binario a XML legible.' },
      { name: 'read-adb-app-shared-preferences', cmd: 'rea read-adb-app-shared-preferences', desc: 'Lee ficheros de configuración XML privados de una app.' },
      { name: 'trace-android-device', cmd: 'rea trace-android-device', desc: 'Traza llamadas, actividades y procesos en ejecución.' }
    ],
    match: /^(capture-adb|collect-adb|decode-android|project-android|pull-adb|push-adb|read-adb|resolve-adb|search-android|start-adb|stop-adb|trace-android|uninstall-adb)/
  },
  BINARY: {
    id: 'BINARY',
    label: 'Native & Binary',
    color: '#ff0055',
    icon: '🧩',
    title: 'Binarios Nativos, ELF & Desensamblado',
    subtitle: 'Análisis estático/dinámico de código máquina, Ghidra y parcheo',
    whatIs: 'Conjunto de utilidades de bajo nivel para ingeniería inversa sobre binarios compilados (archivos ejecutables ELF de Linux/Android, PE de Windows, Mach-O, librerías .so/.dll). Integra desensamblado en ensamblador (ASM), descompilación a C y utilidades de parcheo de bytes.',
    usage: 'Descubrir la lógica interna de librerías compartidas nativas, analizar protecciones contra ingeniería inversa, encontrar referencias cruzadas (XREFs), auditar vulnerabilidades y modificar el flujo de ejecución mediante parches de bytes.',
    workflow: [
      '1. Inspección de Protecciones: Comprueba protecciones (NX, PIE, Canaries) con "rea inspect-binary-hardening".',
      '2. Búsqueda de Firmas: Localiza cadenas y bytes clave usando "rea search-bytes".',
      '3. Desensamblado / Decompilación: Convierte funciones a ASM o C con "rea decompile-function".',
      '4. Mapeo y Parcheo: Convierte direcciones virtuales a offsets con "rea address-to-file-offset" y aplica cambios.'
    ],
    tools: ['Ghidra Decompiler', 'Cutter / Rizin', 'Radare2 Bridge', 'Readelf / LLVM', 'GDB', 'Frida Hooking'],
    difficulty: 'Avanzado',
    keyCommands: [
      { name: 'inspect-binary-hardening', cmd: 'rea inspect-binary-hardening', desc: 'Evalúa mitigaciones binarias (ASLR, Stack Canaries, NX, RELRO).' },
      { name: 'decompile-function', cmd: 'rea decompile-function --help', desc: 'Decompila una función nativa a pseudocódigo C de alto nivel.' },
      { name: 'disassemble-function', cmd: 'rea disassemble-function --help', desc: 'Desensambla una función a instrucciones ASM.' },
      { name: 'address-to-file-offset', cmd: 'rea address-to-file-offset', desc: 'Traduce una dirección virtual de memoria a offset en el archivo.' },
      { name: 'patch-binary-bytes', cmd: 'rea patch-binary-bytes --help', desc: 'Aplica un parche o hook de bytes directamente en el binario.' }
    ],
    match: /^(address-to|annotate-native|cutter|debug-with|decompile|demangle|disassemble|dump-memory|find-|inspect-|list-|locate-|modify-|patch-|read-bytes|resolve-native|search-bytes|trace-dylib|trace-native|xrefs)/
  },
  WEB_JS: {
    id: 'WEB_JS',
    label: 'Web & JavaScript',
    color: '#ffe600',
    icon: '🌐',
    title: 'Web, JavaScript & Electron',
    subtitle: 'Reconstrucción de AST, mapas de fuentes y auditoría Electron',
    whatIs: 'Herramientas orientadas al análisis de aplicaciones web modernas, frontends de una sola página (SPAs), bundles minificados (Webpack, Vite, Rollup) y programas de escritorio empaquetados en Electron / Node.js.',
    usage: 'Recuperar el código fuente original a partir de archivos .map (Source Maps), inspeccionar paquetes .asar de Electron, analizar comunicaciones IPC y tráfico HTTP de aplicaciones web, y auditar posibles filtraciones de tokens o APIs privadas.',
    workflow: [
      '1. Captura de Escenario: Descarga el bundle o ejecuta navegación con "rea capture-browser-scenario".',
      '2. Reconstrucción de Fuentes: Extrae el código original con "rea extract-sourcemaps".',
      '3. Formateo y Análisis AST: Desofusca funciones y normaliza la sintaxis con "rea format-javascript-snippet".',
      '4. Auditoría de Seguridad: Evalúa configuraciones y aislamiento de contexto en apps Electron.'
    ],
    tools: ['Babel AST Parser', 'Playwright Browser Automation', 'SourceMap Engine', 'Electron ASAR Inspector'],
    difficulty: 'Intermedio',
    keyCommands: [
      { name: 'analyze-javascript-application', cmd: 'rea analyze-javascript-application', desc: 'Reconstruye estáticamente una app JS/Electron local.' },
      { name: 'extract-sourcemaps', cmd: 'rea extract-sourcemaps --help', desc: 'Extrae ficheros fuente originales a partir de mapas .map.' },
      { name: 'format-javascript-snippet', cmd: 'rea format-javascript-snippet --help', desc: 'Embellece y desofusca fragmentos de código JavaScript.' },
      { name: 'capture-electron-scenario', cmd: 'rea capture-electron-scenario --help', desc: 'Ejecuta y audita escenarios controlados en Electron.' },
      { name: 'capture-browser-scenario', cmd: 'rea capture-browser-scenario --help', desc: 'Automatiza sesiones de navegador para capturar tráfico.' }
    ],
    match: /^(analyze-javascript|analyze-web|capture-browser|capture-electron|capture-web|compare-application|compare-javascript|compare-source|compare-web|discover-webmcp|extract-sourcemaps|format-javascript|reconcile-javascript|recover-javascript|trace-javascript|trace-web)/
  },
  MANAGED: {
    id: 'MANAGED',
    label: 'Managed & WASM',
    color: '#b537f2',
    icon: '🔮',
    title: 'Runtimes Gestionados (.NET, Unity & WASM)',
    subtitle: 'Metadatos Unity IL2CPP, bytecode CIL y WebAssembly',
    whatIs: 'Módulo diseñado para plataformas que no compilan directamente a binario nativo clásico sino a formatos intermedios (bytecode) o compilación Ahead-Of-Time: ensamblados .NET (C#), juegos Unity con tecnología IL2CPP y módulos WebAssembly (.wasm).',
    usage: 'Recuperar estructuras de clases, campos y firmas de métodos en juegos móviles desarrollados con Unity mediante el volcado de metadatos, inspeccionar imports/exports en binarios WebAssembly y comparar versiones de librerías .NET.',
    workflow: [
      '1. Identificación: Detecta si el binario utiliza Unity IL2CPP ("global-metadata.dat") o WebAssembly (.wasm).',
      '2. Volcado de Metadatos: Extrae estructuras de tipos con "rea inspect-managed-assembly".',
      '3. Desensamblado WASM: Convierte bytecode .wasm a instrucciones textuales .wat ("rea inspect-wasm-module").',
      '4. Verificación de Contratos: Decodifica interfaces con "rea decode-interface-signature".'
    ],
    tools: ['Il2CppDumper Engine', 'WABT (WebAssembly Binary Toolkit)', 'CIL / .NET Metadata Engine', 'NativeAOT Parser'],
    difficulty: 'Avanzado',
    keyCommands: [
      { name: 'inspect-wasm-module', cmd: 'rea inspect-wasm-module --help', desc: 'Inspecciona secciones, imports y funciones de módulos WASM.' },
      { name: 'compare-managed-types', cmd: 'rea compare-managed-types --help', desc: 'Compara estructuras de tipos entre versiones de ensamblados.' },
      { name: 'decode-interface-signature', cmd: 'rea decode-interface-signature --help', desc: 'Decodifica firmas de métodos e interfaces gestionadas.' },
      { name: 'compare-wasm-interfaces', cmd: 'rea compare-wasm-interfaces --help', desc: 'Analiza cambios en interfaces públicas de WebAssembly.' }
    ],
    match: /^(compare-managed|compare-wasm|project-managed|verify-managed|inspect-managed|inspect-wasm|decode-interface)/
  },
  ENV: {
    id: 'ENV',
    label: 'Agent Env & Replay',
    color: '#ff8800',
    icon: '📦',
    title: 'Entornos de Agente & Replay Forense',
    subtitle: 'Paquetes AgentEnv reproducibles y auditorías deterministas',
    whatIs: 'Sistema de encapsulación reproducible de evidencias forenses (AgentEnv). Permite congelar el estado de aplicaciones analizadas, registrar interacciones y generar libros contables de reconstrucción para agentes de IA e investigadores.',
    usage: 'Generar réplicas portátiles de análisis para trabajar sin depender de la aplicación original en vivo, verificar determinismo con hashes SHA-256 criptográficos y generar documentación estructurada de hallazgos.',
    workflow: [
      '1. Captura de Entorno: Empaqueta estado y evidencias en un paquete AgentEnv ("export-agent-environment").',
      '2. Registro Determinista: Genera el libro contable de reconstrucción ("build-reconstruction-obligation-ledger").',
      '3. Replay Forense: Distribuye el paquete a agentes de IA para reproducir análisis offline ("import-agent-environment").'
    ],
    tools: ['AgentEnv Bundler', 'Deterministic Replay Engine', 'Cryptographic Hasher', 'Evidence Ledger Writer'],
    difficulty: 'Especializado',
    keyCommands: [
      { name: 'build-reconstruction-obligation-ledger', cmd: 'rea build-reconstruction-obligation-ledger --help', desc: 'Genera el libro contable formal con evidencias de reconstrucción.' },
      { name: 'export-agent-environment', cmd: 'rea export-agent-environment --help', desc: 'Exporta un bundle reproducible para investigación offline.' },
      { name: 'import-agent-environment', cmd: 'rea import-agent-environment --help', desc: 'Carga un entorno AgentEnv capturado previamente.' },
      { name: 'list-environment-replays', cmd: 'rea list-environment-replays --help', desc: 'Lista grabaciones y reproducciones disponibles.' }
    ],
    match: /^(environment-|build-reconstruction|export-|import-|list-environment)/
  }
};

const clusters = Object.values(clustersInfo);

const nodes = [];
const links = [];

// Nodo Central REA_ROOT
nodes.push({
  id: 'REA_ROOT',
  name: 'REA 6.9.0 CORE',
  category: 'ROOT',
  isCluster: true,
  val: 32,
  color: '#ffffff',
  icon: '🌌',
  title: 'REA - Reverse Engineer Anything',
  subtitle: 'Centro neurálgico unificado de ingeniería inversa en Termux',
  whatIs: 'Reverse Engineer Anything (REA) es la plataforma de ingeniería inversa unificada diseñada para analizar binarios nativos, aplicaciones móviles Android, plataformas web/Electron, runtimes gestionados (.NET/Unity/WASM) y entornos reproducibles con asistencia de IA.',
  usage: 'Punto de partida global. Explora los 6 clusters principales navegando por el grafo interactivo en 2D o en la matriz 3D. Selecciona cualquier nodo para ver su propósito y ejecutar comandos directamente en tu terminal Termux.',
  workflow: [
    '1. Elige tu objetivo (App Android, binario nativo, web/Electron, juego Unity o entorno reproducible).',
    '2. Haz clic en el cluster correspondiente en el grafo para aislar sus herramientas.',
    '3. Selecciona un comando específico para ver su explicación, sintaxis y ejecutarlo en la consola.'
  ],
  tools: ['REA Engine v6.9.0', 'Termux Architecture', 'Unified Knowledge Graph', 'Model Context Protocol (MCP)'],
  difficulty: 'General',
  keyCommands: [
    { name: 'help', cmd: 'rea --help', desc: 'Muestra la ayuda global y comandos disponibles.' },
    { name: 'version', cmd: 'rea --version', desc: 'Informa la versión instalada del motor REA.' },
    { name: 'doctor', cmd: 'rea doctor', desc: 'Diagnóstico de salud del sistema y herramientas externas.' }
  ],
  desc: 'Reverse Engineer Anything - Unified Neural Matrix',
  cmd: 'rea --help'
});

// Nodos Clusters
clusters.forEach(c => {
  nodes.push({
    id: c.id,
    name: c.label,
    category: c.id,
    isCluster: true,
    val: 20,
    color: c.color,
    icon: c.icon,
    title: c.title,
    subtitle: c.subtitle,
    whatIs: c.whatIs,
    usage: c.usage,
    workflow: c.workflow,
    tools: c.tools,
    difficulty: c.difficulty,
    keyCommands: c.keyCommands,
    desc: `${c.title}: ${c.subtitle}. Toca la tarjeta para ver qué es, su uso práctico y comandos recomendados.`,
    cmd: `rea --help`
  });

  links.push({
    source: 'REA_ROOT',
    target: c.id,
    color: c.color
  });
});

// Nodos Comandos (Neuronas operativas)
commands.forEach(cmd => {
  let matchedCluster = clusters.find(c => c.match.test(cmd.name));
  if (!matchedCluster) {
    matchedCluster = clusters[0]; // fallback CORE
  }

  nodes.push({
    id: cmd.name,
    name: cmd.name,
    category: matchedCluster.id,
    isCluster: false,
    val: 8,
    color: matchedCluster.color,
    clusterTitle: matchedCluster.title,
    desc: cmd.desc,
    cmd: `rea ${cmd.name}`
  });

  links.push({
    source: matchedCluster.id,
    target: cmd.name,
    color: matchedCluster.color
  });
});

const graphData = { nodes, links };
const outFile = path.join(__dirname, 'graph-data.json');
fs.writeFileSync(outFile, JSON.stringify(graphData, null, 2));
console.log(`[✓] Grafo neuronal educativo generado con éxito (${nodes.length} nodos, ${links.length} enlaces).`);
