import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import Icon from '../common/SvgIcon';
import AppText from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import { VERSION_CONFIG } from '../../config/versionConfig';
import { isTV } from '../../utils/responsive';

const DrawerMenuItem = ({ iconName, label, isActive, onPress }) => {
  const [isDpadFocused, setIsDpadFocused] = useState(false);

  const activeOrFocused = isActive || isDpadFocused;
  const iconColor = activeOrFocused ? colors.primary : colors.textPrimary;
  const textColor = activeOrFocused ? colors.white : colors.textPrimary;

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setIsDpadFocused(true)}
      onBlur={() => setIsDpadFocused(false)}
      style={[
        styles.menuItem,
        isActive && styles.menuItemActive,
        isDpadFocused && styles.menuItemFocused,
      ]}
    >
      <View style={styles.menuIconContainer}>
        <Icon name={iconName} size={22} color={iconColor} />
      </View>
      <AppText
        style={[
          styles.menuLabel,
          { color: textColor, fontWeight: isActive ? 'bold' : '500' },
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

const CustomDrawerContent = props => {
  const { state, navigation } = props;

  // Determine current active route
  const currentRouteName = state ? state.routes[state.index]?.name : 'MainTabs';

  const handleCloseDrawer = () => {
    navigation.closeDrawer();
  };

  const handleNavigateHome = () => {
    navigation.navigate('MainTabs');
    navigation.closeDrawer();
  };

  const handleNavigatePrivacy = () => {
    navigation.navigate('PrivacyPolicy');
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* YouTube-Style Header */}
      <View style={styles.drawerHeader}>
        <Image
          source={require('../../assets/images/fundady_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.divider} />

      {/* Main Menu Scroll View */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.menuSection}>
          <DrawerMenuItem
            iconName="lock"
            label="Privacy Policy"
            isActive={currentRouteName === 'PrivacyPolicy'}
            onPress={handleNavigatePrivacy}
          />
        </View>

        <View style={styles.divider} />
      </ScrollView>

      {/* Bottom Footer Info */}
      <View style={styles.footerContainer}>
        <AppText style={styles.versionText}>
          Fundady v{VERSION_CONFIG.currentVersionName || '1.0.0'}
        </AppText>
        <AppText style={styles.copyrightText}>
          © 2026 Fundady. All rights reserved.
        </AppText>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.background || '#0D0F12',
    paddingTop: isTV ? 0 : 50
  },
  drawerHeader: {
    height: Platform.OS === 'ios' ? 70 : 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
  },
  headerIconButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: 20,
  },
  logo: {
    width: 190,
    height: 60,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: spacing.xs,
  },
  scrollContent: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  menuSection: {
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginVertical: 2,
  },
  menuItemActive: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)', // Red tint for active item
  },
  menuItemFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  menuIconContainer: {
    marginRight: spacing.md,
    width: 24,
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  footerContainer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
     paddingBottom: isTV ? spacing.md : spacing.xxl
  },
  versionText: {
    fontSize: 12,
    color: colors.textMuted || '#888',
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.35)',
    marginTop: 2,
  },
});

export default CustomDrawerContent;
