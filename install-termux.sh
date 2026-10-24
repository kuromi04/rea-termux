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

echo "Creando comando global 'rea' en Termux..."
cat << 'RUNNER' > $PREFIX/bin/rea
#!/data/data/com.termux/files/usr/bin/bash

# Auto-detectar serial ADB si se omite en capture-adb-screen
if [ "$1" == "capture-adb-screen" ] && [ -z "$2" ]; then
    DEVICE=$(adb devices 2>/dev/null | grep -v "List of devices attached" | grep -v "^$" | grep -E "device$|emulator" | awk '{print $1}' | head -n 1)
    if [ -n "$DEVICE" ]; then
        echo -e "\e[1;32m[+] Dispositivo ADB detectado automáticamente: $DEVICE\e[0m"
        set -- "$1" "$DEVICE"
    else
        echo -e "\e[1;31m[!] No se especificó <serial> y no hay dispositivos ADB conectados.\e[0m"
        echo -e "\e[1;33m[i] Conecta tu dispositivo por USB/WiFi o inicia adb connect <ip>:<puerto>\e[0m\n"
    fi
fi

exec node /data/data/com.termux/files/home/Projects/AI-Haklab-Repo/rea/scripts/rea.mjs "$@"
RUNNER
chmod +x $PREFIX/bin/rea

echo "=== [REA Termux] ¡Instalación y compilación completada con éxito! ==="
echo "Ahora puedes usar directamente: rea <comando>"
echo "Ejemplo: rea --version"
echo "O como servidor MCP: rea mcp"
