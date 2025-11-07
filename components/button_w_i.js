import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import styles from './css';

const ButtonWI = ({ title, onPress, style }) => (
  <TouchableOpacity style={[styles.btn, style]} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.btText}>{title}</Text>
  </TouchableOpacity>
);

export { ButtonWI };
