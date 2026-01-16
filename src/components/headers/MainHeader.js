import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import AppText from '../common/AppText';
import { useNavigation } from '@react-navigation/native';

const MainHeader = ({ onSearchPress, variant = 'home', scrollY }) => {
    const navigation = useNavigation();

    const backgroundColor = scrollY ? scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
        extrapolate: 'clamp',
    }) : (variant === 'home' ? 'transparent' : 'rgba(0,0,0,0.8)');

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSearchPress = () => {
        if (onSearchPress) {
            onSearchPress();
        } else {
            navigation.navigate('Search');
        }
    };

    return (
        <Animated.View style={[styles.container, { backgroundColor }]}>
            <View style={styles.leftContainer}>
                {variant === 'home' ? (
                    <View style={styles.homeLeft}>
                        <Image
                           source={require('../../assets/images/1.jpg')}
                            //  source={require('../../assets/images/fundady_logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <AppText variant="medium" size="lg" style={styles.homeText}>Home</AppText>
                    </View>
                ) : (
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Icon name="arrow-back" size={iconSizes.lg} color={colors.textPrimary} />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.rightContainer}>
                <TouchableOpacity onPress={handleSearchPress} style={styles.iconButton}>
                    <Icon name="search" size={iconSizes.lg} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: Platform.OS === 'ios' ? 100 : 70,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: Platform.OS === 'ios' ? 40 : 10,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
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
        width: 60,
        height: 60,
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
