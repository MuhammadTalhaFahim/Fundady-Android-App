import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    TouchableOpacity,
    Platform,
    StatusBar,
    FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
import { movieService } from '../../services/movieService';
import { MOVIES_POSTER_BASE_URL as POSTER_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

const MovieDetailScreen = ({ route, navigation }) => {
    const { movie } = route.params;
    const [showVideo, setShowVideo] = useState(true);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isInMyList, setIsInMyList] = useState(false);
    const [similarMovies, setSimilarMovies] = useState([]);

    useEffect(() => {
        fetchSimilarMovies();
    }, [movie]);

    const fetchSimilarMovies = async () => {
        try {
            const json = await movieService.getMovies();
            if (json.status) {
                // Filter movies by similar categories (excluding the current movie)
                const currentCats =
                    movie.categories?.split(',').map(c => c.trim()) || [];
                let filtered = json.data.filter(m => {
                    if (m.id === movie.id) return false;
                    const mCats = m.categories?.split(',').map(c => c.trim()) || [];
                    return mCats.some(cat => currentCats.includes(cat));
                });

                // Fallback: If no similar movies found, just show any movies (except current)
                if (filtered.length === 0) {
                    filtered = json.data.filter(m => m.id !== movie.id);
                }

                setSimilarMovies(filtered.slice(0, 15)); // Limit result for performance
            }
        } catch (error) {
            console.error('Error fetching similar movies:', error);
        }
    };

    const toggleDescription = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    const toggleMyList = () => {
        setIsInMyList(!isInMyList);
    };

    const renderSimilarMovie = (item, index) => {
        const spacingTotal = spacing.md * 2 + spacing.xs * 2; // Parent padding + grid padding
        const cardWidth = (width - spacingTotal) / 3 - 2;
        return (
            <MovieCard
                key={item.id?.toString() || index.toString()}
                imageUrl={`${POSTER_BASE_URL}${item.poster}`}
                onPress={() => navigation.push('MovieDetail', { movie: item })}
                width={cardWidth}
                height={cardWidth * 1.5}
                style={styles.similarMovieCard}
            />
        );
    };

    const descriptionText = movie.description || '';
    const shouldShowMore = descriptionText.length > 150;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <MainHeader variant="inner" />
            </View>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.mediaContainer}>
                    {showVideo ? (
                        <Video
                            source={require('../../assets/videos/intro.mp4')}
                            style={styles.introVideo}
                            resizeMode="cover"
                            muted={false}
                            onEnd={() => setShowVideo(false)}
                            onError={e => {
                                console.log('Video error:', e);
                                setShowVideo(false);
                            }}
                        />
                    ) : (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.posterWrapper}
                            onPress={() => {
                                const videoUrl =
                                    movie.links && movie.links.length > 0
                                        ? movie.links[0].movie_link
                                        : null;
                                if (videoUrl) {
                                    navigation.navigate('VideoPlayer', {
                                        videoUrl,
                                        movieTitle: movie.title,
                                        posterUrl: `${POSTER_BASE_URL}${movie.poster}`,
                                    });
                                } else {
                                    alert('Video link not available');
                                }
                            }}
                        >
                            <Image
                                source={{ uri: `${POSTER_BASE_URL}${movie.poster}` }}
                                style={styles.poster}
                                resizeMode="cover"
                            />
                            <View style={styles.playOverlay}>
                                <View style={styles.youtubePlayButton}>
                                    <Icon name="play-arrow" size={50} color={colors.white} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>


                <View style={styles.content}>
                    <View style={styles.logoAndTitle}>
                        <AppText variant="bold" size="headingLg" style={styles.movieTitle}>
                            {movie.title}
                        </AppText>
                    </View>

                    <View style={styles.infoRow}>
                        <AppText color={colors.textSecondary} style={styles.infoItem}>
                            {movie.release_date?.split('-')[0] || 'N/A'}
                        </AppText>
                        <View style={styles.ratingBadge}>
                            <AppText color={colors.black} size="xs" variant="bold" style={styles.imdbText}>
                                IMDb
                            </AppText>
                            <AppText color={colors.black} size="xs" variant="bold">
                                {" "}
                                {movie.imdb_rating || 'N/A'}
                            </AppText>
                        </View>
                        <AppText color={colors.textSecondary} style={styles.infoItem}>
                            {movie.runtime ? `${movie.runtime} min` : 'N/A'}
                        </AppText>
                        <View style={styles.hdBadge}>
                            <AppText color={colors.white} size="xs" variant="bold">
                                HD
                            </AppText>
                        </View>
                    </View>

                    <View style={styles.youtubeActionsRow}>
                        <TouchableOpacity style={styles.youtubeDownloadButton}>
                            <Icon name="file-download" size={20} color={colors.white} />
                            <AppText variant="bold" style={styles.downloadText}>Download</AppText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.youtubeIconButton}>
                            <Icon name="share" size={20} color={colors.white} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.youtubeIconButton} onPress={toggleMyList}>
                            <Icon name={isInMyList ? "check" : "add"} size={22} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    {/* <TouchableOpacity
                        style={styles.netflixPlayButton}
                        onPress={() => {
                            const videoUrl =
                                movie.links && movie.links.length > 0
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
                        }}
                    >
                        <Icon name="play-arrow" size={24} color={colors.black} />
                        <AppText variant="bold" style={styles.playButtonText}>
                            Play
                        </AppText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.netflixDownloadButton}>
                        <Icon name="file-download" size={24} color={colors.white} />
                        <AppText variant="bold" style={styles.downloadButtonText}>
                            Download
                        </AppText>
                    </TouchableOpacity> */}

                    {/* Description Section */}
                    <View style={styles.descriptionSection}>
                        <AppText
                            style={styles.description}
                            numberOfLines={isDescriptionExpanded ? undefined : 3}
                        >
                            {descriptionText}
                        </AppText>
                        {shouldShowMore && (
                            <TouchableOpacity onPress={toggleDescription}>
                                <AppText
                                    color={colors.white}
                                    variant="bold"
                                    style={styles.moreButton}
                                >
                                    {isDescriptionExpanded ? 'less' : 'more'}
                                </AppText>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.creditSection}>
                        <AppText color={colors.textMuted} size="sm">
                            Starring:{' '}
                            <AppText color={colors.textSecondary} size="sm">
                                {movie.actors}
                            </AppText>
                        </AppText>
                        <AppText
                            color={colors.textMuted}
                            size="sm"
                            style={{ marginTop: 4 }}
                        >
                            Director:{' '}
                            <AppText color={colors.textSecondary} size="sm">
                                {movie.director}
                            </AppText>
                        </AppText>
                    </View>


                    {similarMovies.length > 0 && (
                        <>
                            <View style={styles.tabHeader}>
                                <View style={styles.activeTabIndicator} />
                                <AppText
                                    variant="bold"
                                    color={colors.white}
                                    style={styles.tabTitle}
                                >
                                    More Like This
                                </AppText>
                            </View>

                            <View style={styles.similarMoviesGrid}>
                                {similarMovies.map((item, index) => renderSimilarMovie(item, index))}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        backgroundColor: colors.black,
        paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
        paddingBottom: spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    posterWrapper: {
        width: width,
        height: 250,
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    mediaContainer: {
        width: width,
        height: 250,
        backgroundColor: colors.black,
    },
    introVideo: {
        width: width,
        height: '100%',
    },
    content: {
        padding: spacing.md,
    },
    logoAndTitle: {
        marginBottom: spacing.sm,
    },
    netflixLogo: {
        letterSpacing: 2,
        marginBottom: 4,
    },
    movieTitle: {
        color: colors.white,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    infoItem: {
        marginRight: spacing.sm,
        fontSize: 14,
    },
    // ratingBadge: {
    //     backgroundColor: '#333',
    //     paddingHorizontal: 6,
    //     paddingVertical: 2,
    //     borderRadius: 2,
    //     marginRight: spacing.sm,
    // },

    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    youtubePlayButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.white,
    },
    youtubeActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    youtubeDownloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#272727', // YouTube dark grey
        paddingHorizontal: spacing.lg,
        paddingVertical: 10,
        borderRadius: 25,
        gap: spacing.xs,
    },
    downloadText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    youtubeIconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#272727',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hdBadge: {
        borderWidth: 1,
        borderColor: colors.textSecondary,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
    },
    ratingBadge: {
        backgroundColor: '#f5c518',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    netflixPlayButton: {
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: 4,
        marginBottom: spacing.sm,
    },
    // playButtonText: {
    //     color: colors.black,
    //     marginLeft: spacing.xs,
    //     fontSize: 16,
    // },
    // netflixDownloadButton: {
    //     backgroundColor: '#333',
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     paddingVertical: spacing.sm,
    //     borderRadius: 4,
    //     marginBottom: spacing.md,
    // },
    // downloadButtonText: {
    //     color: colors.white,
    //     marginLeft: spacing.xs,
    //     fontSize: 16,
    // },
    descriptionSection: {
        marginBottom: spacing.sm,
    },
    description: {
        color: colors.white,
        lineHeight: 20,
        fontSize: 14,
    },
    moreButton: {
        fontSize: 14,
        marginTop: 2,
    },
    creditSection: {
        marginBottom: spacing.lg,
    },
    userActionRow: {
        flexDirection: 'row',
        // justifyContent: 'space-around',
        justifyContent: 'flex-start',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        marginBottom: spacing.md,
    },
    actionItem: {
        alignItems: 'center',
        // flex: 1,
    },
    actionLabel: {
        marginTop: 4,
    },
    tabHeader: {
        marginBottom: spacing.md,
    },
    activeTabIndicator: {
        height: 4,
        backgroundColor: colors.primary,
        width: 100,
        position: 'absolute',
        top: -spacing.md,
    },
    tabTitle: {
        fontSize: 16,
    },
    similarMoviesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 2,
    },
    similarMovieCard: {
        marginBottom: 8,
    },
});

export default MovieDetailScreen;
