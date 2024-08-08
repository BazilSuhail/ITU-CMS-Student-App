import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CheckAttendance from './CheckAttendance';
import StudentAttendanceDetails from './StudentAttendanceDetails';

const Stack = createStackNavigator();

const Attendance = () => {
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
                        backgroundColor: '#001433', // Custom background color for this screen
                    },
                    headerTintColor: '#FFFFFF', // Custom text color for this screen
                })}
            />
        </Stack.Navigator>
    );
};

export default Attendance;
