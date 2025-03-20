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
db.prepare("INSERT OR IGNORE INTO control (id, pagina) VALUES (1, 'loader')").run(); // 🔥 Arranca en loader siempre

// 🔌 WebSockets para actualización en tiempo real
wss.on("connection", (ws) => {
    console.log("🔌 Cliente WebSocket conectado");

    // 📌 Verificar qué página está guardada
    let row = db.prepare("SELECT pagina FROM control WHERE id = 1").get();
    let paginaActual = row ? row.pagina : "loader";

    console.log(`📌 Enviando página actual: ${paginaActual}`);
    ws.send(paginaActual);

    ws.on("close", () => {
        console.log("🔌 Cliente WebSocket desconectado");
    });
});

// 📌 Endpoint para verificar el estado de la página
app.get("/check", (req, res) => {
    let row = db.prepare("SELECT pagina FROM control WHERE id = 1").get();
    res.json({ pagina: row ? row.pagina : "loader" });
});

// 📌 Forzar la base de datos a `"loader"` cuando alguien entra a loader.html
app.get("/loader.html", (req, res) => {
    console.log("🔄 Volviendo a loader.html, reseteando base de datos...");
    db.prepare("UPDATE control SET pagina = 'loader' WHERE id = 1").run(); // 🔥 Siempre que se entra a loader.html, se resetea
    res.sendFile(path.join(__dirname, "public", "loader.html"));
});

// ⚡ Endpoint para cambiar la página (usado por el bot)
app.post("/setPage", (req, res) => {
    const { pagina } = req.body;

    if (!pagina || pagina.trim() === "") {
        return res.status(400).json({ error: "Falta el parámetro 'pagina'" });
    }

    if (pagina === "loader") {
        console.log("⚠️ Intento de cambiar a 'loader', ignorado.");
        return res.json({ message: "No se puede cambiar a 'loader' desde aquí" });
    }

    // ✅ Solo cambiar si es diferente a la actual
    let row = db.prepare("SELECT pagina FROM control WHERE id = 1").get();
    if (row && row.pagina === pagina) {
        console.log(`ℹ️ Página ya estaba en '${pagina}', no se actualiza.`);
        return res.json({ message: "Página ya estaba en ese estado" });
    }

    db.prepare("UPDATE control SET pagina = ? WHERE id = 1").run(pagina);
    console.log(`✅ Página cambiada a: ${pagina}`);

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(pagina);
        }
    });

    res.json({ message: "Página actualizada correctamente" });
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🌍 Servidor corriendo en http://0.0.0.0:${PORT}`));