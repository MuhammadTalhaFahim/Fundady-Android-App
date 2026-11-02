import React from 'react';
import { TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import CachedImage from './CachedImage';
import { useNavigation } from '@react-navigation/native';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_WIDTH = (width - spacing.md * 2) / COLUMN_COUNT;
const ITEM_HEIGHT = ITEM_WIDTH * 1.5;


const MovieGridItem = ({ item }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => navigation.navigate('MovieDetail', { id: item.id })}
        >
            <CachedImage
                source={{ uri: `${POSTER_BASE_URL}${item.poster}` }}
                style={styles.poster}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        padding: 2,
    },
    poster: {
        flex: 1,
        borderRadius: 4,
        backgroundColor: '#333',
    },
});

export default MovieGridItem;
