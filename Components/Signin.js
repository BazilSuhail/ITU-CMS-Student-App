import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { auth } from '../Config/Config'; // Adjust the path as needed 

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 

  const handleSignIn = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
       
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View className="flex-1 justify-center p-4 bg-blue-900">
      <Text className="text-3xl font-bold text-white mb-4">Sign In</Text>
      {error ? <Text className="text-red-400 mb-4">{error}</Text> : null}
      <TextInput
        className="h-12 border border-blue-700 bg-blue-800 text-white mb-4 px-3"
        placeholder="Email"
        placeholderTextColor="rgba(255, 255, 255, 0.7)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        className="h-12 border border-blue-700 bg-blue-800 text-white mb-4 px-3"
        placeholder="Password"
        placeholderTextColor="rgba(255, 255, 255, 0.7)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title="Sign In"
        onPress={handleSignIn}
        color="#1E40AF" // Tailwind blue-800 color
      />
    </View>
  );
};

export default SignIn;
