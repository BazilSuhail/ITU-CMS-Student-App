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
                options={{ title: 'Check Attendance' }}
            />
            <Stack.Screen
                name="StudentAttendanceDetails"
                component={StudentAttendanceDetails}
                options={{ title: 'Attendance Details' }}
            />
        </Stack.Navigator>
    );
};

export default Attendance;
