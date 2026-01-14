import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, ImageBackground, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import AppButton from '../../components/common/AppButton';
import MovieCard from '../../components/cards/MovieCard';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const API_URL = 'https://fundady.com/api/v1/movies';
const POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';

const HomeScreen = ({ navigation }) => {
    const scrollY = useRef(new Animated.Value(0)).current;
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
                // Sort movies by latest updated_at or created_at
                const sortedMovies = json.data.sort((a, b) => {
                    const timeA = new Date(a.updated_at || a.created_at).getTime();
                    const timeB = new Date(b.updated_at || b.created_at).getTime();
                    return timeB - timeA;
                });
                setMovies(sortedMovies);
            }

        } catch (error) {
            console.error('Error fetching movies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMoviePress = (movie) => {
        navigation.navigate('MovieDetail', { movie });
    };

    const bollywoodMovies = movies.filter(m => m.categories?.includes('Hindi'));
    const hollywoodMovies = movies.filter(m => m.categories?.includes('English'));
    const webSeries = movies.filter(m => !m.categories?.includes('Hindi') && !m.categories?.includes('English'));

    const featuredMovie = movies.length > 0 ? movies[0] : null;

    const renderMovieItem = ({ item }) => (
        <MovieCard
            imageUrl={`${POSTER_BASE_URL}${item.poster}`}
            onPress={() => handleMoviePress(item)}
            style={styles.movieCard}
        />
    );

    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <MainHeader scrollY={scrollY} />
            <Animated.ScrollView
                style={styles.scrollView}
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
            >
                {/* Featured Banner */}
                {featuredMovie && (
                    <ImageBackground
                        source={{ uri: `${POSTER_BASE_URL}${featuredMovie.poster}` }}
                        style={styles.featuredBanner}
                    >
                        <View style={styles.featuredOverlay}>
                            <AppText variant="bold" size="headingXl" style={styles.featuredTitle}>{featuredMovie.title}</AppText>
                            <AppText variant="medium" size="md" style={styles.featuredTags}>
                                {featuredMovie.genre?.split(',').slice(0, 3).join(' • ')}
                            </AppText>
                            <View style={styles.buttonRow}>
                                <AppButton
                                    title="Play"
                                    style={styles.playButton}
                                    textStyle={{ color: colors.black }}
                                    onPress={() => handleMoviePress(featuredMovie)}
                                />
                                <AppButton
                                    title="My List"
                                    variant="secondary"
                                    style={styles.listButton}
                                />
                            </View>
                        </View>
                    </ImageBackground>
                )}

                <View style={styles.content}>
                    {bollywoodMovies.length > 0 && (
                        <>
                            <AppText variant="bold" size="xl" style={styles.sectionTitle}>Bollywood</AppText>
                            <FlatList
                                horizontal
                                data={bollywoodMovies}
                                renderItem={renderMovieItem}
                                keyExtractor={item => `bolly-${item.id}`}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.listContent}
                            />
                        </>
                    )}

                    {hollywoodMovies.length > 0 && (
                        <>
                            <AppText variant="bold" size="xl" style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Hollywood</AppText>
                            <FlatList
                                horizontal
                                data={hollywoodMovies}
                                renderItem={renderMovieItem}
                                keyExtractor={item => `holly-${item.id}`}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.listContent}
                            />
                        </>
                    )}

                    {webSeries.length > 0 && (
                        <>
                            <AppText variant="bold" size="xl" style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Web Series</AppText>
                            <FlatList
                                horizontal
                                data={webSeries}
                                renderItem={renderMovieItem}
                                keyExtractor={item => `web-${item.id}`}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.listContent}
                            />
                        </>
                    )}
                </View>
            </Animated.ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    featuredBanner: {
        width: width,
        height: 500,
        justifyContent: 'flex-end',
    },
    featuredOverlay: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: spacing.xl,
    },
    featuredTitle: {
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    featuredTags: {
        marginBottom: spacing.md,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: colors.white,
        width: 120,
        marginHorizontal: spacing.sm,
    },
    listButton: {
        width: 120,
        marginHorizontal: spacing.sm,
    },
    content: {
        paddingVertical: spacing.md,
    },
    sectionTitle: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
        color: colors.textPrimary,
    },
    listContent: {
        paddingHorizontal: spacing.md,
    },
    movieCard: {
        marginRight: spacing.sm,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;
