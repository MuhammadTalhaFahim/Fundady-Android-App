import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';

const MainHeader = ({ onSearchPress, onProfilePress, scrollY }) => {
  const backgroundColor = scrollY ? scrollY.interpolate({
      inputRange: [0, 50],
      outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'],
      extrapolate: 'clamp',
  }) : 'transparent';
//   const backgroundColor = scrollY
//     ? scrollY.interpolate({
//         inputRange: [0, 50],
//         outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,1)'], // fully opaque black
//         extrapolate: 'clamp',
//       })
//     : 'rgba(0,0,0,1)';

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Image
        source={require('../../assets/images/fundady_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.actions}>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <Icon name="search" size={iconSizes.lg} color={colors.textPrimary} />
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={onProfilePress} style={styles.iconButton}>
                    <Icon name="account-circle" size={iconSizes.lg} color={colors.textPrimary} />
                </TouchableOpacity> */}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  logo: {
    width: 150,
    height: 50,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: spacing.md,
  },
});

export default MainHeader;
