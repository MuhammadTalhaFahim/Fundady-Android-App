import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import AppText from '../common/AppText';
import { useNavigation } from '@react-navigation/native';

const MainHeader = ({
  onSearchPress,
  variant = 'home',
  scrollY,
  title,
  showLogo = false,
  showSearch = true,
}) => {
  const navigation = useNavigation();

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

  // const handleRightIconPress = () => {
  //   if (variant === 'inner') {
  //     console.log('Download pressed');
  //   } else {
  //     if (onSearchPress) {
  //       onSearchPress();
  //     } else {
  //       navigation.navigate('Search');
  //     }
  //   }
  // };

  
    const handleRightIconPress = () => {
        console.log('Search icon pressed');
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
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <AppText variant="medium" size="lg" style={[styles.homeText]}>
              {title || 'Home'}
            </AppText>
          </View>
        ) : (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Icon name="arrow-back" size={iconSizes.lg} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.rightContainer}>
        {showSearch && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            style={styles.iconButton}
          >
            <Icon
              // name={variant === 'inner' ? '' : 'search'}
              name="search"
              size={iconSizes.lg}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 100 : 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
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
    width: 30,
    height: 30,
  },
  homeText: {
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    fontSize: 18,
  },
  backButton: {
    padding: spacing.xs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: spacing.xs,
  },
});

export default MainHeader;
