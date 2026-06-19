import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';

export default function Generator({ 
  waveType, handleWaveTypeChange, 
  freq, setFreq, handleFreqComplete, 
  amp, setAmp, handleAmpComplete 
}) {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>GENERADOR DE SEÑALES</Text>
      
      <View style={styles.rowButtons}>
        <TouchableOpacity style={[styles.waveButton, waveType === 'SINE' && styles.activeWave]} onPress={() => handleWaveTypeChange('SINE')}>
          <Text style={styles.buttonText}>SENOIDAL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.waveButton, waveType === 'SQUARE' && styles.activeWave]} onPress={() => handleWaveTypeChange('SQUARE')}>
          <Text style={styles.buttonText}>CUADRADA</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderGroup}>
        <Text style={styles.label}>Frecuencia: {freq} Hz</Text>
        <Slider 
          style={{width: '100%', height: 40}} 
          minimumValue={10} 
          maximumValue={200} 
          step={1} 
          value={freq} 
          onValueChange={setFreq} 
          onSlidingComplete={handleFreqComplete} 
          minimumTrackTintColor="#0088FF" 
        />
        
        <Text style={styles.label}>Amplitud Máxima: {amp.toFixed(1)} V</Text>
        <Slider 
          style={{width: '100%', height: 40}} 
          minimumValue={0.0} 
          maximumValue={3.3} 
          step={0.1} 
          value={amp} 
          onValueChange={setAmp} 
          onSlidingComplete={handleAmpComplete} 
          minimumTrackTintColor="#0088FF" 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 20, alignItems: 'center', width: '100%' },
  title: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 30, marginTop: 10 },
  rowButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 10 },
  waveButton: { backgroundColor: '#222222', padding: 18, width: '48%', alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#444' },
  activeWave: { backgroundColor: '#0055aa', borderColor: '#0088FF' },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  sliderGroup: { width: '100%', marginTop: 10 },
  label: { color: '#ffffff', marginTop: 10, fontSize: 16, fontWeight: '500' }
});