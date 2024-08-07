import React from 'react'; 
import { createStackNavigator } from '@react-navigation/stack';
import ViewMarks from './ViewMarks';
import MarksOfSubject from './MarksOfSubject';

const Stack = createStackNavigator();

const Marks = () => {
    return (
        <Stack.Navigator initialRouteName="ViewMarks">
            <Stack.Screen
                name="ViewMarks"
                component={ViewMarks}
                options={{ title: 'View Marks' }}
            />
            <Stack.Screen
                name="MarksOfSubject"
                component={MarksOfSubject}
                options={{ title: 'Marks Of Subject' }}
            />
        </Stack.Navigator>
    );
};

export default Marks;
