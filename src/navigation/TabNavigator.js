import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
<<<<<<< HEAD
import { View, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/common/SvgIcon';
=======
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import Icon from '../components/common/SvgIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

// Screens & Stacks
import HomeStack from './HomeStack';
import CinemaStack from './CinemaStack';
import SeriesStack from './SeriesStack';
import TvOnStack from './TvOnStack';
import SportsStack from './SportsStack';

// Theme
import { colors } from '../theme/colors';
import { iconSizes } from '../theme/spacing';
<<<<<<< HEAD
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
=======

const Tab = createBottomTabNavigator();

const isTV = Platform.isTV;

// ─── Single Tab Item ───────────────────────────────────────────────────────────
const TabItem = ({ route, isFocused, isActive, onPress, iconName, label }) => {
  const [tvFocused, setTvFocused] = useState(false);

  const focused = isTV ? tvFocused : isActive;
  const iconColor = isActive
    ? colors.primary
    : focused
    ? colors.primary
    : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setTvFocused(true)}
      onBlur={() => setTvFocused(false)}
      hasTVPreferredFocus={isTV && isActive}
      style={[
        styles.tabItem,
        isTV && styles.tabItemTV,
        isTV && tvFocused && styles.tabItemTVFocused,
        isTV && isActive && !tvFocused && styles.tabItemTVActive,
      ]}
    >
      <Icon
        name={iconName}
        size={isTV ? iconSizes.lg : iconSizes.md}
        color={iconColor}
      />
      <Text
        style={[
          styles.label,
          isTV && styles.labelTV,
          isActive && styles.labelActive,
          isTV && tvFocused && styles.labelTVFocused,
        ]}
      >
        {label}
      </Text>

      {/* Active indicator dot — phones/tablets only */}
      {!isTV && isActive && <View style={styles.activeIndicator} />}
    </Pressable>
  );
};

// ─── Custom Tab Bar ────────────────────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'Home', icon: 'home', label: 'Home' },
    { name: 'Cinema', icon: 'movie', label: 'Movies' },
    { name: 'Series', icon: 'tv', label: 'Series' },
    { name: 'Sports', icon: 'sports-soccer', label: 'Sports' },
    { name: 'TvOn', icon: 'live-tv', label: 'TV On' },
  ];

  return (
    <View
      style={[
        styles.tabBar,
        isTV
          ? styles.tabBarTV
          : {
              height: Platform.OS === 'ios' ? 85 : 65 + insets.bottom,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
            },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = tabs.find(t => t.name === route.name);
        if (!tab) return null;

        const isActive = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            route={route}
            isFocused={false}
            isActive={isActive}
            onPress={onPress}
            iconName={tab.icon}
            label={tab.label}
          />
        );
      })}
    </View>
  );
};

// ─── Tab Navigator ─────────────────────────────────────────────────────────────
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Cinema" component={CinemaStack} />
      <Tab.Screen name="Series" component={SeriesStack} />
      <Tab.Screen name="Sports" component={SportsStack} />
      <Tab.Screen name="TvOn" component={TvOnStack} />
    </Tab.Navigator>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Tab Bar container ──
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 0,
    paddingTop: 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarTV: {
    height: 80,
    paddingHorizontal: 24,
    paddingVertical: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,20,0.95)', // thoda lighter, solid feel
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },

  // ── Tab Item ──
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  tabItemTV: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 6,
    borderRadius: 8, // Netflix ka sharp radius
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  tabItemTVFocused: {
    borderColor: colors.primary, // clean red border
    backgroundColor: 'transparent', // NO background fill — Netflix style
    transform: [{ scale: 1.06 }],
    // Shadow HATA DO completely — yahi shadow problem thi
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  tabItemTVActive: {
    borderColor: 'transparent', // active pe border nahi, sirf icon/text color
    backgroundColor: 'transparent',
  },
  // ── Labels ──
  label: {
    fontSize: 10,
    marginTop: 3,
    color: colors.textMuted,
  },
  labelTV: {
    fontSize: 14,
    marginTop: 0,
    fontWeight: '500',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  labelTVFocused: {
    color: colors.primary,
    fontWeight: '700',
  },

  // ── Active dot (phones only) ──
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
});

export default TabNavigator;
