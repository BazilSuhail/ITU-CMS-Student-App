import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CheckAttendance from './CheckAttendance';
import StudentAttendanceDetails from './StudentAttendanceDetails';
import { ThemeContext } from '../Context/ThemeContext';

const Stack = createStackNavigator();

const Attendance = () => {
    const { darkMode } = useContext(ThemeContext);
    return (
        <Stack.Navigator initialRouteName="CheckAttendance">
            <Stack.Screen
                name="CheckAttendance"
                component={CheckAttendance}
                options={{
                    title: 'View Marks',
                    headerShown: false // Hide the header for this screen
                }}
            />
            <Stack.Screen
                name="StudentAttendanceDetails"
                component={StudentAttendanceDetails}
                options={({ route }) => ({
                    title: route.params?.courseName || 'Attendance Detials', // Fallback title
                    headerStyle: {
                        backgroundColor: darkMode ? '#ced4da' : '#001433', // Custom background color for this screen
                    },
                    headerTintColor:  darkMode ? '#212529' : '#FFFFFF', // Custom text color for this screen
                })}
            />
        </Stack.Navigator>
    );
};

export default Attendance;
