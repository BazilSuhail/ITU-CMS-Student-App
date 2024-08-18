import React, { useContext } from 'react';
import { ThemeContext } from '../Context/ThemeContext';
import { View, Text } from 'react-native';

const Feedback = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <View className={`flex h-screen p-4 ${darkMode ? 'bg-white' : 'bg-custom-blue'}`}>
      <Text className={`mt-[35px] text-lg py-2 px-4 border-2 text-center  rounded-lg ${darkMode ? 'text-red-600  font-medium bg-red-100 border-red-700' : 'text-red-100 bg-red-700  border-red-200'}`}>
        Feedback for Courses is {darkMode ? 'Opened Now' : 'not Opened Yet'}
      </Text>
    </View>

  );
};

export default Feedback;
