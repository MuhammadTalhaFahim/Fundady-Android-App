import React, { useState, useEffect } from 'react';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Orientation from 'react-native-orientation-locker';
import { isTV, isTablet } from '../utils/responsive';
<<<<<<< HEAD
import DrawerNavigator from './DrawerNavigator';
=======
import TabNavigator from './TabNavigator';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import AuthNavigator from './AuthNavigator';
import SearchScreen from '../screens/home/SearchScreen';
import NotificationScreen from '../screens/home/NotificationScreen';
import MovieDetailScreen from '../screens/home/MovieDetailScreen';
import VideoPlayerScreen from '../screens/home/VideoPlayerScreen';
<<<<<<< HEAD
import SeriesDetailScreen from '../screens/series/SeriesDetailScreen';
=======
import CinemaDetailScreen from '../screens/cinema/CinemaDetailScreen';
import SeriesDetailScreen from '../screens/series/SeriesDetailScreen';
import ChannelDetailScreen from '../screens/tvon/ChannelDetailScreen';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import LiveTvPlayerScreen from '../screens/tvon/LiveTvPlayerScreen';
import SplashScreen from '../screens/splash/SplashScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const [showSplash, setShowSplash] = useState(true);
    // Mock authentication state - change this to true to see the main app
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    useEffect(() => {
        // Global Orientation Management
        if (isTV || isTablet) {
            // Tablets and TVs are always in Landscape
            Orientation.lockToLandscape();
        } else {
            // Phones default to Portrait
            Orientation.lockToPortrait();
        }
    }, []);

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <Stack.Navigator 
                    screenOptions={{ 
                        headerShown: false,
                        // Default orientation based on device
                        orientation: (isTV || isTablet) ? 'landscape' : 'portrait'
                    }}
                >
                    <Stack.Screen 
                        name="TabStack" 
<<<<<<< HEAD
                        component={DrawerNavigator} 
=======
                        component={TabNavigator} 
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                        options={({ route }) => {
                            const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
                            // Dynamic orientation for Phones
                            return {
                                orientation: (isTV || isTablet) || routeName === 'TvOn' ? 'landscape' : 'portrait',
                            };
                        }}
                    />
                    <Stack.Screen name="Search" component={SearchScreen} />
                    <Stack.Screen name="Notifications" component={NotificationScreen} />
                    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
                    <Stack.Screen 
                        name="VideoPlayer" 
                        component={VideoPlayerScreen} 
                        options={{ orientation: 'landscape', animation: 'fade' }}
                    />
<<<<<<< HEAD
                    <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
=======
                    <Stack.Screen name="CinemaDetail" component={CinemaDetailScreen} />
                    <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
                    <Stack.Screen name="ChannelDetail" component={ChannelDetailScreen} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                    <Stack.Screen 
                        name="LiveTvPlayer" 
                        component={LiveTvPlayerScreen}
                        options={{ orientation: 'landscape', animation: 'fade' }} // Force navigation-level landscape
                    />
                </Stack.Navigator>
            ) : (
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
};

export default RootNavigator;
