import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/common/SvgIcon';

// Screens & Stacks
import HomeStack from './HomeStack';
import CinemaStack from './CinemaStack';
import SeriesStack from './SeriesStack';
import TvOnStack from './TvOnStack';
import SportsStack from './SportsStack';

// Theme
import { colors } from '../theme/colors';
import { iconSizes } from '../theme/spacing';
import { isTV } from '../utils/responsive';

const Tab = createBottomTabNavigator();

const TabItem = ({ label, isFocused, onPress, onLongPress, options }) => {
    const [isDpadFocused, setIsDpadFocused] = useState(false);

    const isActive = isFocused || isDpadFocused;
    const textColor = isActive ? colors.primary : colors.textMuted;

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            onFocus={() => setIsDpadFocused(true)}
            onBlur={() => setIsDpadFocused(false)}
            style={[
                styles.tabItem,
                isDpadFocused && styles.tabItemFocused,
                isFocused && isTV && styles.tabItemActiveTV,
            ]}
        >
            {options.tabBarIcon && options.tabBarIcon({
                color: textColor
            })}
            <Text
                style={{
                    fontSize: 12,
                    marginTop: 4,
                    color: textColor,
                    fontWeight: isActive ? 'bold' : 'normal',
                }}
            >
                {label}
            </Text>
        </Pressable>
    );
};

const CustomTabBar = ({ state, descriptors, navigation, insets }) => {
    return (
        <View style={[
            styles.tabBarContainer,
            {
                height: Platform.OS === 'ios' ? 85 : 65 + insets.bottom,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
            }
        ]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                        ? options.title
                        : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TabItem
                        key={route.key}
                        label={label}
                        isFocused={isFocused}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        options={options}
                    />
                );
            })}
        </View>
    );
};

const TabNavigator = () => {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} insets={insets} />}
            screenOptions={{
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

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderTopWidth: 0,
        paddingTop: 10,
        elevation: 0,
        shadowOpacity: 0,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        borderRadius: 8,
        marginHorizontal: 4,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tabItemFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        transform: [{ scale: 1.03 }],
        shadowColor: colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 6,
    },
    // Active tab on TV: always show red border ring (no border on phone/tablet)
    tabItemActiveTV: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(229, 9, 20, 0.05)',
    },
});

export default TabNavigator;
