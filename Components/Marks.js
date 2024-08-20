
import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ViewMarks from './ViewMarks';
import MarksOfSubject from './MarksOfSubject';
import { ThemeContext } from '../Context/ThemeContext';

const Stack = createStackNavigator();

const Marks = () => {
    const { darkMode } = useContext(ThemeContext);
    return (
        <Stack.Navigator initialRouteName="ViewMarks">
            <Stack.Screen
                name="ViewMarks"
                component={ViewMarks}
                options={{
                    title: 'View Marks',
                    headerShown: false // Hide the header for this screen
                }}
            />
            <Stack.Screen
                name="MarksOfSubject"
                component={MarksOfSubject}
                options={({ route }) => ({
                    title: route.params?.courseName || 'Marks Of Subject', // Fallback title
                    headerStyle: {
                        backgroundColor: darkMode ? '#E5E7EB' : '#001433',
                        borderBottomWidth: 1, // Adjust the width of the border
                        borderBottomColor: darkMode ? '#6B7280' : '#FFFFFF', // Adjust the color of the border
                    },
                    headerTintColor: darkMode ? '#212529' : '#FFFFFF',
                })}
            />

        </Stack.Navigator>
    );
};

export default Marks;
