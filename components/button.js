import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import styles from './css';

const MyButton = ({ title, onPress, iconName, style }) => {
  const [iconSize, setIconSize] = useState(24);

  return (
    <TouchableOpacity
      style={[styles.bt, style]}
      onPress={onPress}
      activeOpacity={0.7}
      onLayout={(e) => {
        const { height } = e.nativeEvent.layout;
        setIconSize(height * 0.5);
      }}
    >
      <FontAwesome5
        name={iconName}
        size={iconSize}
        color="#fff"
        style={styles.icon}
      />
      {title && <Text style={styles.btText}>{title}</Text>}
    </TouchableOpacity>
  );
};

export { MyButton };
