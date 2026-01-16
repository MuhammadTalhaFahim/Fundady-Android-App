import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import MainHeader from '../../components/headers/MainHeader';
import MovieGridItem from '../../components/common/MovieGridItem';

const API_URL = 'https://fundady.com/api/v1/movies';

const CinemaListScreen = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMovies();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await fetch(API_URL);
            const json = await response.json();
            if (json.status) {
                // Filter for general movies (excluding web series if possible, or just show all for now)
                setMovies(json.data);
            }
        } catch (error) {
            console.error('Error fetching movies for Cinema screen:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <MainHeader variant="inner" />

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={movies}
                    renderItem={({ item }) => <MovieGridItem item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.md,
        paddingTop: spacing.xxl + 50, // Offset for absolute header
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CinemaListScreen;

