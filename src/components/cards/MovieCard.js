import React, { useState } from 'react';
import {
    Pressable,
    Image,
    StyleSheet,
    View,
<<<<<<< HEAD
=======
    Platform,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
} from 'react-native';
import { borderRadius, spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import AppText from '../common/AppText';
<<<<<<< HEAD
import { isLatestContent } from '../../utils/helpers';
=======

const isTV = Platform.isTV;
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

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
<<<<<<< HEAD
    isLatest,
    createdAt,
    showLatestTag,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const shouldShowLatest = isLatest || showLatestTag || (createdAt && isLatestContent(createdAt));

=======
}) => {
    const [isFocused, setIsFocused] = useState(false);

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    return (
        <Pressable
            onPress={onPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
<<<<<<< HEAD
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
=======
                styles.container,
                { width },
                style,
                isFocused && styles.containerFocused,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            ]}>
            <View style={[styles.imageContainer, { height }]}>
                <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, { width, height }, imageStyle]}
                    resizeMode="cover"
                />
<<<<<<< HEAD
                {shouldShowLatest && (
                    <View style={styles.latestBadge}>
                        <AppText style={styles.latestBadgeText}>Latest</AppText>
                    </View>
                )}
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
        borderWidth: 1,
        // borderColor: colors.textPrimary, // White border always visible
        overflow: 'visible', // Must be visible so top/bottom border not clipped
=======
        borderWidth: 2,
        borderColor: colors.textPrimary,   // default — same as before
    },
    containerFocused: {
        borderColor: colors.primary,       // red on D-pad focus
        // transform: [{ scale: 1.05 }],
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    },
    imageContainer: {
        backgroundColor: colors.backgroundCard,
        overflow: 'hidden',
<<<<<<< HEAD
        borderTopLeftRadius: borderRadius.sm,
        borderTopRightRadius: borderRadius.sm,
        position: 'relative',
=======
         borderRadius: borderRadius.sm,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    },
    image: {
        width: '100%',
        height: '100%',
    },
<<<<<<< HEAD
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
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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

<<<<<<< HEAD
export default MovieCard;
=======
export default MovieCard;
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
