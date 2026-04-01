import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

export default function RegisterPage({ onNavigate }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.logoSection}>
            <Image
              source={require('./VV_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Create Account</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            placeholderTextColor="#4A4A4A"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your last name"
            placeholderTextColor="#4A4A4A"
            value={lastName}
            onChangeText={setLastName}
          />

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
            placeholder="Enter password"
            placeholderTextColor="#4A4A4A"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#4A4A4A"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() =>
              Alert.alert(
                'Registration not ready',
                'Backend setup is still pending. Please use Login or Continue as Guest for now.',
              )
            }>
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomLinkWrap}
            onPress={() => onNavigate('login')}>
            <Text style={styles.bottomText}>
              Already have an account? <Text style={styles.link}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e8e4da',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 28,
    paddingVertical: 28,
    backgroundColor: '#e8e4da',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    textAlign: 'center',
    fontSize: 34,
    color: '#2E2E2E',
    marginBottom: 28,
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
  registerButton: {
    backgroundColor: '#7FAF9B',
    height: 54,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#FAF9F6',
    fontSize: 18,
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