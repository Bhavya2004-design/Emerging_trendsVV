import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenBackButton from '../components/ScreenBackButton';

export default function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topBack}>
        <ScreenBackButton onPress={() => onNavigate('splash')} />
      </View>
      <View style={styles.container}>
        <View style={styles.logoSection}>
          <Image
            source={require('./VV_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#4A4A4A"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#4A4A4A"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.forgotWrap} onPress={() => onNavigate('forgot-password')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() =>
            Alert.alert(
              'Authentication not ready',
              'Use Continue as Guest until the backend is connected.',
            )
          }>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or login with</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() =>
            Alert.alert(
              'Google Sign-In not ready',
              'Use Continue as Guest until authentication is set up.',
            )
          }>
          <Text style={styles.googleText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => onNavigate('home')}>
          <Text style={styles.demoButtonText}>Continue as Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomLinkWrap}
          onPress={() => onNavigate('register')}>
          <Text style={styles.bottomText}>
            Don’t have an account? <Text style={styles.link}>Register</Text>
          </Text>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 34,
    textAlign: 'center',
    marginBottom: 28,
    color: '#2E2E2E',
    fontFamily: 'serif',
    fontWeight: '600',
  },
  input: {
    height: 52,
    backgroundColor: '#F2EFE8',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#D8D2C4',
    color: '#2E2E2E',
    fontSize: 15,
  },
  forgotWrap: {
    alignItems: 'flex-end',
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 14,
    color: '#C2A75D',
    fontFamily: 'serif',
  },
  loginButton: {
    backgroundColor: '#7FAF9B',
    height: 54,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 34,
  },
  loginButtonText: {
    color: '#FAF9F6',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'serif',
  },
  orText: {
    textAlign: 'center',
    marginBottom: 18,
    color: '#4A4A4A',
    fontSize: 16,
    fontFamily: 'serif',
  },
  googleButton: {
    borderWidth: 1,
    borderRadius: 28,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderColor: '#D8D2C4',
    backgroundColor: '#F2EFE8',
  },
  googleText: {
    fontSize: 18,
    color: '#2E2E2E',
    fontFamily: 'serif',
  },
  demoButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  demoButtonText: {
    fontSize: 15,
    color: '#7FAF9B',
    fontWeight: '600',
    fontFamily: 'serif',
  },
  bottomLinkWrap: {
    alignItems: 'center',
  },
  bottomText: {
    textAlign: 'center',
    color: '#4A4A4A',
    fontSize: 15,
    fontFamily: 'serif',
  },
  link: {
    color: '#C2A75D',
    fontWeight: '600',
    fontFamily: 'serif',
  },
});