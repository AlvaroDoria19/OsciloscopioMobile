import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import Slider from '@react-native-community/slider';
import { Svg, Polyline, Line } from 'react-native-svg';

export default function Oscilloscope({
  points, vMax, vMin, vPp, vHardwareDC, 
  isPaused, togglePause, 
  isACMode, toggleCoupling, 
  currentOffsetValue, updateOffset, 
  isHardwareDangerous,
  vDivVal, changeVDiv,
  tDivVal, changeTDiv
}) {
  
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const CANVAS_WIDTH = screenWidth - 40; 
  const CANVAS_HEIGHT = screenHeight * 0.55; 
  
  const renderGrid = () => {
    const lines = [];
    for (let i = 1; i < 10; i++) {
      const x = (CANVAS_WIDTH / 10) * i;
      const isCenter = i === 5;
      lines.push(
        <Line key={`v${i}`} x1={x} y1="0" x2={x} y2={CANVAS_HEIGHT} 
              stroke={isCenter ? "#666666" : "#2a2a2a"} 
              strokeWidth={isCenter ? "1.5" : "1"} 
              strokeDasharray={isCenter ? "5,5" : "none"} />
      );
    }
    for (let i = 1; i < 8; i++) {
      const y = (CANVAS_HEIGHT / 8) * i;
      const isCenter = i === 4;
      lines.push(
        <Line key={`h${i}`} x1="0" y1={y} x2={CANVAS_WIDTH} y2={y} 
              stroke={isCenter ? "#666666" : "#2a2a2a"} 
              strokeWidth={isCenter ? "1.5" : "1"} 
              strokeDasharray={isCenter ? "5,5" : "none"} />
      );
    }
    return lines;
  };

  return (
    <View style={styles.content}>
      <View style={[styles.screenWrapper, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }]}>
        <Svg height={CANVAS_HEIGHT} width={CANVAS_WIDTH} style={styles.svgCanvas}>
          {renderGrid()}
          {points.length > 0 && <Polyline points={points} fill="none" stroke="#00FF00" strokeWidth="2.5" />}
        </Svg>

        <View style={styles.telemetryBox}>
          <Text style={styles.telemetryText}>Vmax: {vMax.toFixed(2)}V</Text>
          <Text style={styles.telemetryText}>Vmin: {vMin.toFixed(2)}V</Text>
          <Text style={styles.telemetryText}>Vpp:  {vPp.toFixed(2)}V</Text>
          <Text style={[
            styles.telemetryText, 
            { color: isHardwareDangerous && isACMode ? '#FF0000' : '#FFCC00', fontWeight: isHardwareDangerous && isACMode ? 'bold' : 'normal' }
          ]}>
            CC Hardware: {vHardwareDC.toFixed(2)}V {isACMode ? (isHardwareDangerous ? '⚠️ PELIGRO' : '(Ideal: ~1.48V)') : '(DC Directo)'}
          </Text>
        </View>

        <View style={styles.scaleBox}>
          <Text style={styles.scaleText}>CH1  {vDivVal.toFixed(2)}V</Text>
          <Text style={styles.scaleText}>M  {tDivVal}ms</Text>
        </View>
      </View>

      <View style={styles.controls}>
        {/* Restaurado a 2 columnas anchas */}
        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.sysButton} onPress={togglePause}>
            <Text style={styles.buttonText}>{isPaused ? 'RUN ▶' : 'STOP ⏸'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.sysButton, {backgroundColor: isACMode ? '#0055aa' : '#aa5500'}]} onPress={toggleCoupling}>
            <Text style={styles.buttonText}>{isACMode ? 'AC (Bipolar)' : 'DC (Unipolar)'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.knobContainer}>
          <View style={styles.knobBox}>
            <Text style={styles.knobTitle}>VOLTS / DIV</Text>
            <View style={styles.knobRow}>
              <TouchableOpacity style={styles.knobBtn} onPress={() => changeVDiv(-1)}><Text style={styles.knobSign}>-</Text></TouchableOpacity>
              <Text style={styles.knobValue}>{vDivVal}V</Text>
              <TouchableOpacity style={styles.knobBtn} onPress={() => changeVDiv(1)}><Text style={styles.knobSign}>+</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.knobBox}>
            <Text style={styles.knobTitle}>TIME / DIV</Text>
            <View style={styles.knobRow}>
              <TouchableOpacity style={styles.knobBtn} onPress={() => changeTDiv(-1)}><Text style={styles.knobSign}>-</Text></TouchableOpacity>
              <Text style={styles.knobValue}>{tDivVal}ms</Text>
              <TouchableOpacity style={styles.knobBtn} onPress={() => changeTDiv(1)}><Text style={styles.knobSign}>+</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.offsetContainer}>
          <Text style={styles.label}>Calibración {isACMode ? 'AC' : 'DC'} (Cero): {currentOffsetValue.toFixed(2)}V</Text>
          <Slider
            style={{width: '100%', height: 40}}
            minimumValue={-3.0}
            maximumValue={3.0}
            value={currentOffsetValue}
            onValueChange={updateOffset}
            minimumTrackTintColor={isACMode ? "#0088FF" : "#FF8800"} 
            maximumTrackTintColor="#ffffff"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 15, alignItems: 'center', width: '100%' },
  screenWrapper: { position: 'relative', backgroundColor: '#000000', borderWidth: 1.5, borderColor: '#333333', borderRadius: 8, overflow: 'hidden' },
  svgCanvas: { position: 'absolute', top: 0, left: 0 },
  telemetryBox: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#333' },
  telemetryText: { color: '#00FFFF', fontSize: 14, fontFamily: 'monospace', marginVertical: 2 },
  scaleBox: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: 5, borderWidth: 1, borderColor: '#333', alignItems: 'flex-end' },
  scaleText: { color: '#FFFF00', fontSize: 16, fontFamily: 'monospace', marginVertical: 2, fontWeight: 'bold' },
  controls: { width: '100%', marginTop: 15 },
  rowButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 15 },
  sysButton: { backgroundColor: '#2a2a2a', padding: 12, width: '48%', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#555' }, // Restaurado al 48% de ancho
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  knobContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  knobBox: { backgroundColor: '#1a1a1a', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#444', width: '48%', alignItems: 'center' },
  knobTitle: { color: '#aaaaaa', fontSize: 12, fontWeight: 'bold', marginBottom: 10, letterSpacing: 1 },
  knobRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
  knobBtn: { backgroundColor: '#333333', width: 35, height: 35, borderRadius: 5, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#555' },
  knobSign: { color: '#00FF00', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  knobValue: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  offsetContainer: { marginTop: 5 },
  label: { color: '#ffffff', fontSize: 14, fontWeight: '500' }
}); 