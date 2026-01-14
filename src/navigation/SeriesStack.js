import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WebSeriesScreen from '../screens/series/WebSeriesScreen';
import SeriesDetailScreen from '../screens/series/SeriesDetailScreen';

const Stack = createNativeStackNavigator();

const SeriesStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SeriesMain" component={WebSeriesScreen} />
            <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
        </Stack.Navigator>
    );
};

export default SeriesStack;
