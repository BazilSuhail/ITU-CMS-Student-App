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
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="StudentAttendanceDetails"
                component={StudentAttendanceDetails}
                options={({ route }) => ({
                    title: route.params?.courseName || 'Attendance Details', 
                    headerStyle: {
                        backgroundColor: darkMode ? '#E5E7EB' : '#001433',
                        borderBottomWidth: 1, 
                        borderBottomColor: darkMode ? '#6B7280' : '#FFFFFF', 
                    },
                    headerTintColor: darkMode ? '#212529' : '#FFFFFF',
                })}
            />
        </Stack.Navigator>
    );
};

export default Attendance;
