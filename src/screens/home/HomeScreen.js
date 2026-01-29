import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    ImageBackground,
    Dimensions,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import CategoryModal from '../../components/common/CategoryModal';
import MovieCard from '../../components/cards/MovieCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Modal, TouchableOpacity, ScrollView as RNScrollView } from 'react-native';

const { width } = Dimensions.get('window');
const MOVIES_API_URL = 'https://fundady.com/api/v1/movies';
const MOVIES_POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';
const GALLERY_API_URL = 'https://fundady.com/api/v1/gallery';
const GALLERY_POSTER_BASE_URL = 'https://fundady.com/FrontGallery/';
const CATEGORIES_API_URL = 'https://fundady.com/api/v1/categories';
<<<<<<< HEAD
=======
const WEB_SERIES_API_URL = 'https://fundady.com/api/tvshows/web_series';
const TV_SHOWS_POSTER_BASE_URL = 'https://fundady.com/TVShowsPoster/';
>>>>>>> 44aadc5 (phase 1 changes)

const HomeScreen = ({ navigation }) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [movies, setMovies] = useState([]);
    const [gallery, setGallery] = useState([]);
<<<<<<< HEAD
=======
    const [webSeries, setWebSeries] = useState([]);
>>>>>>> 44aadc5 (phase 1 changes)
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
<<<<<<< HEAD
            await Promise.all([fetchMovies(), fetchGallery(), fetchCategories()]);
=======
            await Promise.all([
                fetchMovies(),
                fetchGallery(),
                fetchCategories(),
                fetchWebSeries(),
            ]);
