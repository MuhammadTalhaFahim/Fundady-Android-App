import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Pressable,
    Platform,
    StatusBar,
    Modal,
    PermissionsAndroid,
    Share,
    useWindowDimensions,
    RefreshControl,
    ToastAndroid,
    Alert,
} from 'react-native';
import Loader from '../../components/common/Loader';
import { useCallback } from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Icon from '../../components/common/SvgIcon';
import Video from 'react-native-video';
import TrailerPlayer from '../../components/common/TrailerPlayer';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
import { movieService } from '../../services/movieService';
import { MOVIES_POSTER_BASE_URL as POSTER_BASE_URL, SPORTS_POSTER_BASE_URL } from '../../utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { moderateScale, isTablet, isTV, SCREEN_WIDTH } from '../../utils/responsive';
import { getTimeAgo } from '../../utils/helpers';
import { makeProgressKey } from '../../utils/watchProgress';
import { useSavedProgress } from '../../hooks/useSavedProgress';

// ─── Focus-aware pressable button ───────────────────────────────────────────
const FocusableButton = ({ onPress, style, focusedStyle, children, autoFocus = false }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <Pressable
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onPress={onPress}
            autoFocus={autoFocus}
            style={[style, isFocused && (focusedStyle || styles.defaultFocused)]}
        >
            {typeof children === 'function' ? children(isFocused) : children}
        </Pressable>
    );
};

// ─── Modal option with D-pad focus ──────────────────────────────────────────
const ModalOption = ({ onPress, children, isSelected }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <Pressable
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onPress={onPress}
            style={[
                styles.modalOption,
                isSelected && styles.activeModalOption,
                isFocused && styles.modalOptionFocused,
            ]}
        >
            {children}
        </Pressable>
    );
};

