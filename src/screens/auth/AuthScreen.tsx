import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../styles/theme';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../hooks/useAuth';

const { width, height } = Dimensions.get('window');

type AuthStackParamList = {
  Auth: undefined;
  Home: undefined;
};

type AuthScreenProps = NativeStackScreenProps<AuthStackParamList, 'Auth'>;

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => {
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    isLoading, 
    error 
  } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (!displayName) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
      const result = await signUp(email, password, displayName);
      if (!result.success) {
        Alert.alert('Error', result.error);
      }
    } else {
      const result = await signIn(email, password);
      if (!result.success) {
        Alert.alert('Error', result.error);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />
      
      {/* Grid Overlay */}
      <View style={styles.gridOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>EduTube</Text>
                <Text style={styles.subtitle}>
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </Text>
              </View>

              {/* Auth Form */}
              <GlassCard style={styles.formCard}>
                <View style={styles.form}>
                  {isSignUp && (
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons 
                        name="account" 
                        size={20} 
                        color={theme.colors.blue[300]} 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor={theme.colors.slate[400]}
                        value={displayName}
                        onChangeText={setDisplayName}
                        autoCapitalize="words"
                      />
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons 
                      name="email" 
                      size={20} 
                      color={theme.colors.blue[300]} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor={theme.colors.slate[400]}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons 
                      name="lock" 
                      size={20} 
                      color={theme.colors.blue[300]} 
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={theme.colors.slate[400]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialCommunityIcons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color={theme.colors.slate[400]} 
                      />
                    </TouchableOpacity>
                  </View>

                  {isSignUp && (
                    <View style={styles.inputContainer}>
                      <MaterialCommunityIcons 
                        name="lock-check" 
                        size={20} 
                        color={theme.colors.blue[300]} 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        placeholderTextColor={theme.colors.slate[400]}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={styles.eyeIcon}
                      >
                        <MaterialCommunityIcons 
                          name={showConfirmPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color={theme.colors.slate[400]} 
                        />
                      </TouchableOpacity>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    <LinearGradient
                      colors={[theme.colors.blue[600], theme.colors.blue[700]]}
                      style={styles.submitButtonGradient}
                    >
                      {isLoading ? (
                        <MaterialCommunityIcons 
                          name="loading" 
                          size={20} 
                          color="white" 
                          style={styles.loadingIcon}
                        />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          {isSignUp ? 'Create Account' : 'Sign In'}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Google Sign-In Button */}
                  <TouchableOpacity
                    style={[styles.googleButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <View style={styles.googleButtonContent}>
                      <MaterialCommunityIcons 
                        name="google" 
                        size={20} 
                        color="#4285F4" 
                      />
                      <Text style={styles.googleButtonText}>
                        Continue with Google
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.switchContainer}>
                    <Text style={styles.switchText}>
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </Text>
                    <TouchableOpacity onPress={toggleMode}>
                      <Text style={styles.switchLink}>
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.blue[200],
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
  },
  form: {
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingIcon: {
    // Add rotation animation here if needed
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: theme.colors.slate[300],
    marginRight: 4,
  },
  switchLink: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.blue[400],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: 14,
    color: theme.colors.slate[400],
    marginHorizontal: 16,
  },
  googleButton: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
