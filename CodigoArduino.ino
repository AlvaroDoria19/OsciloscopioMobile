#include <Arduino.h>
#include <WiFi.h>
#include <WebSocketsServer.h>

// --- CONFIGURACIÓN DE RED WI-FI ---
const char* ssid = "ESP32-Osciloscopio";
const char* password = "telecomunicaciones"; 

WebSocketsServer webSocket = WebSocketsServer(81); 

const int adcPin = 32;
const int dacPin = 25;

// --- VARIABLES DEL GENERADOR ---
int waveMode = 2; // 0=OFF, 1=SQUARE, 2=SINE
float frequency = 50.0;
float amplitudeScale = 1.0;

// --- VARIABLES DEL OSCILOSCOPIO (Estable a 2 kHz) ---
const int PACKET_SIZE = 150; 
uint16_t samples[PACKET_SIZE]; // Cambiado a uint16_t (2 bytes por muestra)
int sampleIndex = 0;

unsigned long lastSampleTime = 0;
unsigned long sampleInterval = 500; // 500 microsegundos = 2 kHz

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    String input = String((char*)payload);
    input.trim();

    if (input.startsWith("TYPE:")) {
      String t = input.substring(5);
      if (t == "OFF") waveMode = 0;
      else if (t == "SQUARE") waveMode = 1;
      else if (t == "SINE") waveMode = 2;
    } else if (input.startsWith("FREQ:")) {
      frequency = input.substring(5).toFloat();
    } else if (input.startsWith("AMP:")) {
      amplitudeScale = input.substring(4).toFloat();
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(adcPin, INPUT);

  WiFi.softAP(ssid, password);
  Serial.println("Red Wi-Fi Iniciada: " + String(ssid));
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();

  unsigned long t = micros();
  long period = 1000000.0 / frequency;

  // --- 1. GENERADOR DE SEÑALES ---
  if (waveMode == 1) { 
    if ((t % period) < (period / 2)) {
      dacWrite(dacPin, (int)(255 * amplitudeScale));
    } else {
      dacWrite(dacPin, 0);
    }
  } 
  else if (waveMode == 2) { 
    float angle = (2.0 * PI * (t % period)) / period;
    int sineVal = (int)(127.5 + (127.5 * sin(angle) * amplitudeScale));
    dacWrite(dacPin, sineVal);
  } 
  else {
    dacWrite(dacPin, 0);
  }

  // --- 2. OSCILOSCOPIO (Muestreo Binario Puro) ---
  if (t - lastSampleTime >= sampleInterval) {
    lastSampleTime = t;
    
    samples[sampleIndex] = (uint16_t)analogRead(adcPin);
    sampleIndex++;

    if (sampleIndex >= PACKET_SIZE) {
      // ENVIAR BUFFER BINARIO: Cero procesamiento de texto, velocidad máxima de hardware
      webSocket.broadcastBIN((uint8_t*)samples, PACKET_SIZE * sizeof(uint16_t));
      sampleIndex = 0;
    }
  }
}