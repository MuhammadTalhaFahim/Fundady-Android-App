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
<<<<<<< HEAD
  showBell = true,
}) => {
  const navigation = useNavigation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isBellFocused, setIsBellFocused] = useState(false);
  const [isBackFocused, setIsBackFocused] = useState(false);
  const [isMenuFocused, setIsMenuFocused] = useState(false);
=======
}) => {
  const navigation = useNavigation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [backFocused, setBackFocused] = useState(false);
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

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

<<<<<<< HEAD
  const handleBack = () => {
    navigation.goBack();
  };
=======
  const handleBack = () => navigation.goBack();
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

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
<<<<<<< HEAD
=======
        // TV pe position relative — spatial engine confuse nahi hoga
        isTV && styles.containerTV,
        isTV && variant === 'inner' && styles.innerContainerTV,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
<<<<<<< HEAD
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
=======

      <View style={styles.leftContainer}>
        {variant === 'home' ? (
          <View style={styles.homeLeft}>
            <Image
              source={require('../../assets/images/fundady_logo.png')}
              style={[styles.logo, isTV && styles.logoTV]}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              resizeMode="contain"
            />
          </View>
        ) : (
<<<<<<< HEAD
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
=======
          <Pressable
            onPress={handleBack}
            onFocus={() => setBackFocused(true)}
            onBlur={() => setBackFocused(false)}
            style={[
              styles.backButton,
              backFocused && styles.iconButtonFocused,
            ]}
          >
            <Icon name="arrow-back" size={iconSizes.lg} color={backFocused ? colors.primary : iconColor} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
          </Pressable>
        )}
      </View>

      <View style={styles.rightContainer}>
<<<<<<< HEAD
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
=======
        {showSearch && (
          <Pressable
            onPress={handleRightIconPress}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={[
              styles.iconButton,
              searchFocused && styles.iconButtonFocused,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            ]}
          >
            <Icon
              name="search"
<<<<<<< HEAD
              size={iconSizes.lg}
              color={isSearchFocused ? colors.primary : iconColor}
=======
              size={isTV ? iconSizes.xl : iconSizes.lg}
              color={searchFocused ? colors.primary : iconColor}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
<<<<<<< HEAD
    height: isTV ? 80 : 100,
=======
    height: Platform.OS === 'ios' ? 100 : 100,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
<<<<<<< HEAD
    paddingTop: isTV ? 10 : (Platform.OS === 'ios' ? 40 : StatusBar.currentHeight),
    position: isTV ? 'relative' : 'absolute',
=======
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    position: 'absolute',   // phone/tablet pe pehle jaisa
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
<<<<<<< HEAD
    },
=======
  },
  // TV pe relative — gallery banner overlap nahi karega
  containerTV: {
    position: 'relative',
    top: undefined,
    left: undefined,
    right: undefined,
    zIndex: 1,
    paddingTop: spacing.sm,
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  innerContainer: {
    position: 'relative',
    backgroundColor: colors.black,
    paddingTop: 0,
    height: 50,
  },
<<<<<<< HEAD
=======
  innerContainerTV: {
    height: 60,
    paddingTop: 0,
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
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
=======
  logoTV: {
    width: 160,
    height: 50,
  },
  backButton: {
    padding: spacing.xs,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: spacing.xs,
<<<<<<< HEAD
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
=======
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  // D-pad focus — translucent bg + red border
  iconButtonFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
});

export default MainHeader;
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
