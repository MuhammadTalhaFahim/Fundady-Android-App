import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens & Stacks
import HomeStack from './HomeStack';
import CinemaStack from './CinemaStack';
import SeriesStack from './SeriesStack';
import TvOnStack from './TvOnStack';
import SportsStack from './SportsStack';


// Theme
import { colors } from '../theme/colors';
import { iconSizes } from '../theme/spacing';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopWidth: 0,
                    height: 60,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerShown: false,
            }}>
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="home" size={iconSizes.md} color={color} />
                    ),
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="Cinema"
                component={CinemaStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="movie" size={iconSizes.md} color={color} />
                    ),
                    tabBarLabel: 'Movies',
                }}
            />
            <Tab.Screen
                name="Series"
                component={SeriesStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="tv" size={iconSizes.md} color={color} />
                    ),
                    tabBarLabel: 'Series',
                }}
            />
             <Tab.Screen
                name="Sports"
                component={SportsStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="sports-soccer" size={iconSizes.md} color={color} />
                    ),
                    tabBarLabel: 'Sports',
                }}
            />
            <Tab.Screen
                name="TvOn"
                component={TvOnStack}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Icon name="live-tv" size={iconSizes.md} color={color} />
                    ),
                    tabBarLabel: 'TV On',
                }}
            />
             
        </Tab.Navigator>
    );
};

export default TabNavigator;
