import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

function EyeOpen({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

function EyeOff({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 1l22 22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function PasswordField({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#4A4A4A',
  maxLength,
  autoCorrect = false,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.outer}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={!visible}
        maxLength={maxLength}
        autoCorrect={autoCorrect}
        autoCapitalize="none"
        textContentType="password"
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={styles.eyeBtn}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
          <EyeOff color="#5a5248" size={22} />
        ) : (
          <EyeOpen color="#5a5248" size={22} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#F2EFE8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8D2C4',
    marginBottom: 14,
    paddingLeft: 16,
    paddingRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: '#2E2E2E',
    fontSize: 15,
    height: 52,
  },
  eyeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
