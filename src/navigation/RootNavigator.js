import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import SearchScreen from '../screens/home/SearchScreen';
import MovieDetailScreen from '../screens/home/MovieDetailScreen';
import VideoPlayerScreen from '../screens/home/VideoPlayerScreen';
import CinemaDetailScreen from '../screens/cinema/CinemaDetailScreen';
import SeriesDetailScreen from '../screens/series/SeriesDetailScreen';
import ChannelDetailScreen from '../screens/tvon/ChannelDetailScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    // Mock authentication state - change this to true to see the main app
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="TabStack" component={TabNavigator} />
                    <Stack.Screen name="Search" component={SearchScreen} />
                    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
                    <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
                    <Stack.Screen name="CinemaDetail" component={CinemaDetailScreen} />
                    <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
                    <Stack.Screen name="ChannelDetail" component={ChannelDetailScreen} />
                </Stack.Navigator>
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};

export default RootNavigator;
