// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import DrawerNavigator from './AppNavigator';
import SignIn from './Components/Signin';
import 'react-native-gesture-handler';
import { ThemeProvider } from './Context/ThemeContext';
import { useFirebaseAuth } from './Config/Config';
import StartupAnimation from './Components/StartupAnimation';

const App = () => {
  const { currentUser, loading } = useFirebaseAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [currentUser]);

  if (loading || !animationComplete) {
    return (
      <StartupAnimation onAnimationEnd={() => setAnimationComplete(true)} />
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
 
