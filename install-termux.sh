#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "=== [REA Termux] Preparando entorno en Termux ==="

# Actualizar paquetes e instalar dependencias básicas
pkg update -y
pkg install -y nodejs-lts git python

# Clonar o verificar REA
if [ ! -d "rea" ]; then
    echo "Clonando repositorio oficial de REA..."
    git clone https://github.com/morluto/rea.git
fi

cd rea

echo "Instalando dependencias npm..."
npm install --engine-strict=false

echo "Compilando runtime optimizado para Termux..."
npm run build:termux

echo "Verificando instalación..."
node scripts/rea.mjs --version || node scripts/rea.mjs --help

echo "=== [REA Termux] ¡Instalación y compilación completada con éxito! ==="
echo "Puedes ejecutar el CLI con: node /ruta/a/rea/scripts/rea.mjs <comando>"
echo "O como servidor MCP: node /ruta/a/rea/scripts/rea.mjs mcp"
