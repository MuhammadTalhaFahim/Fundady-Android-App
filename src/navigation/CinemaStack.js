import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CinemaListScreen from '../screens/cinema/CinemaListScreen';

const Stack = createNativeStackNavigator();

const CinemaStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CinemaMain" component={CinemaListScreen} />
        </Stack.Navigator>
    );
};

export default CinemaStack;
