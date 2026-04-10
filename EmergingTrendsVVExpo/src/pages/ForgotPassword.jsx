import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackButton from '../components/ScreenBackButton';
import { formatAuthError, sendResetForEmail } from '../services/firebaseAuth';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResetPassword() {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendResetForEmail(email);
      Alert.alert('Email sent', 'Check your inbox for password reset instructions.');
      onNavigate('login');
    } catch (error) {
      Alert.alert('Reset failed', formatAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topBack}>
        <ScreenBackButton onPress={() => onNavigate('login')} />
      </View>
      <View style={styles.container}>
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

        <TouchableOpacity
          style={styles.sendButton}
          disabled={isSubmitting}
          onPress={handleResetPassword}>
          <Text style={styles.sendButtonText}>{isSubmitting ? 'Sending...' : 'Reset Password'}</Text>
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
  topBack: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: '#e8e4da',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#e8e4da',
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
