import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
});

export default TabNavigator;
