import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PasswordField from '../components/PasswordField';
import ScreenBackButton from '../components/ScreenBackButton';
import { formatAuthError, registerWithEmail } from '../services/firebaseAuth';
import {
  getPasswordPolicyErrors,
  INPUT_LIMITS,
  PASSWORD_REQUIREMENTS_HINT,
  validateEmailFormat,
} from '../utils/inputValidation';

export default function RegisterPage({ onNavigate, onAuthSuccess }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing details', 'Please complete all fields.');
      return;
    }

    if (firstName.trim().length > INPUT_LIMITS.name || lastName.trim().length > INPUT_LIMITS.name) {
      Alert.alert(
        'Name too long',
        `First and last name must be at most ${INPUT_LIMITS.name} characters each.`,
      );
      return;
    }

    const emailError = validateEmailFormat(email);
    if (emailError) {
      Alert.alert('Invalid email', emailError);
      return;
    }

    const passwordErrors = getPasswordPolicyErrors(password);
    if (passwordErrors.length > 0) {
      Alert.alert('Password requirements', passwordErrors.join('\n\n'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Password mismatch',
        'Password and confirm password must match exactly.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await registerWithEmail(email, password, displayName);
      Alert.alert('Account created', 'Your account has been created successfully.');
      if (onAuthSuccess) {
        onAuthSuccess();
      } else {
        onNavigate('home');
      }
    } catch (error) {
      Alert.alert('Registration failed', formatAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.topBack}>
        <ScreenBackButton onPress={() => onNavigate('login')} />
      </View>
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
            maxLength={INPUT_LIMITS.name}
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your last name"
            placeholderTextColor="#4A4A4A"
            value={lastName}
            onChangeText={setLastName}
            maxLength={INPUT_LIMITS.name}
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#4A4A4A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={INPUT_LIMITS.email}
            autoCorrect={false}
          />

          <Text style={styles.fieldHint}>{PASSWORD_REQUIREMENTS_HINT}</Text>

          <PasswordField
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            maxLength={INPUT_LIMITS.password}
          />

          <PasswordField
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            maxLength={INPUT_LIMITS.password}
          />

          <TouchableOpacity
            style={styles.registerButton}
            disabled={isSubmitting}
            onPress={handleRegister}>
            <Text style={styles.registerButtonText}>{isSubmitting ? 'Creating...' : 'Register'}</Text>
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
  topBack: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
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
  fieldHint: {
    color: '#5c534c',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'serif',
    marginBottom: 10,
    marginTop: -4,
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