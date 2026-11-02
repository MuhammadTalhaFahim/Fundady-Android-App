<<<<<<< HEAD
import React, { useState } from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
=======
import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import { borderRadius, spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import AppText from '../common/AppText';

const ContinueWatchingCard = ({
    imageUrl,
    onPress,
<<<<<<< HEAD
    onLongPress,
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    progress = 0.5,
    title = '',
    width = 160,
    height = 100
}) => {
<<<<<<< HEAD
    const [isFocused, setIsFocused] = useState(false);
    const safeProgress = Math.min(Math.max(progress, 0), 1);
    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            // D-pad focus on TV: highlight the card so the user can see what is selected
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={({ pressed }) => [styles.container, { width }, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={title}
            accessibilityHint="Resume watching this content at the saved position"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <View style={[styles.imageWrapper, { height, width }, isFocused && styles.imageWrapperFocused]}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                    resizeMode="cover"
                />
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
<<<<<<< HEAD
                    <View style={[styles.progressBar, { width: `${safeProgress * 100}%` }]} />
                </View>
            </View>
            <AppText
                variant="medium"
                size="sm"
                style={[styles.title, isFocused && styles.titleFocused]}
                numberOfLines={1}
            >
                {title}
            </AppText>
        </Pressable>
=======
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
            </View>
            <AppText variant="medium" size="sm" style={styles.title} numberOfLines={1}>
                {title}
            </AppText>
        </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        marginRight: spacing.md,
    },
<<<<<<< HEAD
    pressed: {
        opacity: 0.8,
    },
    imageWrapper: {
        borderRadius: borderRadius.sm,
        borderWidth: 2.5,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    imageWrapperFocused: {
        borderColor: colors.primary,
    },
    image: {
        width: '100%',
        height: '100%',
=======
    image: {
        borderRadius: borderRadius.sm,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
        color: colors.textPrimary,
        fontSize:12
    },
    titleFocused: {
        color: colors.white,
=======
        color: colors.textSecondary,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    },
});

export default ContinueWatchingCard;
