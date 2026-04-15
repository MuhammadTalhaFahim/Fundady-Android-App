import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Dimensions } from 'react-native';
import AppText from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { TV_ON_POSTER_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

const ChannelGridItem = ({ item, onPress }) => {
    // Landscape grid calculations
    const CARD_WIDTH = 120;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardFrame}>
                <View style={styles.logoWrapper}>
                    <View style={styles.placeholderLogo}>
                        <AppText size="sm" color={colors.textMuted} variant="bold">{item.name?.substring(0, 2).toUpperCase()}</AppText>
                    </View>
                </View>
            </View>
            <AppText
                numberOfLines={1}
                style={styles.channelName}
                size="xs"
                color={colors.textPrimary}
            >
                {item.name}
            </AppText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 120,
        margin: spacing.sm,
        alignItems: 'center',
    },
    cardFrame: {
        width: 100,
        height: 100,
        borderRadius: 12,
        padding: 2,
        backgroundColor: '#D4AF37', // Gold border
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        width: '96%',
        height: '96%',
        backgroundColor: '#000',
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '80%',
        height: '80%',
    },
    placeholderLogo: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundCard,
    },
    channelName: {
        marginTop: spacing.xs,
        textAlign: 'center',
        width: '100%',
    },
});

export default ChannelGridItem;
