import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LiveTvScreen from '../screens/tvon/LiveTvScreen';

const Stack = createNativeStackNavigator();

const TvOnStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="LiveTvMain" 
                component={LiveTvScreen} 
                options={{ orientation: 'landscape', animation: 'fade' }}
            />
        </Stack.Navigator>
    );
};

export default TvOnStack;
