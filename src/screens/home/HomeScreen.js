import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    ImageBackground,
    Dimensions,
    FlatList,
    ActivityIndicator,
    Platform,
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

import { movieService } from '../../services/movieService';

const MOVIES_POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';
const GALLERY_POSTER_BASE_URL = 'https://fundady.com/FrontGallery/';
const TV_SHOWS_POSTER_BASE_URL = 'https://fundady.com/TvShowPoster/';


const HomeScreen = ({ navigation }) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [movies, setMovies] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [webSeries, setWebSeries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([
                fetchMovies(),
                fetchGallery(),
                fetchCategories(),
                fetchWebSeries(),
            ]);
            setLoading(false);
        };
        fetchData();
    }, []);

    const fetchMovies = async () => {
        try {
            const json = await movieService.getMovies();
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
            const json = await movieService.getGallery();
            if (json.status) {
                setGallery(json.data);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const json = await movieService.getCategories();
            if (json.status) {
                setCategories(json.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchWebSeries = async () => {
        try {
            const json = await movieService.getWebSeries();
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

    const handleMoviePress = movie => {
        navigation.navigate('MovieDetail', { id: movie.id });
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

    const renderMovieItem = ({ item }) => (
        <MovieCard
            imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
            onPress={() => handleMoviePress(item)}
            style={styles.movieCard}
        />
    );

    const renderWebSeriesItem = ({ item }) => (
        <MovieCard
            imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
            onPress={() => navigation.navigate('SeriesDetail', { id: item.id, contentType: 'web_series' })}
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
        <View style={styles.container}>
            <MainHeader scrollY={scrollY} variant="home" />

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
                {/* <View style={styles.filterBar}>
                    <TouchableOpacity
                        style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <AppText variant="medium" size="md" color={colors.textPrimary}>
                            {selectedCategory || 'Categories'}
                        </AppText>
                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View> */}
            </Animated.View>

            <Animated.ScrollView
                style={styles.scrollView}
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: 0 }}
            >
                {/* Space for the header overlaying the banner initially */}
                <View style={{ height: Platform.OS === 'ios' ? 100 : 90 }} />

                {/* Inline Filter Bar - Moves with scroll until sticky overlay takes over */}
                {/* <View style={styles.inlineFilterBar}>
                    <TouchableOpacity
                        style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <AppText variant="medium" size="md" color={colors.textPrimary}>
                            {selectedCategory || 'Categories'}
                        </AppText>
                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View> */}

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

                            <TouchableOpacity
                                style={styles.featuredContent}
                                activeOpacity={0.9}
                                onPress={() => {
                                    const category = featuredGalleryItem.category || '';
                                    const isSeries = category.toLowerCase().includes('series') ||
                                        category.toLowerCase().includes('show') ||
                                        category.toLowerCase().includes('serial');

                                    navigation.navigate(isSeries ? 'SeriesDetail' : 'MovieDetail', {
                                        id: featuredGalleryItem.movie_id,
                                        contentType: isSeries ? (category.toLowerCase().includes('serial') ? 'tv_serial' : (category.toLowerCase().includes('show') ? 'tv_show' : 'web_series')) : undefined
                                    });
                                }}
                            >
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
                                                <View style={styles.tagDot} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </View>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.netflixPlayButton}
                                        onPress={async () => {
                                            setIsActionLoading(true);
                                            try {
                                                const category = featuredGalleryItem.category || '';
                                                const isSeries = category.toLowerCase().includes('series') ||
                                                    category.toLowerCase().includes('show') ||
                                                    category.toLowerCase().includes('serial');

                                                let response;
                                                const id = featuredGalleryItem.movie_id;

                                                if (isSeries) {
                                                    if (category.toLowerCase().includes('serial')) {
                                                        response = await movieService.getTVSerialById(id);
                                                    } else if (category.toLowerCase().includes('show')) {
                                                        response = await movieService.getTVShowById(id);
                                                    } else {
                                                        response = await movieService.getWebSeriesById(id);
                                                    }
                                                } else {
                                                    response = await movieService.getMovieById(id);
                                                }

                                                if (response.status && response.data) {
                                                    const media = isSeries ?
                                                        (response.data?.tvshows?.data?.[0] || (Array.isArray(response.data) ? response.data[0] : response.data)) :
                                                        (Array.isArray(response.data) ? response.data[0] : response.data);

                                                    if (media && media.links && media.links.length > 0) {
                                                        const ep = media.links[0];
                                                        const videoUrl = isSeries ? ep.tvShow_link : ep.movie_link;
                                                        const dualaudioUrl = isSeries ? ep.dual_link : ep.dualaudio_link;

                                                        if (videoUrl) {
                                                            navigation.navigate('VideoPlayer', {
                                                                videoUrl,
                                                                dualaudioUrl,
                                                                movieTitle: media.title,
                                                                isSeries,
                                                                episodes: isSeries ? media.links : [],
                                                                initialIndex: 0,
                                                                posterUrl: isSeries ? `${TV_SHOWS_POSTER_BASE_URL}${media.poster}` : `${MOVIES_POSTER_BASE_URL}${media.poster}`,
                                                            });
                                                        } else {
                                                            alert('Video link not available');
                                                        }
                                                    } else {
                                                        alert('Media content not found.');
                                                    }
                                                } else {
                                                    alert('Could not retrieve media details.');
                                                }
                                            } catch (error) {
                                                console.error('Error fetching banner media:', error);
                                                alert('Failed to load video.');
                                            } finally {
                                                setIsActionLoading(false);
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
                            </TouchableOpacity>
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

                    {latestWebSeries.length > 0 && (
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
                                data={latestWebSeries}
                                renderItem={renderWebSeriesItem}
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

            {isActionLoading && (
                <View style={styles.actionOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}
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
        aspectRatio: 16 / 9,
        marginHorizontal: spacing.md,
        marginTop: spacing.sm,
        justifyContent: 'flex-end',
        borderRadius: 12,
        overflow: 'hidden',
    },
    bannerImage: {
        borderRadius: 12,
    },
    featuredOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', // Atmospheric bottom shadow
        alignItems: 'center',
        paddingBottom: spacing.xl,
        paddingTop: spacing.lg,
    },
    featuredTitle: {
        textAlign: 'center',
        marginBottom: spacing.xs,
        fontSize: 32,
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
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.md,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
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
        paddingTop: spacing.xxl,
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
    tagDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.textSecondary,
        marginHorizontal: spacing.sm,
        opacity: 0.6,
    },
    actionOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    netflixPlayButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 4,
        marginHorizontal: spacing.sm,
        flex: 1,
        maxWidth: 150,
    },
    playButtonText: {
        color: colors.white,
        marginLeft: spacing.xs,
        fontSize: 17,
    },
    netflixListButton: {
        backgroundColor: 'rgba(51, 51, 51, 0.8)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: 4,
        marginHorizontal: spacing.sm,
        flex: 1,
        maxWidth: 150,
    },
    listButtonText: {
        color: colors.white,
        marginLeft: spacing.xs,
        fontSize: 17,
    },
    activeFilterTab: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
});

export default HomeScreen; 