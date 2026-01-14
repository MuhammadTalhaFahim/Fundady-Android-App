import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { borderRadius, spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import AppText from '../common/AppText';

const ContinueWatchingCard = ({
    imageUrl,
    onPress,
    progress = 0.5,
    title = '',
    width = 160,
    height = 100
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.container, { width }]}
        >
            <View style={{ height, width }}>
                <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, { height, width }]}
                    resizeMode="cover"
                />
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
            </View>
            <AppText variant="medium" size="sm" style={styles.title} numberOfLines={1}>
                {title}
            </AppText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        marginRight: spacing.md,
    },
    image: {
        borderRadius: borderRadius.sm,
    },
    progressBarContainer: {
        height: 3,
        backgroundColor: colors.textMuted,
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
    },
    title: {
        marginTop: spacing.xs,
        color: colors.textSecondary,
    },
});

export default ContinueWatchingCard;
