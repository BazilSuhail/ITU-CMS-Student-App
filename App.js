// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import DrawerNavigator from './AppNavigator';
import SignIn from './Components/Signin';
import { ThemeProvider } from './Context/ThemeContext';
import { useFirebaseAuth } from './Config/Config';

const App = () => {
  const { currentUser, loading } = useFirebaseAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (

    <ThemeProvider>
      <NavigationContainer>
        {isAuthenticated ? <DrawerNavigator /> : <SignIn />}
      </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
