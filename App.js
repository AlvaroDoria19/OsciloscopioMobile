import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import Oscilloscope from './components/Oscilloscope';
import Generator from './components/Generator';

const ESP32_WS_URL = 'ws://192.168.4.1:81';

const VOLTS_PER_DIV_STEPS = [0.1, 0.2, 0.5, 1.0, 2.0];
const TIME_PER_DIV_STEPS = [1, 2, 5, 10, 20, 50];

export default function App() {
  const [currentView, setCurrentView] = useState('OSCILO');
  const currentViewRef = useRef('OSCILO');

  const [isConnected, setIsConnected] = useState(false);
  const [points, setPoints] = useState('');

  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  const [isACMode, setIsACMode] = useState(false);
  const isACModeRef = useRef(false);

  const [calOffsetAC, setCalOffsetAC] = useState(0.0);
  const calOffsetACRef = useRef(0.0);

  const [calOffsetDC, setCalOffsetDC] = useState(0.0);
  const calOffsetDCRef = useRef(0.0);

  const [vDivIndex, setVDivIndex] = useState(3);
  const vDivRef = useRef(VOLTS_PER_DIV_STEPS[3]);

  const [tDivIndex, setTDivIndex] = useState(3);
  const tDivRef = useRef(TIME_PER_DIV_STEPS[3]);

  const [vMax, setVMax] = useState(0.0);
  const [vMin, setVMin] = useState(0.0);
  const [vPp, setVPp] = useState(0.0);
  const [vHardwareDC, setVHardwareDC] = useState(0.0);

  const [waveType, setWaveType] = useState('SINE');
  const [freq, setFreq] = useState(50);
  const [amp, setAmp] = useState(3.3);

  const ws = useRef(null);
  const samplesBufferRef = useRef([]);

  const isHardwareDangerous = vHardwareDC < 0.2 || vHardwareDC > 2.7;

  const changeVDiv = (direction) => {
    const newIdx = vDivIndex + direction;
    if (newIdx >= 0 && newIdx < VOLTS_PER_DIV_STEPS.length) {
      setVDivIndex(newIdx);
      vDivRef.current = VOLTS_PER_DIV_STEPS[newIdx];
    }
  };

  const changeTDiv = (direction) => {
    const newIdx = tDivIndex + direction;
    if (newIdx >= 0 && newIdx < TIME_PER_DIV_STEPS.length) {
      setTDivIndex(newIdx);
      tDivRef.current = TIME_PER_DIV_STEPS[newIdx];
      samplesBufferRef.current = [];
    }
  };

  const updateView = (view) => {
    setCurrentView(view);
    currentViewRef.current = view;
  };

  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    isPausedRef.current = newState;
  };

  const toggleCoupling = () => {
    const newMode = !isACMode;
    setIsACMode(newMode);
    isACModeRef.current = newMode;
  };

  const updateOffset = (val) => {
    if (isACMode) {
      setCalOffsetAC(val);
      calOffsetACRef.current = val;
    } else {
      setCalOffsetDC(val);
      calOffsetDCRef.current = val;
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => { if (ws.current) ws.current.close(); };
  }, []);

  const connectWebSocket = () => {
    ws.current = new WebSocket(ESP32_WS_URL);

    // CONFIGURACIÓN CRÍTICA: Indicar que recibiremos ráfagas binarias directas
    ws.current.binaryType = 'arraybuffer';

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => {
      setIsConnected(false);
      setTimeout(connectWebSocket, 3000);
    };

    ws.current.onmessage = (event) => {
      if (isPausedRef.current || currentViewRef.current !== 'OSCILO') return;

      try {
        // LEER MEMORIA BINARIA: Convertimos los bytes directamente a enteros de 16 bits
        const uint16Array = new Uint16Array(event.data);
        const rawSamples = Array.from(uint16Array);

        const currentWidth = Dimensions.get('window').width - 40;
        const currentHeight = Dimensions.get('window').height * 0.55;
        const currentCenterY = currentHeight / 2;

        const pixelsPerVolt = currentHeight / (8 * vDivRef.current);
        const totalScreenTimeMs = 10 * tDivRef.current;

        const maxSamplesOnScreen = Math.floor(totalScreenTimeMs / 0.5);

        samplesBufferRef.current = [...samplesBufferRef.current, ...rawSamples];
        if (samplesBufferRef.current.length > maxSamplesOnScreen) {
          samplesBufferRef.current = samplesBufferRef.current.slice(-maxSamplesOnScreen);
        }

        let maxVal = -10.0;
        let minVal = 10.0;
        let sumVEsp = 0;

        const processedPoints = samplesBufferRef.current.map((raw, index) => {
          const vEsp = (raw / 4095.0) * 3.3;
          sumVEsp += vEsp;

          let vReal = 0;
          if (isACModeRef.current) {
            vReal = ((vEsp - 1.65) * 2.0) + calOffsetACRef.current;
          } else {
            vReal = (vEsp * 2.0) + calOffsetDCRef.current;
          }

          if (vReal > maxVal) maxVal = vReal;
          if (vReal < minVal) minVal = vReal;

          const x = (index / maxSamplesOnScreen) * currentWidth;
          const y = currentCenterY - (vReal * pixelsPerVolt);

          return `${x},${y}`;
        });

        const avgVHardware = sumVEsp / samplesBufferRef.current.length;

        setPoints(processedPoints.join(' '));
        setVMax(maxVal);
        setVMin(minVal);
        setVPp(maxVal - minVal);
        setVHardwareDC(avgVHardware);
      } catch (e) { }
    };
  };

  const sendCommand = (cmd) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(cmd);
    }
  };

  const currentOffsetValue = isACMode ? calOffsetAC : calOffsetDC;

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          Estado: {isConnected ? '🔴 CONECTADO AL ESP32' : '⚪ BUSCANDO RED...'}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, currentView === 'OSCILO' && styles.activeTab]} onPress={() => updateView('OSCILO')}>
          <Text style={styles.tabText}>OSCILOSCOPIO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, currentView === 'GENERADOR' && styles.activeTab]} onPress={() => updateView('GENERADOR')}>
          <Text style={styles.tabText}>GENERADOR</Text>
        </TouchableOpacity>
      </View>

      {currentView === 'OSCILO' ? (
        <Oscilloscope
          points={points} vMax={vMax} vMin={vMin} vPp={vPp} vHardwareDC={vHardwareDC}
          isPaused={isPaused} togglePause={togglePause}
          isACMode={isACMode} toggleCoupling={toggleCoupling}
          currentOffsetValue={currentOffsetValue} updateOffset={updateOffset}
          isHardwareDangerous={isHardwareDangerous}
          vDivVal={VOLTS_PER_DIV_STEPS[vDivIndex]} changeVDiv={changeVDiv}
          tDivVal={TIME_PER_DIV_STEPS[tDivIndex]} changeTDiv={changeTDiv}
        />
      ) : (
        <Generator
          waveType={waveType} handleWaveTypeChange={(type) => { setWaveType(type); sendCommand(`TYPE:${type}`); }}
          freq={freq} setFreq={setFreq} handleFreqComplete={(val) => sendCommand(`FREQ:${val}`)}
          amp={amp} setAmp={setAmp} handleAmpComplete={(val) => sendCommand(`AMP:${(val / 3.3).toFixed(2)}`)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 20 },
  statusBar: { backgroundColor: '#1e1e1e', padding: 8, alignItems: 'center' },
  statusText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  tabContainer: { flexDirection: 'row', height: 45, backgroundColor: '#1e1e1e' },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#00FF00' },
  tabText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 }
});