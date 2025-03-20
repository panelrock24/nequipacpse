import telebot
import requests
import os
import signal
import sys

# Token de Telegram
TOKEN = "7669760908:AAFpRpQVlvJbSmignQoO1SwPuyoxsHL_i2c"
bot = telebot.TeleBot(TOKEN)

# URL del servidor desplegado en Render
SERVER_URL = "https://nequipacpseapp.onrender.com/setPage"

# 🛑 Eliminar el Webhook antes de iniciar polling
bot.remove_webhook()

# Mensaje de bienvenida
@bot.message_handler(commands=["start"])
def send_welcome(message):
    bot.reply_to(message, "¡Hola! Usa /show seguido de una página para cambiar. Ejemplo: /show pag1")

# Comando para cambiar de página
@bot.message_handler(commands=["show"])
def cambiar_pagina(message):
    try:
        if len(message.text.split()) < 2:
            bot.reply_to(message, "⚠️ Uso correcto: /show pag1|pag2|pag3|pag4|pag5")
            return
        
        pagina = message.text.split()[1].lower()
        paginas_validas = ["pag1", "pag2", "pag3", "pag4", "pag5"]

        if pagina in paginas_validas:
            response = requests.post(SERVER_URL, json={"pagina": pagina})
            
            if response.status_code == 200:
                bot.reply_to(message, f"✅ Página cambiada a {pagina}")
            else:
                bot.reply_to(message, f"❌ Error al cambiar la página. Código de estado: {response.status_code}")
        else:
            bot.reply_to(message, "⚠️ Página inválida. Usa: /show pag1|pag2|pag3|pag4|pag5")
    except requests.exceptions.RequestException as e:
        bot.reply_to(message, f"❌ Error de conexión: {str(e)}")
    except Exception as e:
        bot.reply_to(message, f"❌ Ocurrió un error inesperado: {str(e)}")

# Manejo de errores
@bot.message_handler(func=lambda message: True)
def manejar_errores(message):
    bot.reply_to(message, "⚠️ Comando no reconocido. Usa /show seguido de una página. Ejemplo: /show pag1")

# Función para detener el bot correctamente
def detener_bot(signum, frame):
    print("\nDeteniendo el bot...")
    bot.stop_polling()
    sys.exit(0)

# Capturar la señal de interrupción (Ctrl+C)
signal.signal(signal.SIGINT, detener_bot)

# Iniciar el bot
print("Bot iniciado. Presiona Ctrl+C para detener.")
bot.remove_webhook()
bot.polling(skip_pending=True)