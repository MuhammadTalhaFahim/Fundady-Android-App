import React, { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import CachedImage from '../common/CachedImage';
import { borderRadius, spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import AppText from '../common/AppText';
import { isLatestContent } from '../../utils/helpers';

const MovieCard = ({
    imageUrl,
    onPress,
    width = 110,
    height = 160,
    style,
    imageStyle,
    title,
    subtitle,
    subtitleColor = colors.primary,
    isLatest,
    createdAt,
    showLatestTag,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const shouldShowLatest = isLatest || showLatestTag || (createdAt && isLatestContent(createdAt));

    return (
        <Pressable
            onPress={onPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
                styles.container, 
                { width }, 
                style,
                isFocused && {
                    borderColor: colors.primary,
                    borderWidth: 2.5,
                    // transform: [{ scale: 1.06 }],
                    shadowColor: colors.primary,
                    shadowOpacity: 0.5,
                    shadowRadius: 8,
                    elevation: 10,
                }
            ]}>
            <View style={[styles.imageContainer, { height }]}>
                <CachedImage
                    source={{ uri: imageUrl }}
                    style={[styles.image, { width, height }, imageStyle]}
                    resizeMode="cover"
                />
                {shouldShowLatest && (
                    <View style={styles.latestBadge}>
                        <AppText style={styles.latestBadgeText}>Latest</AppText>
                    </View>
                )}
            </View>
            {(title || subtitle) && (
                <View style={styles.textContainer}>
                    {subtitle && (
                        <AppText
                            variant="medium"
                            size="xs"
                            color={subtitleColor}
                            numberOfLines={1}
                        >
                            {subtitle}
                        </AppText>
                    )}
                    {title && (
                        <AppText
                            variant="bold"
                            size="sm"
                            color={colors.textPrimary}
                            numberOfLines={1}
                            style={styles.title}
                        >
                            {title}
                        </AppText>
                    )}
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundCard,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        // borderColor: colors.textPrimary, // White border always visible
        overflow: 'visible', // Must be visible so top/bottom border not clipped
    },
    imageContainer: {
        backgroundColor: colors.backgroundCard,
        overflow: 'hidden',
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    latestBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.primary || '#E50914',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderTopRightRadius: borderRadius.sm,
        borderBottomLeftRadius: 6,
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
    },
    latestBadgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    textContainer: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.black,
    },
    title: {
        marginTop: 2,
        textTransform: 'uppercase',
    },
});

export default MovieCard;
