const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 8888;
const DIR = __dirname;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (parsedUrl.pathname === '/run') {
    const cmd = parsedUrl.searchParams.get('cmd');
    if (!cmd || !cmd.startsWith('rea')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Comando no permitido o inválido' }));
    }
    // Ejecutar con límite de tiempo
    exec(cmd, { timeout: 15000 }, (err, stdout, stderr) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        output: stdout || stderr || (err ? err.message : 'Ejecutado sin salida')
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
