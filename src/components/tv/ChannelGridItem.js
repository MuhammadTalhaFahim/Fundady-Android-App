<<<<<<< HEAD
import React, { useState } from 'react';
import { Pressable, View, Image, StyleSheet, Dimensions } from 'react-native';
=======
import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Dimensions } from 'react-native';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import AppText from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { CHANNELS_POSTER_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

const ChannelGridItem = ({ item, onPress }) => {
    // Landscape grid calculations
    const CARD_WIDTH = 120;
<<<<<<< HEAD
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Pressable
            style={[
                styles.container,
                isFocused && {
                    transform: [{ scale: 1.08 }]
                }
            ]}
            onPress={() => onPress(item)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
        >
            <View style={[
                styles.cardFrame,
                isFocused ? {
                    borderColor: colors.primary,
                    borderWidth: 2,
                    shadowColor: colors.primary,
                    shadowOpacity: 0.8,
                    shadowRadius: 8,
                    elevation: 12,
                } : {
                    borderColor: 'transparent',
                    borderWidth: 2,
                }
            ]}>
=======

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardFrame}>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                <View style={styles.logoWrapper}>
                    <Image
                        source={{ uri: `${CHANNELS_POSTER_BASE_URL}${item.poster}` }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </View>
            <AppText
                numberOfLines={1}
<<<<<<< HEAD
                style={[
                    styles.channelName,
                    isFocused && {
                        color: colors.primary,
                        fontWeight: 'bold',
                    }
                ]}
=======
                style={styles.channelName}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                size="xs"
                color={colors.textPrimary}
            >
                {item.name}
            </AppText>
<<<<<<< HEAD
        </Pressable>
=======
        </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    );
};

const styles = StyleSheet.create({
    container: {
        width: 120,
        margin: spacing.xs,
        alignItems: 'center',
    },
    cardFrame: {
        width: 100,
<<<<<<< HEAD
        height: 60,
        borderRadius: 15,
        padding: 2,
        // backgroundColor: '#D4AF37', // Gold border
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        // shadowColor: '#D4AF37',
        shadowColor: colors.textPrimary,
=======
        height: 90,
        borderRadius: 15,
        padding: 2,
        backgroundColor: '#D4AF37', // Gold border
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#D4AF37',
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    logoWrapper: {
<<<<<<< HEAD
        width: '100%',
        height: '100%',
=======
        width: '96%',
        height: '96%',
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        backgroundColor: '#000',
        borderRadius: 13,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    placeholderLogo: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundCard,
    },
    channelName: {
        marginTop: spacing.sm,
        textAlign: 'center',
        width: '100%',
        fontSize: 12,
        letterSpacing: 0.5,
        opacity: 0.9,
    },
});

export default ChannelGridItem;
