import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SportsScreen from '../screens/sports/SportsScreen';

const Stack = createNativeStackNavigator();

const SportsStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name="SportsMain" component={SportsScreen} />
        </Stack.Navigator>
    );
};

export default SportsStack;
