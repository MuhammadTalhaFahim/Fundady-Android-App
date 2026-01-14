import React from 'react';
import {
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import { borderRadius } from '../../theme/spacing';
import { colors } from '../../theme/colors';

const MovieCard = ({
    imageUrl,
    onPress,
    width = 110,
    height = 160,
    style,
    imageStyle,
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.container, { width, height }, style]}>
            <Image
                source={{ uri: imageUrl }}
                style={[styles.image, { width, height }, imageStyle]}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundCard,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },
    image: {
        borderRadius: borderRadius.sm,
    },
});

export default MovieCard;
