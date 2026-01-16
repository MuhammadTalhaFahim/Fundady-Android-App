import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import MovieDetailScreen from '../screens/home/MovieDetailScreen';
import NewAndPopularScreen from '../screens/home/NewAndPopularScreen';
import SearchScreen from '../screens/home/SearchScreen';
import VideoPlayerScreen from '../screens/home/VideoPlayerScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
            <Stack.Screen name="NewAndPopular" component={NewAndPopularScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
        </Stack.Navigator>
    );
};

export default HomeStack;