>>>>>>> 44aadc5 (phase 1 changes)
            setLoading(false);
        };
        fetchData();
    }, []);

    const fetchMovies = async () => {
        try {
            const response = await fetch(MOVIES_API_URL);
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
        }
    };

    const fetchGallery = async () => {
        try {
            const response = await fetch(GALLERY_API_URL);
            const json = await response.json();
            if (json.status) {
                setGallery(json.data);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(CATEGORIES_API_URL);
            const json = await response.json();
            if (json.status) {
                setCategories(json.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

<<<<<<< HEAD
=======
    const fetchWebSeries = async () => {
        try {
            const response = await fetch(WEB_SERIES_API_URL);
            const json = await response.json();
            if (json.status && json.data?.tvshows?.data) {
                // Sort by latest
                const sorted = json.data.tvshows.data.sort((a, b) => {
                    const timeA = new Date(a.updated_at || a.created_at).getTime();
                    const timeB = new Date(b.updated_at || b.created_at).getTime();
                    return timeB - timeA;
                });
                setWebSeries(sorted);
            }
        } catch (error) {
            console.error('Error fetching web series:', error);
        }
    };

>>>>>>> 44aadc5 (phase 1 changes)
    const handleMoviePress = movie => {
        navigation.navigate('MovieDetail', { movie });
    };

    const featuredGalleryItem = gallery.length > 0 ? gallery[0] : null;

    // Filter out the featured movie from the lists below
    // Also filter by selected category if any
    const getFilteredMovies = () => {
        let filtered = movies.filter(
            m => m.id !== featuredGalleryItem?.movie_id,
        );

        if (selectedCategory) {
            filtered = filtered.filter(m =>
                m.categories?.split(',').map(c => c.trim()).includes(selectedCategory)
            );
        }
        return filtered;
    };

    const currentFilteredMovies = getFilteredMovies();

<<<<<<< HEAD
    const bollywoodMovies = currentFilteredMovies.filter(m =>
        m.categories?.split(',').map(c => c.trim()).includes('Hindi'),
    ).slice(0, 20);
    const hollywoodMovies = currentFilteredMovies.filter(m =>
        m.categories?.split(',').map(c => c.trim()).includes('English'),
    ).slice(0, 20);
    const webSeries = currentFilteredMovies.filter(
        m => {
            const cats = m.categories?.split(',').map(c => c.trim()) || [];
            return !cats.includes('Hindi') && !cats.includes('English');
        }
    ).slice(0, 20);
=======
    const bollywoodMovies = currentFilteredMovies
        .filter(m => m.categories?.toLowerCase().includes('hindi'))
        .sort((a, b) => {
            const timeA = new Date(a.updated_at || a.created_at).getTime();
            const timeB = new Date(b.updated_at || b.created_at).getTime();
            return timeB - timeA;
        })
        .slice(0, 20);

    const hollywoodMovies = currentFilteredMovies
        .filter(m => !m.categories?.toLowerCase().includes('hindi'))
        .sort((a, b) => {
            const timeA = new Date(a.updated_at || a.created_at).getTime();
            const timeB = new Date(b.updated_at || b.created_at).getTime();
            return timeB - timeA;
        })
        .slice(0, 20);

    const latestWebSeries = webSeries.slice(0, 20);
>>>>>>> 44aadc5 (phase 1 changes)

    const renderMovieItem = ({ item }) => (
        <MovieCard
            imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
            onPress={() => handleMoviePress(item)}
            style={styles.movieCard}
        />
    );

<<<<<<< HEAD
=======
    const renderWebSeriesItem = ({ item }) => (
        <MovieCard
            imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
            onPress={() => navigation.navigate('MovieDetail', { movie: item })}
            style={styles.movieCard}
        />
    );

>>>>>>> 44aadc5 (phase 1 changes)
    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MainHeader scrollY={scrollY} variant="home" />

<<<<<<< HEAD
=======
            {/* Sticky Overlay Filter Bar - Shows only when scrolled enough */}
            <Animated.View
                style={[
                    styles.stickyFilterContainer,
                    {
                        opacity: scrollY.interpolate({
                            inputRange: [400, 450],
                            outputRange: [0, 1],
                            extrapolate: 'clamp',
                        }),
                        transform: [{
                            translateY: scrollY.interpolate({
                                inputRange: [400, 450],
                                outputRange: [-20, 0],
                                extrapolate: 'clamp',
                            })
                        }]
                    }
                ]}
                pointerEvents="box-none"
            >
                <View style={styles.filterBar}>
                    <TouchableOpacity
                        style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <AppText variant="medium" size="md" color={colors.textPrimary}>
                            {selectedCategory || 'Categories'}
                        </AppText>
                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>
            </Animated.View>

>>>>>>> 44aadc5 (phase 1 changes)
            <Animated.ScrollView
                style={styles.scrollView}
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
<<<<<<< HEAD
                contentContainerStyle={{ paddingTop: Platform.OS === 'ios' ? 100 : 90 }}
            >
                {/* Filter Bar - Now inside ScrollView */}
                <View style={styles.filterBar}>
                    {/* <TouchableOpacity style={styles.filterTab}>
                        <AppText variant="medium" size="md" color={colors.textPrimary}>Shows</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterTab}>
                        <AppText variant="medium" size="md" color={colors.textPrimary}>Movies</AppText>
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity
=======
                contentContainerStyle={{ paddingTop: 0 }}
            >
                {/* Space for the header overlaying the banner initially */}
                <View style={{ height: Platform.OS === 'ios' ? 100 : 90 }} />

                {/* Inline Filter Bar - Moves with scroll until sticky overlay takes over */}
                {/* <View style={styles.inlineFilterBar}>
                    <TouchableOpacity
>>>>>>> 44aadc5 (phase 1 changes)
                        style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <AppText variant="medium" size="md" color={colors.textPrimary}>
                            {selectedCategory || 'Categories'}
                        </AppText>
                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
<<<<<<< HEAD
                    </TouchableOpacity> */}
                </View>
=======
                    </TouchableOpacity>
                </View> */}

>>>>>>> 44aadc5 (phase 1 changes)
                {/* Featured Banner */}
                {featuredGalleryItem && (
                    <ImageBackground
                        source={{
                            uri: `${GALLERY_POSTER_BASE_URL}${featuredGalleryItem.poster}`,
                        }}
                        style={styles.featuredBanner}
                        imageStyle={styles.bannerImage}
                        resizeMode="contain"
                    >
                        <View style={styles.featuredOverlay}>
                            {/* Netflix N Logo for mobile apps often appears in top left of banner */}
                            {/* <Image
                                source={{ uri: 'https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.png' }}
                                style={styles.bannerNetflixLogo}
                            /> */}

                            <View style={styles.featuredContent}>
                                <AppText
                                    variant="bold"
                                    size="headingXl"
                                    style={styles.featuredTitle}
                                >
                                    {featuredGalleryItem.title}
                                </AppText>

                                <View style={styles.tagLine}>
                                    {featuredGalleryItem.category?.split(',').map((cat, index, array) => (
                                        <React.Fragment key={index}>
                                            <AppText variant="medium" size="sm" style={styles.featuredTags}>
                                                {cat.trim()}
                                            </AppText>
                                            {index < array.length - 1 && (
                                                <View style={styles.bullet} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.netflixPlayButton}
                                        onPress={() => {
<<<<<<< HEAD
                                            if (featuredGalleryItem.movie_url) {
                                                navigation.navigate('VideoPlayer', {
                                                    videoUrl: featuredGalleryItem.movie_url,
                                                });
=======
                                            const movie = movies.find(m => m.id === featuredGalleryItem.movie_id);
                                            if (movie) {
                                                const videoUrl = movie.links && movie.links.length > 0
                                                    ? movie.links[0].movie_link
                                                    : null;
                                                if (videoUrl) {
                                                    navigation.navigate('VideoPlayer', {
                                                        videoUrl,
                                                        movieTitle: movie.title,
                                                    });
                                                } else {
                                                    alert('Video link not available');
                                                }
>>>>>>> 44aadc5 (phase 1 changes)
                                            }
                                        }}
                                    >
                                        <Icon name="play-arrow" size={24} color={colors.white} />
                                        <AppText variant="bold" style={styles.playButtonText}>Play</AppText>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.netflixListButton}>
                                        <Icon name="add" size={24} color={colors.white} />
                                        <AppText variant="bold" style={styles.listButtonText}>My List</AppText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                )}

                <View style={styles.content}>
                    {bollywoodMovies.length > 0 && (
                        <>
                            <AppText variant="bold" size="xl" style={styles.sectionTitle}>
                                Bollywood
                            </AppText>
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
                            <AppText
                                variant="bold"
                                size="xl"
                                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
                            >
                                Hollywood
                            </AppText>
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

<<<<<<< HEAD
                    {webSeries.length > 0 && (
=======
                    {latestWebSeries.length > 0 && (
>>>>>>> 44aadc5 (phase 1 changes)
                        <>
                            <AppText
                                variant="bold"
                                size="xl"
                                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
                            >
                                Web Series
                            </AppText>
                            <FlatList
                                horizontal
<<<<<<< HEAD
                                data={webSeries}
                                renderItem={renderMovieItem}
=======
                                data={latestWebSeries}
                                renderItem={renderWebSeriesItem}
>>>>>>> 44aadc5 (phase 1 changes)
                                keyExtractor={item => `web-${item.id}`}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.listContent}
                            />
                        </>
                    )}
                </View>
            </Animated.ScrollView>

            <CategoryModal
                isVisible={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
        </View>
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
        width: width - spacing.md * 2,
        height: 500,
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        justifyContent: 'flex-end',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.black,
    },
    bannerImage: {
        borderRadius: 12,
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
<<<<<<< HEAD
    filterBar: {
=======
    stickyFilterContainer: {
        paddingTop: Platform.OS === 'ios' ? 100 : 90,
        backgroundColor: colors.background,
        zIndex: 10,
        paddingHorizontal: spacing.md,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    inlineFilterBar: {
>>>>>>> 44aadc5 (phase 1 changes)
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.md,
    },
<<<<<<< HEAD
=======
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
>>>>>>> 44aadc5 (phase 1 changes)
    filterTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        marginHorizontal: spacing.xs,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    featuredContent: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    bannerNetflixLogo: {
        width: 25,
        height: 40,
        position: 'absolute',
        top: 20,
        left: 20,
        resizeMode: 'contain',
    },
    tagLine: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: spacing.lg,
    },
    bullet: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.textSecondary,
        marginHorizontal: spacing.sm,
        opacity: 0.6,
    },
    netflixPlayButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        borderRadius: 4,
        marginHorizontal: spacing.sm,
        flex: 1,
        maxWidth: 150,
    },
    playButtonText: {
        color: colors.white,
        marginLeft: spacing.xs,
        fontSize: 16,
    },
    netflixListButton: {
        backgroundColor: 'rgba(51, 51, 51, 0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xl,
        borderRadius: 4,
        marginHorizontal: spacing.sm,
        flex: 1,
        maxWidth: 150,
    },
    listButtonText: {
        color: colors.white,
        marginLeft: spacing.xs,
        fontSize: 16,
    },
    activeFilterTab: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
});

export default HomeScreen;
