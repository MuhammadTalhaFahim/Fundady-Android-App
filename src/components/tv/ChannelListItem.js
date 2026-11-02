import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import CachedImage from '../common/CachedImage';
import AppText from '../common/AppText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChannelListItem = ({ item, isActive, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.container, isActive && styles.activeContainer]}
            onPress={onPress}
        >
            <View style={styles.logoContainer}>
                {item.logo ? (
                    <CachedImage source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
                ) : (
                    <Icon name="live-tv" size={30} color={colors.textMuted} />
                )}
            </View>
            <View style={styles.info}>
                <AppText
                    variant={isActive ? 'bold' : 'medium'}
                    size="md"
                    color={isActive ? colors.primary : colors.textPrimary}
                >
                    {item.title}
                </AppText>
                {isActive && (
                    <AppText size="xs" color={colors.primary}>
                        Now Playing
                    </AppText>
                )}
            </View>
            {isActive && <Icon name="play-arrow" size={24} color={colors.primary} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.backgroundLight,
        marginBottom: 1,
    },
    activeContainer: {
        backgroundColor: colors.backgroundCard,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    logoContainer: {
        width: 50,
        height: 50,
        backgroundColor: colors.background,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    logo: {
        width: 40,
        height: 40,
    },
    info: {
        flex: 1,
    },
});

export default ChannelListItem;
