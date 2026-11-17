#!/data/data/com.termux/files/usr/bin/bash
# REA Visualizer & Neural Matrix Controller (Graphify 2D + 3D)

PORT=8888
DIR="/data/data/com.termux/files/home/proyects/rea-termux"
SERVER_SCRIPT="$DIR/server-neural.js"

if [ ! -f "$SERVER_SCRIPT" ]; then
    DIR="/data/data/com.termux/files/home/Projects/rea-termux"
    SERVER_SCRIPT="$DIR/server-neural.js"
fi

get_pid() {
    local pid=$(lsof -ti :$PORT 2>/dev/null || true)
    if [ -z "$pid" ]; then
        pid=$(pgrep -f "server-neural.js" 2>/dev/null | grep -v "$$" | head -n 1 || true)
    fi
    echo "$pid"
}

stop_server() {
    echo -e "\e[1;33m[*] Deteniendo REA Termux y finalizando tareas activas...\e[0m"
    
    # 1. Intentar shutdown limpio vía HTTP si el servidor responde
    curl -s --max-time 2 "http://127.0.0.1:$PORT/shutdown" >/dev/null 2>&1 || true
    sleep 0.5

    # 2. Verificar PIDs residuales en el puerto o proceso
    local PID=$(get_pid)
    if [ -n "$PID" ]; then
        echo -e "\e[1;33m[*] Finalizando procesos REA (PID: $PID)...\e[0m"
        kill -15 $PID 2>/dev/null || true
        sleep 0.5
        kill -9 $PID 2>/dev/null || true
    fi

    # 3. Finalizar procesos node que ejecuten server-neural.js
    pkill -f "node.*server-neural.js" 2>/dev/null || true

    echo -e "\e[1;32m[✓] Servidor REA Termux detenido y tareas finalizadas correctamente.\e[0m\n"
}

start_server() {
    local PID=$(get_pid)
    if [ -n "$PID" ]; then
        echo -e "\e[1;33m[!] El servidor REA ya está activo en el PID: $PID (puerto $PORT)\e[0m"
    else
        echo -e "\e[1;34m[*] Iniciando servidor REA en segundo plano...\e[0m"
        nohup node "$SERVER_SCRIPT" </dev/null > "$DIR/server.log" 2>&1 &
        disown
        sleep 1.2
        PID=$(get_pid)
        if [ -n "$PID" ]; then
            echo -e "\e[1;32m[✓] Servidor iniciado exitosamente (PID: $PID).\e[0m"
        else
            echo -e "\e[1;31m[!] Error al iniciar el servidor. Revisa $DIR/server.log\e[0m"
            cat "$DIR/server.log" 2>/dev/null | tail -n 10
            return 1
        fi
    fi

    echo -e "\n\e[1;36m========================================================\e[0m"
    echo -e "\e[1;32m  🧠 REA Visualizer (Graphify 2D & Neural 3D Matrix)   \e[0m"
    echo -e "\e[1;36m========================================================\e[0m"
    echo -e "  🌐 \e[1;37mGraphify 2D Knowledge Graph:\e[0m \e[1;34mhttp://localhost:$PORT\e[0m"
    echo -e "  🌌 \e[1;37mNeural 3D Obsidian Matrix:   \e[0m \e[1;34mhttp://localhost:$PORT/3d\e[0m"
    echo -e "\n\e[1;33m[i] Controles rápidos de tarea:\e[0m"
    echo -e "    Detener/Finalizar: \e[1;37mrea-menu stop\e[0m"
    echo -e "    Ver Estado:        \e[1;37mrea-menu status\e[0m"
    echo -e "    Reiniciar:         \e[1;37mrea-menu restart\e[0m\n"
}

status_server() {
    local PID=$(get_pid)
    if [ -n "$PID" ]; then
        echo -e "\e[1;32m[✓] Servidor REA activo (PID: $PID) en puerto $PORT\e[0m"
        curl -s --max-time 2 "http://127.0.0.1:$PORT/status" 2>/dev/null | grep -o '.*' || true
    else
        echo -e "\e[1;31m[✕] El servidor REA Termux está detenido.\e[0m"
        echo -e "    Inícialo con: \e[1;37mrea-menu start\e[0m"
    fi
}

run_foreground() {
    echo -e "\e[1;34m[*] Iniciando servidor REA en primer plano (Presiona Ctrl+C para finalizar todo)...\e[0m"
    stop_server >/dev/null 2>&1 || true
    exec node "$SERVER_SCRIPT"
}

# Enrutamiento de subcomandos
case "$1" in
    stop|kill|down|close|exit)
        stop_server
        ;;
    status)
        status_server
        ;;
    restart)
        stop_server
        start_server
        ;;
    foreground|run|fg)
        run_foreground
        ;;
    start)
        start_server
        if [ "$2" == "--open" ] || [ "$2" == "-o" ]; then
            termux-open-url "http://localhost:$PORT" 2>/dev/null || am start -a android.intent.action.VIEW -d "http://localhost:$PORT" 2>/dev/null || true
        fi
        ;;
    --open|-o)
        start_server
        termux-open-url "http://localhost:$PORT" 2>/dev/null || am start -a android.intent.action.VIEW -d "http://localhost:$PORT" 2>/dev/null || true
        ;;
    *)
        start_server
        ;;
esac
