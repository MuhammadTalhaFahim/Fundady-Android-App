import React from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Dimensions } from 'react-native';
import AppText from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { CHANNELS_POSTER_BASE_URL } from '../../utils/constants';

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
                    <Image
                        source={{ uri: `${CHANNELS_POSTER_BASE_URL}${item.poster}` }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
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
        margin: spacing.xs,
        alignItems: 'center',
    },
    cardFrame: {
        width: 100,
        height: 90,
        borderRadius: 15,
        padding: 2,
        backgroundColor: '#D4AF37', // Gold border
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    logoWrapper: {
        width: '96%',
        height: '96%',
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
