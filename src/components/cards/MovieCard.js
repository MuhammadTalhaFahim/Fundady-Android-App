import React, { useState } from 'react';
import {
    Pressable,
    Image,
    StyleSheet,
    View,
    Platform,
} from 'react-native';
import { borderRadius, spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import AppText from '../common/AppText';

const isTV = Platform.isTV;

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
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Pressable
            onPress={onPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={[
                styles.container,
                { width },
                style,
                isFocused && styles.containerFocused,
            ]}>
            <View style={[styles.imageContainer, { height }]}>
                <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, { width, height }, imageStyle]}
                    resizeMode="cover"
                />
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
        borderWidth: 2,
        borderColor: colors.textPrimary,   // default — same as before
    },
    containerFocused: {
        borderColor: colors.primary,       // red on D-pad focus
        // transform: [{ scale: 1.05 }],
    },
    imageContainer: {
        backgroundColor: colors.backgroundCard,
        overflow: 'hidden',
         borderRadius: borderRadius.sm,
    },
    image: {
        width: '100%',
        height: '100%',
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