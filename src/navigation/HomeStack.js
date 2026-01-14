import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import MovieDetailScreen from '../screens/home/MovieDetailScreen';
import NewAndPopularScreen from '../screens/home/NewAndPopularScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
            <Stack.Screen name="NewAndPopular" component={NewAndPopularScreen} />
        </Stack.Navigator>
    );
};

export default HomeStack;