const MovieDetailScreen = ({ route, navigation }) => {
    const { width: currentWidth, height: currentHeight } = useWindowDimensions();
    const portraitWidth = currentWidth < currentHeight ? currentWidth : currentHeight;
    const stableWidth = (isTablet || isTV) ? currentWidth : portraitWidth;

    const insets = useSafeAreaInsets();
    const { id, contentType, movieDataFallback, fromTab } = route.params;

    // Dynamic 16:9 height so the trailer/poster fills full width without black bars.
    // On TV/tablet cap it so the trailer doesn't cover the whole screen and the Play button stays visible.
    const mediaHeight = Math.round((isTV || isTablet) ? Math.min(stableWidth * 9 / 16, currentHeight * 0.6) : stableWidth * 9 / 16);
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isTextTruncated, setIsTextTruncated] = useState(false);
    const [fullTextLines, setFullTextLines] = useState(0);
    const [isInMyList, setIsInMyList] = useState(false);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isTrailerEnded, setIsTrailerEnded] = useState(false);

    // Saved watch progress -> Play button shows "Resume" (same key the player saves under)
    const savedProgress = useSavedProgress(
        makeProgressKey({ contentType, contentId: movie?.id ?? id, isSeries: false, title: movie?.title }),
    );

    useEffect(() => {
        const fetchMovieData = async () => {
            setIsTrailerEnded(false);
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
                } else if (contentType === 'ufc') {
                    detailPromise = movieService.getUFCById(id);
                    similarPromise = movieService.getUFC();
                } else if (contentType === 'aew') {
                    detailPromise = movieService.getAEWById(id);
                    similarPromise = movieService.getAEW();
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
                const isSportsType = ['cricket', 'wwe', 'ufc', 'aew', 'football'].includes(contentType);

                if (isSportsType) {
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
                    const isSportsType = ['cricket', 'wwe', 'ufc', 'aew', 'football'].includes(contentType);

                    if (isSportsType) {
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

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            let detailPromise;
            let similarPromise;

            if (contentType === 'cricket') {
                detailPromise = movieService.getCricketById(id);
                similarPromise = movieService.getCricket();
            } else if (contentType === 'wwe') {
                detailPromise = movieService.getWWEById(id);
                similarPromise = movieService.getWWE();
            } else if (contentType === 'ufc') {
                detailPromise = movieService.getUFCById(id);
                similarPromise = movieService.getUFC();
            } else if (contentType === 'aew') {
                detailPromise = movieService.getAEWById(id);
                similarPromise = movieService.getAEW();
            } else if (contentType === 'football') {
                detailPromise = movieService.getFootballById(id);
                similarPromise = movieService.getFootball();
            } else {
                detailPromise = movieService.getMovieById(id);
                similarPromise = movieService.getMovies();
            }

            const [movieRes, allMoviesRes] = await Promise.all([
                detailPromise.catch(() => null),
                similarPromise.catch(() => null)
            ]);

            const responseData = (movieRes && movieRes.data) ? movieRes.data : movieRes;
            if (responseData) {
                let movieData = (responseData?.data?.[0] || (Array.isArray(responseData) ? responseData[0] : responseData));
                if (movieData) setMovie(movieData);
            }
            
            const allData = (allMoviesRes && allMoviesRes.data) ? allMoviesRes.data : allMoviesRes;
            if (allData) {
                const availableData = allData?.data || (Array.isArray(allData) ? allData : []);
                setSimilarMovies(availableData.slice(0, 15));
            }
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [id, contentType]);

    const fetchSimilarMovies = () => {
        // This is now handled within the main useEffect for speed
    };

    // Derived values (handle null movie)
    const streamLink = movie?.video_link || movie?.movie_url || (movie?.links && movie.links.length > 0 ? movie.links[0].movie_link : null);
    const dualStreamLink = movie?.links && movie.links.length > 0 ? movie.links[0].dualaudio_link : null;
    const downloadLink = movie?.download_link || (movie?.links && movie.links.length > 0 ? movie.links[0].download_link : null);
    const dualDownloadLink = movie?.links && movie.links.length > 0 ? movie.links[0].dual_download_link : null;

    const descriptionText = movie?.description || '';

    const handleDownloadPress = () => {
        if (!downloadLink && !dualDownloadLink) {
            alert('Download not available for this content.');
            return;
        }

        if (dualDownloadLink && dualDownloadLink !== '') {
            setIsDownloadModalVisible(true);
        } else if (downloadLink) {
            executeDownload(downloadLink);
        }
    };

    const handlePlayPress = (forcedLang) => {
        if (!streamLink && !dualStreamLink) {
            alert('Live stream not available');
            return;
        }
        const isSports = ['cricket', 'wwe', 'ufc', 'aew', 'football'].includes(contentType);

        const langToUse = forcedLang || selectedLanguage;
        let finalUrl = streamLink;
        let secondaryUrl = dualStreamLink;

        if (langToUse === 'Hindi' && dualStreamLink) {
            finalUrl = dualStreamLink;
            secondaryUrl = streamLink;
        }

        navigation.navigate('VideoPlayer', {
            videoUrl: finalUrl,
            dualaudioUrl: secondaryUrl,
            movieTitle: isSports ? (movie.video_title || movie.title) : movie.title,
            isSeries: false,
            contentId: movie.id ?? id,
            contentType,
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
            const isSports = ['cricket', 'wwe', 'ufc', 'aew', 'football'].includes(contentType);
            movieService.updateDownloadCount({ id: movie.id, type: isSports ? 'sports' : 'movie' });

            if (Platform.OS === 'android') {
                if (Platform.Version < 33) {
                    const granted = await PermissionsAndroid.request(
                        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: 'Storage Permission Required',
                            message: 'Fundady needs access to your storage to download the movie.',
                            buttonPositive: 'OK',
                        }
                    );

                    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                        alert('Storage Permission Denied');
                        return;
                    }
                } else {
                    const hasNotificationPermission = await PermissionsAndroid.check(
                        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                    );
                    if (!hasNotificationPermission) {
                        await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
                            {
                                title: 'Notification Permission Required',
                                message: 'Fundady needs notification permission to show download progress in your status bar.',
                                buttonPositive: 'OK',
                            }
                        );
                    }
                }
            }

            // Extract and sanitize filename
            let cleanUrl = url.split(/[?#]/)[0];
            let fileName = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
            if (!fileName) {
                fileName = `${movie.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
            } else {
                fileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
                if (!fileName.endsWith('.mp4') && !fileName.endsWith('.mkv') && !fileName.endsWith('.avi')) {
                    fileName = `${fileName}.mp4`;
                }
            }

            if (Platform.OS === 'android') {
                ToastAndroid.show('Download started...', ToastAndroid.SHORT);
            } else {
                Alert.alert('Download', 'Download started in the background.');
            }

            if (Platform.OS === 'android') {
                const downloadPath = `/storage/emulated/0/Download/${fileName}`;

                ReactNativeBlobUtil.config({
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        title: `${movie.title} - Fundady`,
                        description: 'Downloading movie...',
                        mime: 'video/mp4',
                        mediaScannable: true,
                        path: downloadPath,
                    }
                })
                    .fetch('GET', url)
                    .then((res) => {
                        ReactNativeBlobUtil.fs.scanFile([{ path: res.path(), mime: 'video/mp4' }]);
                        ToastAndroid.show(`Saved to Downloads: ${fileName}`, ToastAndroid.LONG);
                    })
                    .catch((err) => {
                        console.error('Download Error', err);
                        Alert.alert('Download Failed', 'Could not download the video. Please try again.');
                    });
            } else {
                // iOS: save to a temp path and let the user preview / share it
                const { dirs } = ReactNativeBlobUtil.fs;
                const downloadPath = `${dirs.DocumentDir}/${fileName}`;
                ReactNativeBlobUtil.config({ path: downloadPath })
                    .fetch('GET', url)
                    .then((res) => {
                        ReactNativeBlobUtil.ios.previewDocument(res.path());
                    })
                    .catch((err) => {
                        console.error('Download Error', err);
                        alert('Download failed to start.');
                    });
            }

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

    const handleClose = () => {
        const tab = fromTab || 'Home';
        navigation.navigate('TabStack', { screen: tab });
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
        const isSport = ['cricket', 'wwe', 'ufc', 'aew', 'football'].includes(contentType);
        const numCols = (isTablet || isTV) ? (isSport ? 4 : 5) : (isSport ? 2 : 3);
        const spacingTotal = spacing.md * 2 + (numCols - 1) * spacing.xs;
        const cardWidth = (stableWidth - spacingTotal) / numCols - 2;
        const currentBaseUrl = isSport ? SPORTS_POSTER_BASE_URL : POSTER_BASE_URL;

        const displayTitle = isSport ? (item.video_title || item.title || item.name || '') : undefined;
        const timeAgo = isSport ? getTimeAgo(item.release_date || item.created_at || item.updated_at || item.date) : undefined;

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
                title={displayTitle}
                subtitle={timeAgo}
                releaseDate={item.release_date}
                style={[styles.similarMovieCard, isSport && { marginBottom: 16 }]}
            />
        );
    };


    if (loading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Loader />
            </View>
        );
    }

    if (!movie) return null;

    const isSports = ['cricket', 'wwe', 'ufc', 'aew', 'football'].includes(contentType);


    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                 <MainHeader variant="inner" />
            </View>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                        progressBackgroundColor={colors.backgroundLight}
                    />
                }
            >
                {/* Poster + focusable Play button */}
                <View style={[styles.mediaContainer, { width: stableWidth, height: mediaHeight }]}>
                    {movie?.movie_trailer && !isTrailerEnded ? (
                        <TrailerPlayer
                            youtubeId={movie.movie_trailer}
                            onEnd={() => setIsTrailerEnded(true)}
                            width={stableWidth}
                            height={mediaHeight}
                        />
                    ) : (
                        <View style={[styles.posterWrapper, { width: stableWidth, height: mediaHeight }]}>
                            <Image
                                source={{ uri: `${isSports ? SPORTS_POSTER_BASE_URL : POSTER_BASE_URL}${movie.poster}` }}
                                style={styles.poster}
                                resizeMode="cover"
                            />
                            <View style={styles.playOverlay}>
                                {/* <FocusableButton
                                    onPress={handlePlayPress}
                                    autoFocus={true}
                                    style={styles.youtubePlayButton}
                                    focusedStyle={styles.youtubePlayButtonFocused}
                                >
                                    {(isFocused) => (
                                        <Icon name="play-arrow" size={50} color={isFocused ? colors.primary : colors.white} />
                                    )}
                                </FocusableButton> */}
                            </View>
                        </View>
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
                                    <AppText color={colors.white} size="xs" variant="bold" numberOfLines={1}>
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
                                    <AppText color={colors.white} size="xs" variant="bold" numberOfLines={1}>
                                        {movie.qualities || 'HD'}
                                    </AppText>
                                </View>
                            </>
                        )}
                    </View>

                    {/* ── Netflix-style full-width action buttons ─────────── */}
                    <View style={styles.netflixActionStack}>

                        {/* PLAY button */}
                        {(streamLink || dualStreamLink) && (
                            <FocusableButton
                                onPress={() => dualStreamLink ? setIsLanguageModalVisible(true) : handlePlayPress()}
                                style={styles.netflixPlayBtn}
                                focusedStyle={styles.netflixPlayBtnFocused}
                                autoFocus={true}
                            >
                                <Icon name="play-arrow" size={22} color={colors.white} />
                                <AppText variant="bold" style={styles.netflixPlayBtnText}>
                                    {savedProgress?.position > 0 ? 'Resume' : 'Play'}
                                </AppText>
                            </FocusableButton>
                        )}

                        {/* DOWNLOAD button */}
                        <FocusableButton
                            onPress={handleDownloadPress}
                            style={styles.netflixDownloadBtn}
                            focusedStyle={styles.netflixDownloadBtnFocused}
                        >
                            <Icon name="file-download" size={22} color={colors.white} />
                            <AppText variant="bold" style={styles.netflixDownloadBtnText}>
                                Download
                            </AppText>
                        </FocusableButton>

                    </View>

                    {/* Description Section */}
                    <View style={styles.descriptionSection}>
                        {/* Hidden text: measures actual lines on THIS device screen size */}
                        <AppText
                            style={[styles.description, { position: 'absolute', opacity: 0, zIndex: -1 }]}
                            onTextLayout={e => setFullTextLines(e.nativeEvent.lines.length)}
                        >
                            {descriptionText}
                        </AppText>
                        <AppText
                            style={styles.description}
                            numberOfLines={isDescriptionExpanded ? undefined : 3}
                        >
                            {descriptionText}
                        </AppText>
                        {fullTextLines > 3 && (
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

            {/* ─── Download Modal ─────────────────────────────────────────── */}
            <Modal
                visible={isDownloadModalVisible}
                transparent={true}
                animationType="fade"
                statusBarTranslucent={true}
                onRequestClose={() => setIsDownloadModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <AppText variant="bold" color={colors.white} style={styles.modalTitle}>
                            Select Audio Track
                        </AppText>
                        <View style={styles.modalOptions}>
                            <ModalOption
                                onPress={() => downloadTrack(downloadLink)}
                                isSelected={false}
                            >
                                <AppText color={colors.white} style={styles.modalOptionText}>
                                    English (Default)
                                </AppText>
                            </ModalOption>
                            <ModalOption
                                onPress={() => downloadTrack(dualDownloadLink)}
                                isSelected={false}
                            >
                                <AppText color={colors.white} style={styles.modalOptionText}>
                                    Hindi (Dual Audio)
                                </AppText>
                            </ModalOption>
                        </View>
                        <ModalOption
                            onPress={() => setIsDownloadModalVisible(false)}
                            isSelected={false}
                        >
                            <AppText variant="bold" color="#E50914" style={{ textAlign: 'center' }}>
                                CANCEL
                            </AppText>
                        </ModalOption>
                    </View>
                </View>
            </Modal>

            {/* ─── Language Modal ──────────────────────────────────────────── */}
            <Modal
                visible={isLanguageModalVisible}
                transparent={true}
                animationType="fade"
                statusBarTranslucent={true}
                onRequestClose={() => setIsLanguageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.dropdownModalContent}>
                        <AppText variant="bold" color={colors.white} style={styles.modalTitle}>
                            Select Language
                        </AppText>
                        <ModalOption
                            onPress={() => {
                                setSelectedLanguage('English');
                                setIsLanguageModalVisible(false);
                                handlePlayPress('English');
                            }}
                            isSelected={selectedLanguage === 'English'}
                        >
                            <AppText color={colors.white} style={styles.modalOptionText}>English</AppText>
                            {selectedLanguage === 'English' && (
                                <Icon name="check" size={20} color={colors.primary} />
                            )}
                        </ModalOption>
                        <ModalOption
                            onPress={() => {
                                setSelectedLanguage('Hindi');
                                setIsLanguageModalVisible(false);
                                handlePlayPress('Hindi');
                            }}
                            isSelected={selectedLanguage === 'Hindi'}
                        >
                            <AppText color={colors.white} style={styles.modalOptionText}>Hindi</AppText>
                            {selectedLanguage === 'Hindi' && (
                                <Icon name="check" size={20} color={colors.primary} />
                            )}
                        </ModalOption>
                        <ModalOption
                            onPress={() => setIsLanguageModalVisible(false)}
                            isSelected={false}
                        >
                            <AppText variant="bold" color="#E50914" style={{ textAlign: 'center' }}>
                                CANCEL
                            </AppText>
                        </ModalOption>
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
        height: undefined, // height comes from mediaHeight via inline style
    },
    poster: {
        width: '100%',
        height: '100%',
    },
    mediaContainer: {
        // height is set inline via mediaHeight (stableWidth * 9/16)
        backgroundColor: colors.black,
    },
    introVideo: {
        height: '100%',
    },
    content: {
        padding: spacing.md,
    },
    contentLoader: {
        flex: 1,
        minHeight: 300,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: moderateScale(28, 0.4),
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
        flexWrap: 'wrap',
        rowGap: 6,
        marginBottom: spacing.md,
    },
    infoItem: {
        marginRight: spacing.sm,
        fontSize: 14,
    },

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
    youtubePlayButtonFocused: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderColor: colors.primary,
        borderWidth: 3,
        transform: [{ scale: 1.1 }],
    },
    // ── Netflix-style full-width action stack ────────────────────────────
    netflixActionStack: {
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    netflixPlayBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 6,
        gap: 8,
    },
    netflixPlayBtnFocused: {
        backgroundColor: '#ff2d3d',
        transform: [{ scale: 1.02 }],
    },
    netflixPlayBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    netflixDownloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2a2a2a',
        paddingVertical: 14,
        borderRadius: 6,
        gap: 8,
        borderWidth: 1,
        borderColor: '#444',
    },
    netflixDownloadBtnFocused: {
        backgroundColor: '#3a3a3a',
        borderColor: colors.primary,
        borderWidth: 1.5,
        transform: [{ scale: 1.02 }],
    },
    netflixDownloadBtnText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    youtubeActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    youtubePlayNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.lg,
        paddingVertical: 10,
        borderRadius: 25,
        gap: spacing.xs,
    },
    playNowText: {
        color: colors.black,
        fontSize: 14,
        fontWeight: '700',
    },
    youtubeDownloadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#272727',
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
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#272727',
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderRadius: 25,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: '#444',
    },
    dropdownText: {
        color: colors.white,
        fontSize: 14,
    },
    // Focused state for action row buttons
    actionButtonFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: 'rgba(229,9,20,0.15)',
    },
    defaultFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    dropdownModalContent: {
        width: '80%',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 24,
        elevation: 10,
    },
    activeModalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        justifyContent: 'flex-start',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        marginBottom: spacing.md,
    },
    actionItem: {
        alignItems: 'center',
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
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 6,
    },
    modalOptionFocused: {
        backgroundColor: 'rgba(229,9,20,0.25)',
        borderColor: colors.primary,
        borderWidth: 1.5,
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