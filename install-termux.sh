#!/data/data/com.termux/files/usr/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== [REA Termux] Preparando entorno en Termux ==="

# Actualizar paquetes e instalar dependencias básicas
pkg update -y
pkg install -y nodejs-lts git python

# Clonar o verificar REA
if [ ! -d "$DIR/rea" ]; then
    echo "Clonando repositorio oficial de REA..."
    git clone https://github.com/morluto/rea.git "$DIR/rea"
fi

cd "$DIR/rea"

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

REA_SCRIPT="/data/data/com.termux/files/home/proyects/rea-termux/rea/scripts/rea.mjs"
if [ ! -f "$REA_SCRIPT" ]; then
    REA_SCRIPT="/data/data/com.termux/files/home/Projects/rea-termux/rea/scripts/rea.mjs"
fi
exec node "$REA_SCRIPT" "$@"
RUNNER
chmod +x $PREFIX/bin/rea

# Instalar y sincronizar controlador visual 'rea-menu'
if [ -f "$DIR/rea-menu.sh" ]; then
    echo "Instalando comando global 'rea-menu'..."
    cp "$DIR/rea-menu.sh" $PREFIX/bin/rea-menu
    chmod +x $PREFIX/bin/rea-menu
    ln -sf $PREFIX/bin/rea-menu $PREFIX/bin/aegisforge-menu
fi

# Regenerar datos del grafo educativo
if [ -f "$DIR/generate-neural-menu.js" ]; then
    echo "Regenerando base de datos de grafo táctico y clusters educativos..."
    cd "$DIR"
    node generate-neural-menu.js
fi

echo "=== [REA Termux] ¡Instalación y compilación completada con éxito! ==="
echo "Ahora puedes usar directamente:"
echo "  • rea <comando>            (CLI directo)"
echo "  • rea-menu                 (Iniciar menú táctico y visualizador web)"
echo "  • rea-menu stop            (Finalizar servidor y tareas)"
echo "  • rea-menu status          (Comprobar estado del servidor)"
echo "  • rea mcp                  (Servidor para agentes IA)"
