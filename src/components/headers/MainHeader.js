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
}) => {
  const navigation = useNavigation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [backFocused, setBackFocused] = useState(false);

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

  const handleBack = () => navigation.goBack();

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
        // TV pe position relative — spatial engine confuse nahi hoga
        isTV && styles.containerTV,
        isTV && variant === 'inner' && styles.innerContainerTV,
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
            <Image
              source={require('../../assets/images/fundady_logo.png')}
              style={[styles.logo, isTV && styles.logoTV]}
              resizeMode="contain"
            />
          </View>
        ) : (
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
          </Pressable>
        )}
      </View>

      <View style={styles.rightContainer}>
        {showSearch && (
          <Pressable
            onPress={handleRightIconPress}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={[
              styles.iconButton,
              searchFocused && styles.iconButtonFocused,
            ]}
          >
            <Icon
              name="search"
              size={isTV ? iconSizes.xl : iconSizes.lg}
              color={searchFocused ? colors.primary : iconColor}
            />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 100 : 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    position: 'absolute',   // phone/tablet pe pehle jaisa
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
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
  innerContainer: {
    position: 'relative',
    backgroundColor: colors.black,
    paddingTop: 0,
    height: 50,
  },
  innerContainerTV: {
    height: 60,
    paddingTop: 0,
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
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: spacing.xs,
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