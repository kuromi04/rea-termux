const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8888;
const DIR = __dirname;

// Directorio de trabajo persistente del shell
let currentWorkingDir = DIR;

// Control de procesos activos
let activeTask = null;

function killActiveProcess(callback) {
  if (!activeTask || !activeTask.process) {
    if (callback) callback(null);
    return;
  }

  const pid = activeTask.pid;
  const child = activeTask.process;
  activeTask = null;

  try {
    try {
      process.kill(-pid, 'SIGTERM');
    } catch (e) {
      try {
        child.kill('SIGTERM');
      } catch (err) {}
    }

    setTimeout(() => {
      try {
        process.kill(-pid, 'SIGKILL');
      } catch (e) {
        try {
          child.kill('SIGKILL');
        } catch (err) {}
      }
      if (callback) callback(null);
    }, 400);
  } catch (err) {
    if (callback) callback(err);
  }
}

const server = http.createServer((req, res) => {
  // CORS y cabeceras base
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // Endpoint: Estado del servidor, CWD y tarea activa
  if (parsedUrl.pathname === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({
      status: 'online',
      pid: process.pid,
      cwd: currentWorkingDir,
      uptime: Math.floor(process.uptime()),
      activeTask: activeTask ? {
        cmd: activeTask.cmd,
        pid: activeTask.pid,
        elapsedSeconds: Math.floor((Date.now() - activeTask.startedAt) / 1000)
      } : null
    }));
  }

  // Endpoint: Abrir aplicación Termux nativa en Android
  if (parsedUrl.pathname === '/open-termux') {
    const launchCmd = `am start -n com.termux/.app.TermuxActivity 2>/dev/null || am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER -n com.termux/.app.TermuxActivity 2>/dev/null`;
    exec(launchCmd, (err) => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: !err,
        message: err ? 'No se pudo abrir Termux automáticamente.' : 'Redirigiendo a la app Termux...'
      }));
    });
    return;
  }

  // Endpoint: Cancelar / Finalizar tarea en ejecución
  if (parsedUrl.pathname === '/kill-task') {
    if (!activeTask) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ success: true, message: 'No hay ninguna tarea en ejecución activa.' }));
    }

    const cancelledCmd = activeTask.cmd;
    killActiveProcess(() => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: `Tarea cancelada con éxito: ${cancelledCmd}`
      }));
    });
    return;
  }

  // Endpoint: Finalizar servidor y cerrar rea-termux limpiamente
  if (parsedUrl.pathname === '/shutdown') {
    console.log('[*] Solicitud de apagado recibida. Finalizando tareas y cerrando servidor...');
    killActiveProcess(() => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        message: 'Servidor REA Termux finalizado correctamente. Tareas terminadas.'
      }));

      setTimeout(() => {
        server.close(() => {
          console.log('[✓] Servidor REA cerrado limpiamente.');
          process.exit(0);
        });
        setTimeout(() => process.exit(0), 1000);
      }, 300);
    });
    return;
  }

  // Endpoint: Ejecutar comandos con capacidades completas de Termux Bash
  if (parsedUrl.pathname === '/run') {
    let cmd = parsedUrl.searchParams.get('cmd');
    if (!cmd || !cmd.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'Comando vacío' }));
    }

    cmd = cmd.trim();

    // Abortar tarea previa si está corriendo
    if (activeTask && activeTask.process) {
      killActiveProcess();
    }

    // Entorno de ejecución con PATH y configuración de Termux
    const env = Object.assign({}, process.env, {
      PATH: `/data/data/com.termux/files/usr/bin:/data/data/com.termux/files/home/.local/bin:${process.env.PATH || ''}`,
      HOME: process.env.HOME || '/data/data/com.termux/files/home',
      PREFIX: process.env.PREFIX || '/data/data/com.termux/files/usr',
      SHELL: '/data/data/com.termux/files/usr/bin/bash',
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      LANG: 'en_US.UTF-8'
    });

    // Envolver en subshell de Bash preservando CWD y capturando cambios de directorio
    const bashWrapper = `cd "${currentWorkingDir}" && { ${cmd}; }; __CODE=$?; echo ""; echo "___REA_CWD___:$(pwd -P)"; exit $__CODE`;

    const child = exec(bashWrapper, {
      shell: '/data/data/com.termux/files/usr/bin/bash',
      env,
      timeout: 120000,
      maxBuffer: 4 * 1024 * 1024
    }, (err, stdout, stderr) => {
      activeTask = null;
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });

      let rawOutput = (stdout || '') + (stderr ? ('\n' + stderr) : '');

      // Extraer y actualizar el nuevo CWD si el usuario ejecutó cd
      const cwdMatch = rawOutput.match(/___REA_CWD___:([^\r\n]+)/);
      if (cwdMatch && cwdMatch[1]) {
        currentWorkingDir = cwdMatch[1].trim();
        rawOutput = rawOutput.replace(/\r?\n?___REA_CWD___:[^\r\n]+/, '');
      }

      const cleanOutput = rawOutput.trim();

      res.end(JSON.stringify({
        output: cleanOutput || (err ? `Error (${err.code || 'FAIL'}): ${err.message}` : '✓ Comando ejecutado sin salida.'),
        cwd: currentWorkingDir,
        exitCode: err ? (err.code || 1) : 0
      }));
    });

    activeTask = {
      cmd,
      pid: child.pid,
      startedAt: Date.now(),
      process: child
    };
    return;
  }

  // Rutas Web principales
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/graphify') {
    const filePath = path.join(DIR, 'menu-graphify.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(filePath).pipe(res);
  }

  if (parsedUrl.pathname === '/3d') {
    const filePath = path.join(DIR, 'menu-neural.html');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(filePath).pipe(res);
  }

  // Archivos estáticos
  let safePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(DIR, safePath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

// Captura de señales para apagado limpio
function cleanExit(signal) {
  console.log(`\n[!] Recibida señal ${signal}. Finalizando tareas y cerrando REA Termux...`);
  killActiveProcess(() => {
    server.close(() => {
      console.log('[✓] REA Termux cerrado correctamente.');
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 1000);
  });
}

process.on('SIGINT', () => cleanExit('SIGINT'));
process.on('SIGTERM', () => cleanExit('SIGTERM'));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[+] Servidor REA Neural Graph activo en: http://localhost:${PORT}`);
  console.log(`[+] Shell Termux Bash activo. Endpoints: /run, /open-termux, /status, /kill-task, /shutdown`);
});
