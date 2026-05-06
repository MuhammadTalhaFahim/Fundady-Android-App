import React from 'react';
import {
    TouchableOpacity,
    Image,
    StyleSheet,
    View,
} from 'react-native';
import { borderRadius, spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import AppText from '../common/AppText';

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
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.container, { width }, style]}>
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
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundCard,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.primary,
        overflow: 'hidden',
    },
    imageContainer: {
        backgroundColor: colors.backgroundCard,
        overflow: 'hidden',
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
