import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function PageBackButton({ onPress, top = 10, left = 20 }) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={10}
      onPress={onPress}
      style={[styles.button, { top, left }]}
    >
      <Text style={styles.icon}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    zIndex: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbf7f0',
    borderWidth: 1,
    borderColor: '#e7ddd1',
  },
  icon: {
    fontSize: 22,
    lineHeight: 24,
    color: '#5a4f46',
    marginTop: -1,
  },
});
