import React, { useState } from 'react';
import { Image, View, Text, TextInput,Pressable,StyleSheet,Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register } from '../api/api';

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await login(username, password);
      if (res.token) {
        await AsyncStorage.setItem('token', res.token);
        if (res.userId) {
          await AsyncStorage.setItem('userId', res.userId.toString());
        }
        navigation.replace('Home');
        Alert.alert('Success', 'Login successful!');
      } else {
        Alert.alert('Error', 'Incorrect username or password.');
      }
    } catch (err) {
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  const handleRegister = async () => {
    try {
      const res = await register(username, email, password);
      if (res.message) {
        Alert.alert('Success', 'Registration successful! Please log in.');
        setIsRegistering(false);
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Alert.alert('Invalid email.');
        return;
      }
    } catch (err) {
      Alert.alert('Error', 'Registration failed. Please try again.');
   }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>{isRegistering ? 'Create Your Account ' : 'Welcome Back, Friend!'}</Text>
      <TextInput
        placeholder="Username"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      {isRegistering && (
        <TextInput
          placeholder="Email"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      )}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable style={styles.button} onPress={isRegistering ? handleRegister : handleLogin}>
        <Text style={styles.buttonText}>{isRegistering ? 'Register' : 'Sign in'}</Text>
      </Pressable>

      <Pressable onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>
          {isRegistering ? 'Already have an account ? Sign in' : 'Don\'t have an account? Sign up'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F5F4F1',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#7B4F3D',
    marginBottom: 30,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#EFE7DA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333'
  },
  button: {
    backgroundColor: '#B7AC9C',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  switchText: {
    color: '#7B4F3D',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline'
  }
});