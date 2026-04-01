import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');

  function handleSendReset() {
    if (!email.trim()) {
      Alert.alert('Email required', 'Please enter your email to continue.');
      return;
    }

    Alert.alert(
      'Reset Link Sent',
      'If this email exists, a password reset link will be sent shortly.',
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backWrap} onPress={() => onNavigate('login')}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email and we will send you a reset link.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#4A4A4A"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.sendButton} onPress={handleSendReset}>
          <Text style={styles.sendButtonText}>Send Reset Link</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8e4da',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#e8e4da',
  },
  backWrap: {
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#7FAF9B',
    fontSize: 15,
    fontFamily: 'serif',
    fontWeight: '600',
  },
  title: {
    fontSize: 34,
    color: '#2E2E2E',
    fontFamily: 'serif',
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    color: '#4A4A4A',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'serif',
    marginBottom: 18,
  },
  input: {
    height: 52,
    backgroundColor: '#F2EFE8',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D8D2C4',
    color: '#2E2E2E',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#7FAF9B',
    height: 54,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FAF9F6',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'serif',
  },
});
