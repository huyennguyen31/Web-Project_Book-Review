import React, { useRef, useEffect } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,Image,Animated,ImageBackground} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function WelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
 
  const logoMove = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([ 
      Animated.timing(titleOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoMove, { toValue: -15, duration: 1500, useNativeDriver: true }),
        Animated.timing(logoMove, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])).start();
  }, []);

  return (
    <ImageBackground
      source={require('../assets/ppbg.png')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.container}>
         <Animated.Image
            source={require('../assets/logo3.png')}
            style={[styles.logo, { transform: [{ translateY: logoMove }] }]}
            resizeMode="contain"
        />
 
        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
          Bookify
        </Animated.Text>
 
        <Animated.View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
 
        <Animated.View style={[styles.footer]}>
          <Text style={styles.footerText}>© 2025 Bookify Team. All rights reserved.</Text>
          <Text style={styles.footerText}>Developed by Group 7 </Text>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(239, 231, 218, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
  },
  title: {
    fontSize: 50,
    fontWeight: '700',
    color: '#7D5A50',
    fontFamily: 'serif',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#BF9B7D',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonText: {
    color: '#7D5A50',
    fontSize: 22,
    fontWeight:'500',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#7D5A50',
    fontFamily: 'serif',
  },
});