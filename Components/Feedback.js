import React from 'react';
import { View, Text } from 'react-native'; 

const Feedback = () => { 

  return (
      <View className="flex h-screen  bg-custom-blue p-4"> 
          <Text className="text-red-400 bg-blue-950  mt-[35px] text-lg py-2 px-4 border-2 text-center border-red-600 rounded-lg ">
              Feedback for Courses is not Opened Yet
          </Text>
            </View>
  );
};

export default Feedback;
