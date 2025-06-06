import React, { useState } from 'react';
import { View, Text, TextInput,TouchableOpacity,Alert,StyleSheet,ActivityIndicator,Keyboard,TouchableWithoutFeedback,ScrollView} from 'react-native';

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!name.trim() || !message.trim()) {
      Alert.alert('Please enter your name and message.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid email address.');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('http://10.0.2.2:4000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const result = await res.json();
      if (res.ok) {
        Alert.alert('Thank you!', result.message || 'Feedback submitted successfully!');
        setName('');
        setEmail('');
        setMessage('');
        Keyboard.dismiss();
      } else {
        Alert.alert('Error', result.message || 'Failed to send feedback.');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not connect to the server.');
    }
    setSending(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <Text style={styles.title}>Contact Us</Text>
          <Text style={styles.desc}>We'd love to hear your thoughts or issues.</Text>

          <TextInput
            style={styles.input}
            placeholder="Your Name *"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Your Message *"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.button, sending && { backgroundColor: '#bbb' }]}
            onPress={handleSend}
            disabled={sending}
            activeOpacity={0.8}
          >
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Feedback</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: '#F5F1E9' },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7D5A50',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'serif'
  },
  desc: {
    color: '#5A4A42',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D4C9B4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#4A3A2A',
    shadowColor: '#ccc',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  textArea: {
    height: 120,
  },
  button: {
    backgroundColor: '#A16B3E',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.4,
  },
});