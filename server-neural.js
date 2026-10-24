const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8888;
const DIR = __dirname;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (parsedUrl.pathname === '/run') {
    let cmd = parsedUrl.searchParams.get('cmd');
    if (!cmd || !cmd.trim().startsWith('rea')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Solo se permiten comandos que comiencen con rea' }));
    }

    cmd = cmd.trim();

    // Entorno de ejecución con PATH de Termux
    const env = Object.assign({}, process.env, {
      PATH: `/data/data/com.termux/files/usr/bin:${process.env.PATH || ''}`
    });

    exec(cmd, { env, timeout: 25000, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const output = (stdout || '') + (stderr ? ('\n' + stderr) : '');
      res.end(JSON.stringify({
        output: output.trim() || (err ? `Error (${err.code}): ${err.message}` : 'Comando ejecutado exitosamente.')
      }));
    });
    return;
  }

  let filePath = path.join(DIR, parsedUrl.pathname === '/' ? 'menu-neural.html' : parsedUrl.pathname);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html',
    '.json': 'application/json',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
  };

  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[+] Servidor REA Neural Graph 3D activo en: http://localhost:${PORT}`);
});
