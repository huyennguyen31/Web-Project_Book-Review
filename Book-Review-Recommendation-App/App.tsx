import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookDetailScreen from './src/screens/BookDetailScreen';
import ContactScreen from './src/screens/ContactScreen';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" 
        screenOptions={{ headerShown: true, headerStyle:{ backgroundColor: '#EFE7DA'}, headerTintColor: '#7D5A50' ,headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          fontFamily: 'serif',
        }  }}>
        <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{ headerShown: false }} 
        />
        <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }} 
        />
        <Stack.Screen name="Home" component={HomeScreen}
          options={({ navigation }) => ({
            headerRight: () => (
              <TouchableOpacity
              onPress={() => navigation.navigate('Contact')}
              style={{
                marginRight: 10,
                borderRadius: 20,
                backgroundColor: '#A67C52',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: 95,
                minHeight: 35,
              }}
              activeOpacity={0.7}  >
          <Text style={{ color: '#fff', fontWeight: '800', fontFamily: 'serif' }}>
           📞 Contact
          </Text> 
          
        </TouchableOpacity>
            ) })}
        />
        <Stack.Screen name="BookDetail" component={BookDetailScreen}
          options={({ navigation }) => ({
            title: 'Detail',
            headerRight: () => (
              <TouchableOpacity
              onPress={() => navigation.navigate('Contact')}
              style={{
                marginRight: 10,
                borderRadius: 20,
                backgroundColor: '#A67C52',
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: 95,
                minHeight: 35,
              }}
              activeOpacity={0.7}  >
          <Text style={{ color: '#fff', fontWeight: '800', fontFamily: 'serif' }}>
           📞 Contact
          </Text> 
          
        </TouchableOpacity>
            )})}
           />
        <Stack.Screen name="Contact" component={ContactScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}