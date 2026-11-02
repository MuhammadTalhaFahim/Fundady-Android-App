import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from '../common/SvgIcon';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import AppText from '../common/AppText';
import { useNavigation } from '@react-navigation/native';
import { isTV } from '../../utils/responsive';

const MainHeader = ({
  onSearchPress,
  variant = 'home',
  scrollY,
  title,
  showLogo = false,
  showSearch = true,
  showBell = true,
}) => {
  const navigation = useNavigation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellFocused, setIsBellFocused] = useState(false);
  const [isBackFocused, setIsBackFocused] = useState(false);
  const [isMenuFocused, setIsMenuFocused] = useState(false);

  const backgroundColor = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: ['rgba(0,0,0,0)', colors.background],
        extrapolate: 'clamp',
      })
    : variant === 'home'
    ? 'transparent'
    : colors.background;

  const iconColor = variant === 'inner' ? colors.white : colors.textPrimary;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRightIconPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      navigation.navigate('Search');
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor },
        variant === 'inner' && styles.innerContainer,
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.leftContainer}>
        {variant === 'home' ? (
          <View style={styles.homeLeft}>
            <Pressable
              onPress={() => navigation.toggleDrawer()}
              onFocus={() => setIsMenuFocused(true)}
              onBlur={() => setIsMenuFocused(false)}
              style={[
                styles.iconButton,
                isMenuFocused && styles.buttonFocused,
                // { marginRight: spacing.xs },
              ]}
            >
              <Icon
                name="menu"
                size={iconSizes.lg}
                color={isMenuFocused ? colors.primary : iconColor}
              />
            </Pressable>
            <Image
              source={require('../../assets/images/fundady_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        ) : (
          <Pressable 
            onPress={handleBack}
            onFocus={() => setIsBackFocused(true)}
            onBlur={() => setIsBackFocused(false)}
            style={[
              styles.backButton,
              isBackFocused && styles.buttonFocused
            ]}
          >
            <Icon 
              name="arrow-back" 
              size={iconSizes.lg} 
              color={isBackFocused ? colors.primary : iconColor} 
            />
          </Pressable>
        )}
      </View>

      <View style={styles.rightContainer}>
         {showBell && (
          <Pressable
            onPress={() => navigation.navigate('Notifications')}
            onFocus={() => setIsBellFocused(true)}
            onBlur={() => setIsBellFocused(false)}
            style={[
              styles.iconButton,
              isBellFocused && styles.buttonFocused,
              { marginRight: spacing.sm }
            ]}
          >
            <View>
              <Icon
                name="notifications-none"
                size={iconSizes.lg}
                color={isBellFocused ? colors.primary : iconColor}
              />
              <View style={styles.redDot} />
            </View>
          </Pressable>
        )} 
        {showSearch && (
          <Pressable
            onPress={handleRightIconPress}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            style={[
              styles.iconButton,
              isSearchFocused && styles.buttonFocused
            ]}
          >
            <Icon
              name="search"
              size={iconSizes.lg}
              color={isSearchFocused ? colors.primary : iconColor}
            />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: isTV ? 80 : 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: isTV ? 10 : (Platform.OS === 'ios' ? 40 : StatusBar.currentHeight),
    position: isTV ? 'relative' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    },
  innerContainer: {
    position: 'relative',
    backgroundColor: colors.black,
    paddingTop: 0,
    height: 50,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  homeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 190,
    height: 60,
  },
  homeText: {
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontSize: 18,
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  redDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

export default MainHeader;
