import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WebSeriesScreen from '../screens/series/WebSeriesScreen';

const Stack = createNativeStackNavigator();

const SeriesStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SeriesMain" component={WebSeriesScreen} />
        </Stack.Navigator>
    );
};

export default SeriesStack;
