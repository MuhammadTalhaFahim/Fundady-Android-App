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
    Modal,
    Linking,
    PermissionsAndroid,
    Share,
    ActivityIndicator,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
import { movieService } from '../../services/movieService';
import { MOVIES_POSTER_BASE_URL as POSTER_BASE_URL, SPORTS_POSTER_BASE_URL } from '../../utils/constants';

const { width } = Dimensions.get('window');

const MovieDetailScreen = ({ route, navigation }) => {
    const { id, contentType, movieDataFallback } = route.params;
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showVideo, setShowVideo] = useState(true);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isInMyList, setIsInMyList] = useState(false);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);

    useEffect(() => {
        const fetchMovieData = async () => {
            setLoading(true);
            try {
                // Determine which APIs to call based on contentType
                let detailPromise;
                let similarPromise;

                if (contentType === 'cricket') {
                    detailPromise = movieService.getCricketById(id);
                    similarPromise = movieService.getCricket();
                } else if (contentType === 'wwe') {
                    detailPromise = movieService.getWWEById(id);
                    similarPromise = movieService.getWWE();
                } else if (contentType === 'football') {
                    detailPromise = movieService.getFootballById(id);
                    similarPromise = movieService.getFootball();
                } else {
                    detailPromise = movieService.getMovieById(id);
                    similarPromise = movieService.getMovies();
                }

                const [movieRes, allMoviesRes] = await Promise.all([
                    detailPromise.catch(err => {
                        console.warn('detailPromise failed:', err);
                        return null; // triggers fallback mechanism downstream
                    }),
                    similarPromise.catch(err => {
                        console.warn('similarPromise failed:', err);
                        return null;
                    })
                ]);

                // If APIs resolved, setup responseData
                const responseData = (movieRes && movieRes.data) ? movieRes.data : movieRes;

                // Robust extraction for different response structures
                let movieData = null;
                if (contentType === 'cricket' || contentType === 'wwe' || contentType === 'football') {
                    // Sports might be nested or direct
                    let directData = (responseData?.[contentType]?.data?.[0] || responseData?.data?.[0] || (Array.isArray(responseData) ? responseData[0] : responseData));

                    // Backend fallback: if the specific ID fetch returned empty, find it in the full list
                    if (!directData || Object.keys(directData).length === 0) {
                        const allData = allMoviesRes?.data || allMoviesRes;
                        const availableList = allData?.[contentType]?.data || allData?.data || (Array.isArray(allData) ? allData : []);
                        directData = availableList.find(m => String(m.id) === String(id)) || null;
                    }

                    movieData = directData || movieDataFallback || null;
                } else {
                    // Movies standard
                    let directData = (responseData?.data?.[0] || (Array.isArray(responseData) ? responseData[0] : responseData));
                    if (Array.isArray(directData) && directData.length === 0) directData = null;
                    movieData = directData || movieDataFallback || null;
                }

                if (movieData) {
                    setMovie(movieData);
                } else {
                    throw new Error('No data found');
                }

                // Process similar items
                const allData = (allMoviesRes && allMoviesRes.data) ? allMoviesRes.data : allMoviesRes;
                if (allData) {
                    let availableData = [];
                    if (contentType === 'cricket' || contentType === 'wwe' || contentType === 'football') {
                        availableData = allData?.[contentType]?.data || allData?.data || (Array.isArray(allData) ? allData : []);
                    } else {
                        availableData = allData?.data || (Array.isArray(allData) ? allData : []);
                    }

                    if (!Array.isArray(availableData)) {
                        availableData = [];
                    }

                    const currentCats = typeof movieData.categories === 'string' ? movieData.categories.split(',').map(c => c.trim()) : [];
                    let filtered = availableData.filter(m => {
                        if (m.id === movieData.id) return false;
                        const mCats = typeof m.categories === 'string' ? m.categories.split(',').map(c => c.trim()) : [];
                        return mCats.length > 0 ? mCats.some(cat => currentCats.includes(cat)) : true;
                    });

                    if (filtered.length === 0) {
                        filtered = availableData.filter(m => m.id !== movieData.id);
                    }
                    setSimilarMovies(filtered.slice(0, 15));
                }
            } catch (error) {
                console.error('Error fetching content details:', error);
                alert('Failed to load content details');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMovieData();
        }
    }, [id]);

    const fetchSimilarMovies = () => {
        // This is now handled within the main useEffect for speed
    };

    // Derived values (handle null movie)
    // Sports use video_link directly, Movies use links array or movie_url
    const streamLink = movie?.video_link || movie?.movie_url || (movie?.links && movie.links.length > 0 ? movie.links[0].movie_link : null);
    const dualStreamLink = movie?.links && movie.links.length > 0 ? movie.links[0].dualaudio_link : null;
    const downloadLink = movie?.download_link || (movie?.links && movie.links.length > 0 ? movie.links[0].download_link : null);
    const dualDownloadLink = movie?.links && movie.links.length > 0 ? movie.links[0].dual_download_link : null;

    const descriptionText = movie?.description || '';
    const shouldShowMore = descriptionText.length > 150;

    const handleDownloadPress = () => {
        if (!downloadLink && !dualDownloadLink) {
            alert('Download not available for this content.');
            return;
        }

        if (dualDownloadLink && dualDownloadLink !== '') {
            // Show modal if we have a dual audio download link
            setIsDownloadModalVisible(true);
        } else if (downloadLink) {
            // Directly download if only one link exists
            executeDownload(downloadLink);
        }
    };

    const handlePlayPress = () => {
        if (!streamLink && !dualStreamLink) {
            alert('Live stream not available');
            return;
        }

        const isSports = contentType === 'cricket' || contentType === 'wwe' || contentType === 'football';

        navigation.navigate('VideoPlayer', {
            videoUrl: streamLink,
            dualaudioUrl: dualStreamLink,
            movieTitle: isSports ? (movie.video_title || movie.title) : movie.title,
            isSeries: false,
            posterUrl: `${isSports ? SPORTS_POSTER_BASE_URL : POSTER_BASE_URL}${movie.poster}`
        });
    };

    const downloadTrack = (url) => {
        setIsDownloadModalVisible(false);
        if (url) {
            executeDownload(url);
        }
    };

    const executeDownload = async (url) => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'Fundady needs access to your storage to download the movie.',
                        buttonPositive: 'OK',
                    }
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED && Platform.Version < 33) {
                    alert('Storage Permission Denied');
                    return;
                }
            }

            const fileName = url.substring(url.lastIndexOf('/') + 1) || `${movie.title.replace(/\s+/g, '_')}.mp4`;

            ReactNativeBlobUtil.config({
                addAndroidDownloads: {
                    useDownloadManager: true, // native download manager
                    notification: true, // show system tray notification
                    title: `${movie.title} - Fundady`,
                    description: 'Downloading movie...',
                    mime: 'video/mp4',
                    mediaScannable: true,
                }
            })
                .fetch('GET', url)
                .then((res) => {
                    if (Platform.OS === 'ios') {
                        ReactNativeBlobUtil.ios.previewDocument(res.path());
                    } else {
                        console.log('Download initiated via System DownloadManager.');
                    }
                })
                .catch((err) => {
                    console.error("Download Error", err);
                    alert('Download failed to start.');
                });

        } catch (err) {
            console.warn(err);
        }
    };

    const toggleDescription = () => {
        setIsDescriptionExpanded(!isDescriptionExpanded);
    };

    const toggleMyList = () => {
        setIsInMyList(!isInMyList);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out "${movie.title}" on Fundady! \n\n${movie.description ? movie.description.substring(0, 150) + '...' : ''}`,
                url: 'https://fundady.com',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderSimilarMovie = (item, index) => {
        const isSport = contentType === 'cricket' || contentType === 'wwe' || contentType === 'football';
        const numCols = isSport ? 2 : 3;
        const spacingTotal = spacing.md * 2 + (numCols - 1) * spacing.xs;
        const cardWidth = (width - spacingTotal) / numCols - 2;
        const currentBaseUrl = isSport ? SPORTS_POSTER_BASE_URL : POSTER_BASE_URL;

        return (
            <MovieCard
                key={item.id?.toString() || index.toString()}
                imageUrl={`${currentBaseUrl}${item.poster}`}
                onPress={() => navigation.push('MovieDetail', {
                    id: item.id,
                    contentType: contentType
                })}
                width={cardWidth}
                height={isSport ? cardWidth * 0.5625 : cardWidth * 1.5}
                style={styles.similarMovieCard}
            />
        );
    };


    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!movie) return null;

    const isSports = contentType === 'cricket' || contentType === 'wwe' || contentType === 'football';

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
                            onPress={handlePlayPress}
                        >
                            <Image
                                source={{ uri: `${contentType === 'cricket' || contentType === 'wwe' || contentType === 'football' ? SPORTS_POSTER_BASE_URL : POSTER_BASE_URL}${movie.poster}` }}
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
                            {isSports ? (movie.video_title || movie.title) : movie.title}
                        </AppText>
                    </View>

                    <View style={styles.infoRow}>
                        {isSports ? (
                            <>
                                <AppText color={colors.textSecondary} style={styles.infoItem}>
                                    {movie.date?.split('-')[0] || 'N/A'}
                                </AppText>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm }}>
                                    <Icon name="visibility" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                                    <AppText color={colors.textSecondary} style={{ fontSize: 14 }}>
                                        {movie.views !== null && movie.views !== undefined ? movie.views : 'N/A'}
                                    </AppText>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.sm }}>
                                    <Icon name="file-download" size={16} color={colors.textSecondary} style={{ marginRight: 2 }} />
                                    <AppText color={colors.textSecondary} style={{ fontSize: 14 }}>
                                        {movie.downloads !== null && movie.downloads !== undefined ? movie.downloads : 'N/A'}
                                    </AppText>
                                </View>
                                <View style={styles.hdBadge}>
                                    <AppText color={colors.white} size="xs" variant="bold">
                                        {movie.qualities || 'HD'}
                                    </AppText>
                                </View>
                            </>
                        ) : (
                            <>
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
                                        {movie.qualities || 'HD'}
                                    </AppText>
                                </View>
                            </>
                        )}
                    </View>

                    <View style={styles.youtubeActionsRow}>
                        <TouchableOpacity style={styles.youtubeDownloadButton} onPress={handleDownloadPress}>
                            <Icon name="file-download" size={20} color={colors.white} />
                            <AppText variant="bold" style={styles.downloadText}>Download</AppText>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.youtubeIconButton} onPress={handleShare}>
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

                    {!isSports && (
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
                    )}


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

            <Modal
                visible={isDownloadModalVisible}
                transparent={true}
                animationType="fade"
                statusBarTranslucent={true}
                onRequestClose={() => setIsDownloadModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AppText variant="bold" color={colors.white} style={styles.modalTitle}>Select Audio</AppText>
                        <View style={styles.modalOptions}>
                            <TouchableOpacity style={styles.modalOption} onPress={() => downloadTrack(downloadLink)}>
                                <AppText color={colors.white} style={styles.modalOptionText}>English (Default)</AppText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalOption} onPress={() => downloadTrack(dualDownloadLink)}>
                                <AppText color={colors.white} style={styles.modalOptionText}>Hindi (Dual Audio)</AppText>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.modalCancelButton} onPress={() => setIsDownloadModalVisible(false)}>
                            <AppText variant="bold" color="#E50914">CANCEL</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
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
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '60%',
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 24,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalOptions: {
        marginBottom: 20,
    },
    modalOption: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    modalOptionText: {
        fontSize: 16,
    },
    modalCancelButton: {
        alignSelf: 'flex-end',
        padding: 10,
    },
});

export default MovieDetailScreen;
