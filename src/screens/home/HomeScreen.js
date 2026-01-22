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

const HomeScreen = ({ navigation }) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const [movies, setMovies] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchMovies(), fetchGallery(), fetchCategories()]);
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

    const renderMovieItem = ({ item }) => (
        <MovieCard
            imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
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
        <View style={styles.container}>
            <MainHeader scrollY={scrollY} variant="home" />

            <Animated.ScrollView
                style={styles.scrollView}
                bounces={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
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
                                            if (featuredGalleryItem.movie_url) {
                                                navigation.navigate('VideoPlayer', {
                                                    videoUrl: featuredGalleryItem.movie_url,
                                                });
                                            }
                                        }}
                                    >
                                        <Icon name="play-arrow" size={24} color={colors.black} />
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

                    {webSeries.length > 0 && (
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
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        marginHorizontal: spacing.md,
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
        backgroundColor: colors.white,
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
        color: colors.black,
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
