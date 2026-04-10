import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function ScreenBackButton({ onPress, hitSlop = 12 }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={styles.wrap}
    >
      <Text style={styles.icon}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 2,
    paddingRight: 4,
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
    color: '#5a4f46',
    lineHeight: 32,
  },
});
