# 📡 Osciloscopio y Generador de Señales Inalámbrico (ESP32 + React Native)

Un instrumento de medición y generación de señales híbrido y de baja latencia. Este proyecto combina la capacidad de adquisición de hardware de un microcontrolador ESP32 con la potencia de procesamiento gráfico de una aplicación móvil desarrollada en React Native, comunicándose en tiempo real mediante un servidor WebSocket sobre una red Wi-Fi aislada.

---

## 🚀 Características Principales

* **Transmisión Binaria Pura (Raw Binary):** El muestreo del ADC se transmite en ráfagas de enteros de 16 bits (`uint16_t`). Esto elimina la fragmentación de la memoria dinámica (Heap) en el ESP32, garantizando un flujo constante a 2 kHz sin pérdida de paquetes ni caídas de red.
* **Generador de Funciones Integrado:** Utiliza el DAC del ESP32 para sintetizar señales senoidales y cuadradas con frecuencia y amplitud variables.
* **Motor Gráfico con Búfer Circular (Rolling Window):** La interfaz móvil renderiza la señal de forma continua y fluida de derecha a izquierda, emulando el comportamiento de instrumentos de laboratorio comerciales.
* **Acondicionamiento y Acoplamiento Analógico:** Soporte para simulación de acoplamiento AC/DC mediante software, basado en un offset de hardware configurado a ~1.65V (Tierra Virtual) usando un OpAmp como buffer de entrada.
* **Escalas Dinámicas:** Controles físicos simulados para modificar la base de tiempo (Time/Div) y la resolución de voltaje (Volts/Div).

---

## 🛠️ Requisitos de Hardware

* Microcontrolador **ESP32** (DevKit V1 o similar).
* Amplificador Operacional (OpAmp) configurado como buffer de entrada.
* Resistencias de 10k Ohms para divisores de tensión.
* Potenciómetro de ajuste (para calibración del Bias/Offset DC).
* Capacitor de acoplamiento 1uF.
* Cables jumper y protoboard.
---

## 💻 Tecnologías Utilizadas

* **Firmware:** C++ (Arduino IDE), librerías `WiFi.h` y `WebSocketsServer.h`.
* **Frontend Móvil:** React Native, Expo, React Native SVG.
* **Protocolo de Red:** WebSockets (TCP/IP) con transmisión `ArrayBuffer`.

---
