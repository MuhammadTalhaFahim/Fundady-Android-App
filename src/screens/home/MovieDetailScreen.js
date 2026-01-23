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

const { width } = Dimensions.get('window');
const MOVIES_API_URL = 'https://fundady.com/api/v1/movies';
const POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';

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
            const response = await fetch(MOVIES_API_URL);
            const json = await response.json();
            if (json.status) {
                // Filter movies by similar categories (excluding the current movie)
                const currentCats =
                    movie.categories?.split(',').map(c => c.trim()) || [];
                const filtered = json.data.filter(m => {
                    if (m.id === movie.id) return false;
                    const mCats = m.categories?.split(',').map(c => c.trim()) || [];
                    return mCats.some(cat => currentCats.includes(cat));
                });
                setSimilarMovies(filtered);
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

    const renderSimilarMovie = ({ item }) => {
        const cardWidth = (width - spacing.sm * 2) / 3 - 8;
        return (
            <MovieCard
                imageUrl={`${POSTER_BASE_URL}${item.poster}`}
                onPress={() => navigation.push('MovieDetail', { movie: item })}
                width={cardWidth}
                height={styles.similarMovieCard.height}
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
                            muted={true}
                            onEnd={() => setShowVideo(false)}
                            onError={e => {
                                console.log('Video error:', e);
                                setShowVideo(false);
                            }}
                        />
                    ) : (
                        <View style={styles.posterWrapper}>
                            <Image
                                source={{ uri: `${POSTER_BASE_URL}${movie.poster}` }}
                                style={styles.poster}
                                resizeMode="cover"
                            />
                        </View>
                    )}
                </View>

                <View style={styles.content}>
                    <View style={styles.logoAndTitle}>
                        <AppText
                            variant="bold"
                            color={colors.primary}
                            size="xs"
                            style={styles.netflixLogo}
                        >
                            F U N D A D Y
                        </AppText>
                        <AppText variant="bold" size="headingLg" style={styles.movieTitle}>
                            {movie.title}
                        </AppText>
                    </View>
                    <View style={styles.infoRow}>
                        <AppText color={colors.textSecondary} style={styles.infoItem}>
                            {movie.release_date?.split('-')[0] || 'N/A'}
                        </AppText>
                        <View style={styles.ratingBadge}>
                            <AppText color={colors.textPrimary} size="xs" variant="bold">
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

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={styles.netflixPlayButton}
                        onPress={() => {
                            const videoUrl =
                                movie.links && movie.links.length > 0
                                    ? movie.links[0].movie_link
                                    : null;
                            if (videoUrl) {
                                navigation.navigate('VideoPlayer', { videoUrl });
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
                    </TouchableOpacity>

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

                    {/* User Action Row */}
                    <View style={styles.userActionRow}>
                        <TouchableOpacity style={styles.actionItem} onPress={toggleMyList}>
                            <Icon
                                name={isInMyList ? 'check' : 'add'}
                                size={30}
                                color={colors.white}
                            />
                            <AppText
                                size="xs"
                                color={colors.textSecondary}
                                style={styles.actionLabel}
                            >
                                My List
                            </AppText>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={styles.actionItem}>
                            <Icon name="thumb-up-off-alt" size={28} color={colors.white} />
                            <AppText size="xs" color={colors.textSecondary} style={styles.actionLabel}>Rate</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionItem}>
                            <Icon name="share" size={28} color={colors.white} />
                            <AppText size="xs" color={colors.textSecondary} style={styles.actionLabel}>Share</AppText>
                        </TouchableOpacity> */}
                    </View>

                    {/* More Like This Section */}
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

                    <FlatList
                        data={similarMovies}
                        renderItem={renderSimilarMovie}
                        keyExtractor={item => item.id.toString()}
                        numColumns={3}
                        scrollEnabled={false}
                        contentContainerStyle={styles.similarMoviesGrid}
                    />
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
    ratingBadge: {
        backgroundColor: '#333',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 2,
        marginRight: spacing.sm,
    },
    hdBadge: {
        borderWidth: 1,
        borderColor: colors.textSecondary,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
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
    playButtonText: {
        color: colors.black,
        marginLeft: spacing.xs,
        fontSize: 16,
    },
    netflixDownloadButton: {
        backgroundColor: '#333',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        borderRadius: 4,
        marginBottom: spacing.md,
    },
    downloadButtonText: {
        color: colors.white,
        marginLeft: spacing.xs,
        fontSize: 16,
    },
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
        paddingBottom: spacing.xl,
    },
    similarMovieCard: {
        width: (width - spacing.sm * 2) / 3 - 8,
        height: 200,
        margin: 4,
    },
});

export default MovieDetailScreen;
