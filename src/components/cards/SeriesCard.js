import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { borderRadius } from '../../theme/spacing';
import { colors } from '../../theme/colors';

const SeriesCard = ({ imageUrl, onPress, width = 140, height = 200 }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            style={[styles.container, { width, height }]}
        >
            <Image
                source={{ uri: imageUrl }}
                style={[styles.image, { width, height }]}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.backgroundCard,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginRight: 10,
    },
    image: {
        borderRadius: borderRadius.md,
    },
});

export default SeriesCard;
