import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Image,
    Dimensions,
    TouchableOpacity,
    Pressable,
    Platform,
    StatusBar,
    FlatList,
    Modal,
    Linking,
    PermissionsAndroid,
    Share,
    useWindowDimensions,
    RefreshControl,
    ToastAndroid,
    Alert,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Icon from '../../components/common/SvgIcon';
import Video from 'react-native-video';
import TrailerPlayer from '../../components/common/TrailerPlayer';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import { movieService } from '../../services/movieService';
import { TV_SHOWS_POSTER_BASE_URL } from '../../utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, isTablet, isTV, SCREEN_WIDTH } from '../../utils/responsive';
import Loader from '../../components/common/Loader';
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

const SeriesDetailScreen = ({ route, navigation }) => {
    const { width: currentWidth, height: currentHeight } = useWindowDimensions();
    const portraitWidth = currentWidth < currentHeight ? currentWidth : currentHeight;
    const stableWidth = (isTablet || isTV) ? currentWidth : portraitWidth;

    const insets = useSafeAreaInsets();
    const { id, contentType = 'web_series' } = route.params;

    // Dynamic 16:9 height so the trailer/poster fills full width without black bars.
    // On TV/tablet cap it so the trailer doesn't cover the whole screen and the Play button stays visible.
    const mediaHeight = Math.round((isTV || isTablet) ? Math.min(stableWidth * 9 / 16, currentHeight * 0.6) : stableWidth * 9 / 16);
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isInMyList, setIsInMyList] = useState(false);
    const [isDownloadModalVisible, setIsDownloadModalVisible] = useState(false);
    const [currentDownloadLinks, setCurrentDownloadLinks] = useState({ eng: null, hin: null });
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
    const [activeEpisodeIndex, setActiveEpisodeIndex] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [isTrailerEnded, setIsTrailerEnded] = useState(false);

    // Saved watch progress -> Play button shows "Resume" and targets the saved episode
    const savedProgress = useSavedProgress(
        makeProgressKey({ contentType, contentId: movie?.id ?? id, isSeries: true, title: movie?.title }),
    );

    // State for season accordion
    const [expandedSeasons, setExpandedSeasons] = useState({});
    const toggleSeason = (name) => setExpandedSeasons(prev => ({ ...prev, [name]: !prev[name] }));

    useEffect(() => {
        const fetchSeriesData = async () => {
            setIsTrailerEnded(false);
            setLoading(true);
            try {
                let response;
                if (contentType === 'tv_show') {
                    response = await movieService.getTVShowById(id);
                } else if (contentType === 'tv_serial') {
                    response = await movieService.getTVSerialById(id);
                } else {
                    response = await movieService.getWebSeriesById(id);
                }

                if (response.status && response.data) {
                    const seriesData = response.data?.tvshows?.[0] ||
                        response.data?.tvshows?.data?.[0] ||
                        (Array.isArray(response.data) ? response.data[0] : response.data);

                    if (seriesData && seriesData.links) {
                        seriesData.links.sort((a, b) => {
                            const sA = parseInt(a.season?.match(/\d+/)?.[0] || 0);
                            const sB = parseInt(b.season?.match(/\d+/)?.[0] || 0);
                            if (sA !== sB) return sA - sB;

                            const eA = parseInt(a.episode?.match(/\d+/)?.[0] || 0);
                            const eB = parseInt(b.episode?.match(/\d+/)?.[0] || 0);
                            return eA - eB;
                        });

                    }

                    setMovie(seriesData);
                } else {
                    alert('Series details not found');
                    navigation.goBack();
                }
            } catch (error) {
                console.error('Error fetching series details:', error);
                alert('Failed to load series details');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchSeriesData();
        }
    }, [id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            let response;
            if (contentType === 'tv_show') {
                response = await movieService.getTVShowById(id);
            } else if (contentType === 'tv_serial') {
                response = await movieService.getTVSerialById(id);
            } else {
                response = await movieService.getWebSeriesById(id);
            }

            if (response.status && response.data) {
                const seriesData = response.data?.tvshows?.[0] ||
                    response.data?.tvshows?.data?.[0] ||
                    (Array.isArray(response.data) ? response.data[0] : response.data);

                if (seriesData && seriesData.links) {
                    seriesData.links.sort((a, b) => {
                        const sA = parseInt(a.season?.match(/\d+/)?.[0] || 0);
                        const sB = parseInt(b.season?.match(/\d+/)?.[0] || 0);
                        if (sA !== sB) return sA - sB;
                        const eA = parseInt(a.episode?.match(/\d+/)?.[0] || 0);
                        const eB = parseInt(b.episode?.match(/\d+/)?.[0] || 0);
                        return eA - eB;
                    });
                }
                setMovie(seriesData);
            }
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [id, contentType]);


    const handlePlayPress = (index = 0, forcedLang) => {
        if (!movie) return;
        const ep = movie.links?.[index];
        if (ep) {
            const langToUse = forcedLang || selectedLanguage;
            let finalUrl = ep.tvShow_link;
            let secondaryUrl = ep.dual_link;

            if (langToUse === 'Hindi' && ep.dual_link) {
                finalUrl = ep.dual_link;
                secondaryUrl = ep.tvShow_link;
            }

            navigation.navigate('VideoPlayer', {
                videoUrl: finalUrl,
                dualaudioUrl: secondaryUrl,
                movieTitle: movie.title,
                isSeries: true,
                episodes: movie.links,
                initialIndex: index,
                contentId: movie.id ?? id,
                contentType,
                posterUrl: `${TV_SHOWS_POSTER_BASE_URL}${movie.poster}`,
            });
        } else {
            alert('Video link not available');
        }
    };

    const handleDownloadRequest = (eng, hin) => {
        setCurrentDownloadLinks({ eng, hin });
        if (hin && hin !== '') {
            setIsDownloadModalVisible(true);
        } else if (eng) {
            executeDownload(eng);
        } else {
            alert('Download link not available');
        }
    };

    const executeDownload = async (url) => {
        if (!movie) return;
        try {
            movieService.updateDownloadCount({ id: movie.id, type: 'tvshow' });

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
                fileName = `${movie.title.replace(/[^a-zA-Z0-9]/g, '_')}_episode.mp4`;
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
                        description: 'Downloading episode...',
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
                        Alert.alert('Download Failed', `Could not download the video. Please try again.`);
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

    const toggleDescription = () => setIsDescriptionExpanded(!isDescriptionExpanded);
    const toggleMyList = () => setIsInMyList(!isInMyList);

    const handleShare = async () => {
        if (!movie) return;
        try {
            await Share.share({
                message: `Check out "${movie.title}" on Fundady! \n\n${movie.description ? movie.description.substring(0, 150) + '...' : ''}`,
                url: 'https://fundady.com',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const descriptionText = movie?.description || '';
    const [fullTextLines, setFullTextLines] = useState(0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <View style={styles.headerContainer}>
                <MainHeader variant="inner" />
            </View>

            {loading ? (
                <View style={styles.centered}>
                   <Loader />
                </View>
            ) : !movie ? null : (
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
                    {/* Poster + focusable Play button or Trailer */}
                    <View style={[styles.mediaContainer, { width: stableWidth, height: mediaHeight }]}>
                        {(movie?.trailer_link || movie?.movie_trailer || movie?.trailer) && !isTrailerEnded ? (
                            <TrailerPlayer
                                youtubeId={movie?.trailer_link || movie?.movie_trailer || movie?.trailer}
                                onEnd={() => setIsTrailerEnded(true)}
                                width={stableWidth}
                                height={mediaHeight}
                            />
                        ) : (
                            <View style={[styles.posterWrapper, { width: stableWidth, height: mediaHeight }]}>
                                <Image
                                    source={{ uri: `${TV_SHOWS_POSTER_BASE_URL}${movie.poster}` }}
                                    style={styles.poster}
                                    resizeMode="cover"
                                />
                                <View style={styles.playOverlay}>
                                    {/* <FocusableButton
                                        onPress={() => handlePlayPress(0)}
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

                    {/* Content Details */}
                    <View style={styles.contentContainer}>
                        <AppText variant="bold" size="headingLg" style={styles.seriesTitle}>{movie.title}</AppText>

                        <View style={styles.infoRow}>
                            <AppText color={colors.textSecondary} style={styles.infoItem}>
                                {movie.release_date?.split('-')[0] || 'N/A'}
                            </AppText>
                            <View style={styles.ratingBadge}>
                                <AppText color={colors.black} size="xs" variant="bold">IMDb {movie.imdb_rating || 'N/A'}</AppText>
                            </View>
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
                                    {movie.tvqualities || 'HD'}
                                </AppText>
                            </View>
                        </View>

                        {/* ── Netflix-style full-width action buttons ─────────── */}
                        {(() => {
                            // Saved episode (if any) is the target; otherwise the first episode
                            const targetIndex = savedProgress && savedProgress.episodeIndex < (movie?.links?.length || 0)
                                ? savedProgress.episodeIndex
                                : 0;
                            const firstEp = movie?.links?.[targetIndex];
                            const isResume = savedProgress?.position > 0;
                            // Build 'S1E1' label from season / episode strings
                            const seasonNum = firstEp?.season?.match(/\d+/)?.[0];
                            const episodeNum = firstEp?.episode?.match(/\d+/)?.[0];
                            const epLabel = (seasonNum && episodeNum)
                                ? `S${seasonNum}E${episodeNum}`
                                : (seasonNum ? `S${seasonNum}E1` : 'E1');
                            const hasDual = !!firstEp?.dual_link;

                            return (
                                <View style={styles.netflixActionStack}>
                                    {/* PLAY / RESUME button */}
                                    {firstEp && (
                                        <FocusableButton
                                            onPress={() => {
                                                if (hasDual) {
                                                    setActiveEpisodeIndex(targetIndex);
                                                    setIsLanguageModalVisible(true);
                                                } else {
                                                    handlePlayPress(targetIndex);
                                                }
                                            }}
                                            style={styles.netflixPlayBtn}
                                            focusedStyle={styles.netflixPlayBtnFocused}
                                            autoFocus={true}
                                        >
                                            <Icon name="play-arrow" size={22} color={colors.white} />
                                            <AppText variant="bold" style={styles.netflixPlayBtnText}>
                                                {isResume ? 'Resume' : 'Play'}: {epLabel}
                                            </AppText>
                                        </FocusableButton>
                                    )}
                                </View>
                            );
                        })()}

                        {/* Description */}
                        <View style={styles.descriptionSection}>
                            {/* Hidden text: measures actual lines on THIS device screen size */}
                            <AppText
                                style={[styles.description, { position: 'absolute', opacity: 0, zIndex: -1 }]}
                                onTextLayout={e => setFullTextLines(e.nativeEvent.lines.length)}
                            >
                                {descriptionText}
                            </AppText>
                            <AppText style={styles.description} numberOfLines={isDescriptionExpanded ? undefined : 3}>
                                {descriptionText}
                            </AppText>
                            {fullTextLines > 3 && (
                                <TouchableOpacity onPress={toggleDescription}>
                                    <AppText color={colors.white} variant="bold" style={styles.moreButton}>
                                        {isDescriptionExpanded ? 'less' : 'more'}
                                    </AppText>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.creditSection}>
                            <AppText color={colors.textMuted} size="sm">
                                Genre:{' '}
                                <AppText color={colors.textSecondary} size="sm">
                                    {movie.genre || 'N/A'}
                                </AppText>
                            </AppText>
                        </View>


                        {/* Episodes List Section */}
                        <View style={styles.episodesSection}>
                            <View style={styles.sectionHeader}>
                                <AppText variant="bold" color={colors.white} style={styles.sectionTitle}>Episodes</AppText>
                            </View>
                            {/* Group episodes by season */}
                            {(() => {
                                const seasonMap = {};
                                (movie.links || []).forEach((ep, idx) => {
                                    const seasonName = ep.season || 'Season 1';
                                    if (!seasonMap[seasonName]) seasonMap[seasonName] = [];
                                    seasonMap[seasonName].push({ item: ep, index: idx });
                                });
                                return Object.entries(seasonMap).map(([seasonName, eps]) => (
                                    <View key={seasonName} style={styles.seasonContainer}>
                                        <FocusableButton
                                            onPress={() => toggleSeason(seasonName)}
                                            style={styles.seasonHeader}
                                            focusedStyle={styles.seasonHeaderFocused}
                                            hasTVPreferredFocus={isTV}
                                        >
                                            <AppText variant="bold" color={colors.white} style={styles.seasonHeaderText}>{seasonName}</AppText>
                                            <Icon
                                                name="keyboard-arrow-down"
                                                size={20}
                                                color={colors.white}
                                                style={{
                                                    transform: [{ rotate: expandedSeasons[seasonName] ? '180deg' : '0deg' }]
                                                }}
                                            />
                                        </FocusableButton>
                                        {expandedSeasons[seasonName] && (
                                            <View style={styles.seasonEpisodesList}>
                                                {eps.map(({ item, index }) => (
                                                    <EpisodeRow
                                                        key={index}
                                                        item={item}
                                                        index={index}
                                                        movie={movie}
                                                        selectedLanguage={selectedLanguage}
                                                        onPlay={() => handlePlayPress(index)}
                                                        onLangPress={() => {
                                                            setActiveEpisodeIndex(index);
                                                            setIsLanguageModalVisible(true);
                                                        }}
                                                        onDownload={() => handleDownloadRequest(item.download_link, item.dual_download_link || item.dual_link)}
                                                    />
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ));
                            })()}
                        </View>
                    </View>
                </ScrollView>
            )}

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
                                onPress={() => { executeDownload(currentDownloadLinks.eng); setIsDownloadModalVisible(false); }}
                                isSelected={false}
                            >
                                <AppText color={colors.white} style={styles.modalOptionText}>English (Default)</AppText>
                            </ModalOption>
                            <ModalOption
                                onPress={() => { executeDownload(currentDownloadLinks.hin); setIsDownloadModalVisible(false); }}
                                isSelected={false}
                            >
                                <AppText color={colors.white} style={styles.modalOptionText}>Hindi (Dual Audio)</AppText>
                            </ModalOption>
                        </View>
                        <ModalOption
                            onPress={() => setIsDownloadModalVisible(false)}
                            isSelected={false}
                        >
                            <AppText variant="bold" color={colors.primary} style={{ textAlign: 'center' }}>CANCEL</AppText>
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
                        <AppText variant="bold" color={colors.white} style={styles.modalTitle}>Select Language</AppText>
                        <ModalOption
                            onPress={() => {
                                setSelectedLanguage('English');
                                setIsLanguageModalVisible(false);
                                handlePlayPress(activeEpisodeIndex, 'English');
                            }}
                            isSelected={selectedLanguage === 'English'}
                        >
                            <AppText color={colors.white} style={styles.modalOptionText}>English</AppText>
                            {selectedLanguage === 'English' && <Icon name="check" size={20} color={colors.primary} />}
                        </ModalOption>
                        <ModalOption
                            onPress={() => {
                                setSelectedLanguage('Hindi');
                                setIsLanguageModalVisible(false);
                                handlePlayPress(activeEpisodeIndex, 'Hindi');
                            }}
                            isSelected={selectedLanguage === 'Hindi'}
                        >
                            <AppText color={colors.white} style={styles.modalOptionText}>Hindi</AppText>
                            {selectedLanguage === 'Hindi' && <Icon name="check" size={20} color={colors.primary} />}
                        </ModalOption>
                        <ModalOption
                            onPress={() => setIsLanguageModalVisible(false)}
                            isSelected={false}
                        >
                            <AppText variant="bold" color={colors.primary} style={{ textAlign: 'center' }}>CANCEL</AppText>
                        </ModalOption>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

// ─── Episode Row with focusable play / lang / download buttons ───────────────
const EpisodeRow = ({ item, index, movie, selectedLanguage, onPlay, onLangPress, onDownload }) => {
    return (
        <View style={styles.episodeCard}>
            <View style={styles.episodeMain}>
                {/* Focusable play thumbnail */}
                <FocusableButton
                    onPress={onPlay}
                    style={styles.episodeImageWrapper}
                    focusedStyle={styles.episodeImageFocused}
                >
                    <Image
                        source={{ uri: `${TV_SHOWS_POSTER_BASE_URL}${movie.poster}` }}
                        style={styles.episodeThumb}
                    />
                    <View style={styles.miniPlayIcon}>
                        <Icon name="play-arrow" size={16} color={colors.white} />
                    </View>
                </FocusableButton>

                <View style={styles.episodeInfo}>
                    <AppText variant="bold" color={colors.white} size="md">{item.season}</AppText>
                    <AppText color={colors.textSecondary} size="sm" style={styles.episodeSubtitle}>{item.episode}</AppText>
                </View>

                <View style={styles.episodeActions}>
                    {item.dual_link && (
                        <FocusableButton
                            onPress={onLangPress}
                            style={styles.episodeDropdown}
                            focusedStyle={styles.episodeActionFocused}
                        >
                            <AppText variant="bold" style={styles.episodeLangText}>
                                {selectedLanguage.substring(0, 3).toUpperCase()}
                            </AppText>
                            <Icon name="keyboard-arrow-down" size={14} color={colors.white} />
                        </FocusableButton>
                    )}

                    <FocusableButton
                        onPress={onDownload}
                        style={styles.episodeDownloadBtn}
                        focusedStyle={styles.episodeActionFocused}
                    >
                        <Icon name="file-download" size={20} color={colors.white} />
                    </FocusableButton>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: colors.black,
        paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
        paddingBottom: spacing.sm,
    },
    backButton: { padding: 5 },
    scrollView: { flex: 1 },
    mediaContainer: {
        // height is set inline via mediaHeight (stableWidth * 9/16)
        backgroundColor: colors.black,
    },
    introVideo: {
        height: '100%',
    },
    posterWrapper: {
        // height is set inline via mediaHeight (stableWidth * 9/16)
    },
    poster: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
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
        backgroundColor:'rgba(0,0,0,0.5)',
        borderColor: colors.primary,
        borderWidth: 3,
        transform: [{ scale: 1.1 }],
    },
    defaultFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
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
        paddingVertical: 10,
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
    contentContainer: { padding: spacing.md },
    movieTitle: { marginBottom: spacing.sm },
    seriesTitle: {
        color: colors.white,
        fontSize: moderateScale(28, 0.4),
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, flexWrap: 'wrap', rowGap: 6, marginTop: spacing.sm },
    infoItem: { marginRight: spacing.md },
    ratingBadge: { backgroundColor: '#f5c518', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: spacing.sm },
    hdBadge: {
        borderWidth: 1,
        borderColor: colors.textSecondary,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
    },
    descriptionSection: { marginBottom: spacing.sm },
    description: { color: colors.white, lineHeight: 20 },
    moreButton: { fontSize: 14, marginTop: 2 },
    creditSection: { marginBottom: spacing.lg },
    episodesSection: { marginTop: spacing.md },
    sectionHeader: { marginBottom: spacing.lg },
    activeIndicator: { height: 4, backgroundColor: colors.primary, width: 80, position: 'absolute', top: -10 },
    sectionTitle: { fontSize: moderateScale(18, 0.4) },
    seasonContainer: {
        marginBottom: spacing.md,
    },
    seasonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 6,
        marginHorizontal: spacing.sm,
        marginBottom: spacing.xs,
        borderWidth: 1,
        borderColor: '#262626',
    },
    seasonHeaderFocused: {
        borderColor: colors.primary,
        borderWidth: 1.5,
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
    },
    seasonHeaderText: {
        color: colors.white,
        fontSize: 16,
    },
    seasonEpisodesList: {
        marginTop: spacing.sm,
    },
    episodeCard: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        marginHorizontal: spacing.sm,
    },
    episodeMain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    episodeImageWrapper: {
        width: 110,
        height: 62,
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
        backgroundColor: '#141414',
    },
    episodeImageFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    episodeThumb: {
        width: '100%',
        height: '100%',
        opacity: 0.85,
    },
    miniPlayIcon: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -15,
        marginTop: -15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.white,
    },
    episodeInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    episodeSubtitle: {
        marginTop: 4,
    },
    episodeDownloadBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1f1f1f',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    episodeDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1f1f1f',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 4,
        gap: 4,
        borderWidth: 1,
        borderColor: '#333',
    },
    episodeActionFocused: {
        borderColor: colors.primary,
        borderWidth: 1.5,
        backgroundColor: 'rgba(229, 9, 20, 0.15)',
    },
    episodeLangText: {
        fontSize: 11,
        color: colors.white,
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
    episodeActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 24,
        elevation: 10,
    },
    modalTitle: { fontSize: 18, marginBottom: 20 },
    modalOptions: { marginBottom: spacing.md },
    modalOption: {
        paddingVertical: 15,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    modalOptionFocused: {
        backgroundColor: 'rgba(229,9,20,0.25)',
        borderColor: colors.primary,
    },
    modalOptionText: { fontSize: 16 },
    modalCancelButton: { alignSelf: 'flex-end', marginTop: 15, padding: 10 },
});

export default SeriesDetailScreen;