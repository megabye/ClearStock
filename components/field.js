import React, { useEffect, useState } from 'react';
import { Text, TextInput, Animated } from 'react-native';
import styles from '../components/css'; // Presumo que seu CSS esteja aqui

const AnimatedTextField = ({ 
  label, 
  error, 
  keyboardType, 
  value, 
  onChangeText, 
  onBlur 
}) => {
  
  
  const shakeAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      <Text style={styles.label}>{label}</Text> 
      <TextInput
        style={[
          styles.input, 
          error ? { borderColor: '#e74c3c' } : { borderColor: '#ccc' },
        ]}
        
        
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur} 
        
        keyboardType={keyboardType}
        placeholderTextColor="#aaa"
      />
      {error && (
        <Text style={{ color: '#e74c3c', marginTop: 4, fontSize: 13 }}>
          {error.message}
        </Text>
      )}
    </Animated.View>
  );
};

export { AnimatedTextField };