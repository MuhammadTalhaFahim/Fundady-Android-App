import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CinemaListScreen from '../screens/cinema/CinemaListScreen';
import CinemaDetailScreen from '../screens/cinema/CinemaDetailScreen';

const Stack = createNativeStackNavigator();

const CinemaStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CinemaMain" component={CinemaListScreen} />
            <Stack.Screen name="CinemaDetail" component={CinemaDetailScreen} />
        </Stack.Navigator>
    );
};

export default CinemaStack;
