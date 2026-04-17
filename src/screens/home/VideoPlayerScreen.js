import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Dimensions,
    Pressable,
    Modal,
    Platform,
    FlatList,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import NavigationBar from 'react-native-system-navigation-bar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoPlayerScreen = ({ route, navigation }) => {
    const { 
        videoUrl: initialVideoUrl, 
        dualaudioUrl: initialDualAudioUrl, 
        movieTitle, 
        posterUrl,
        isSeries = false,
        episodes = [],
        initialIndex = 0
    } = route.params;

    
    const videoRef = useRef(null);
    const controlTimerRef = useRef(null);
    const resumeTimeRef = useRef(0);
    const countdownTimerRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isSpeedModalVisible, setIsSpeedModalVisible] = useState(false);
    const [isAudioModalVisible, setIsAudioModalVisible] = useState(false);
    const [isEpisodesModalVisible, setIsEpisodesModalVisible] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    
    // Series State
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(initialVideoUrl);
    const [currentDualAudioUrl, setCurrentDualAudioUrl] = useState(initialDualAudioUrl);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdownValue, setCountdownValue] = useState(5);

    // Buffer configuration for better loading on slow networks
    const bufferConfig = {
        minBufferMs: 15000,
        maxBufferMs: 50000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000
    };

    useFocusEffect(
        useCallback(() => {
            Orientation.lockToLandscape();
            StatusBar.setHidden(true, 'fade');

            // Safety checks for NavigationBar - using stickyImmersive for Netflix-like behavior
            const initImmersive = async () => {
                if (NavigationBar) {
                    try {
                        if (typeof NavigationBar.stickyImmersive === 'function') {
                            await NavigationBar.stickyImmersive();
                        } else if (typeof NavigationBar.hide === 'function') {
                            await NavigationBar.hide();
                        }
                    } catch (e) {
                        console.log('NavigationBar immersive failed:', e);
                    }
                }
            };

            initImmersive();

            if (Platform.OS === 'android') {
                StatusBar.setTranslucent(true);
            }
           
            return () => {
                Orientation.lockToPortrait();
                StatusBar.setHidden(false, 'fade');

                const restoreNav = async () => {
                    if (NavigationBar) {
                        try {
                            if (typeof NavigationBar.fullScreen === 'function') {
                                await NavigationBar.fullScreen(false);
                            }
                            if (typeof NavigationBar.show === 'function') {
                                await NavigationBar.show();
                            }
                        } catch (e) {
                            console.log('NavigationBar restore failed:', e);
                        }
                    }
                };
                restoreNav();

                if (controlTimerRef.current) clearTimeout(controlTimerRef.current);
            };
        }, [])
    );

    useEffect(() => {
        if (showControls && !paused && !isLocked) {
            startControlTimer();
        }
    }, [showControls, paused, isLocked]);

    const startControlTimer = () => {
        if (controlTimerRef.current) clearTimeout(controlTimerRef.current);
        controlTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 5000);
    };

    const toggleControls = () => {
        setShowControls(!showControls);
    };

    const handlePlayPause = () => {
        setPaused(!paused);
        if (showControls) startControlTimer();
    };

    const handleSkip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.seek(currentTime + seconds);
            if (showControls) startControlTimer();
        }
    };

    const onProgress = (data) => {
        setCurrentTime(data.currentTime);
    };

    const onLoad = (data) => {
        setDuration(data.duration);
        setLoading(false);
        if (resumeTimeRef.current > 0 && videoRef.current) {
            videoRef.current.seek(resumeTimeRef.current);
            resumeTimeRef.current = 0; // reset after seeking
        }
    };

    const onVideoEnd = () => {
        if (isSeries && episodes && currentIndex < episodes.length - 1) {
            startCountdown();
        }
    };

    const startCountdown = () => {
        setPaused(true);
        setShowCountdown(true);
        setCountdownValue(5);
        
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        
        countdownTimerRef.current = setInterval(() => {
            setCountdownValue((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownTimerRef.current);
                    playEpisode(currentIndex + 1);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const cancelCountdown = () => {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setShowCountdown(false);
        setPaused(false);
    };

    const playEpisode = (index) => {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        setShowCountdown(false);
        setCurrentIndex(index);
        
        const ep = episodes[index];
        const newVideoUrl = ep.tvShow_link || ep.movie_link || ep.videoUrl;
        const newDualUrl = ep.dual_link || ep.dualaudio_link || ep.dualaudioUrl;
        
        setCurrentVideoUrl(newVideoUrl);
        setCurrentDualAudioUrl(newDualUrl);
        setLoading(true);
        setPaused(false);
        setCurrentTime(0);
    };

    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const getDisplayTitle = () => {
        if (!isSeries || !episodes[currentIndex]) return movieTitle;
        const ep = episodes[currentIndex];
        
        // Format season and episode for title like "S1-E1-8 Stranger Things"
        const s = ep.season?.match(/\d+/)?.[0] || '1';
        const e = ep.episode?.replace(/Episode\s+/i, 'E')?.replace(/\s+to\s+/i, '-') || '';
        
        return `S${s}-${e} ${movieTitle}`;
    };

    const openSpeedModal = () => {
        setPaused(true);
        setIsSpeedModalVisible(true);
    };

    const closeSpeedModal = () => {
        setIsSpeedModalVisible(false);
        setPaused(false);
    };

    const selectSpeed = (rate) => {
        setPlaybackSpeed(rate);
        closeSpeedModal();
    };

    const openAudioModal = () => {
        if (!currentDualAudioUrl || currentDualAudioUrl === '') {
            alert('Dual Audio track is not available.');
            return;
        }
        setPaused(true);
        setIsAudioModalVisible(true);
    };

    const closeAudioModal = () => {
        setIsAudioModalVisible(false);
        setPaused(false);
    };

    const openEpisodesModal = () => {
        setPaused(true);
        setIsEpisodesModalVisible(true);
    };

    const closeEpisodesModal = () => {
        setIsEpisodesModalVisible(false);
        setPaused(false);
    };

    const selectAudio = (url) => {
        if (url !== currentVideoUrl) {
            resumeTimeRef.current = currentTime; // save current time before switching stream
            setCurrentVideoUrl(url);
        }
        closeAudioModal();
    };

    const toggleLock = () => {
        setIsLocked(!isLocked);
        if (!isLocked) {
            setShowControls(false); // Hide everything else when locking
        } else {
            setShowControls(true);
            startControlTimer();
        }
    };

    const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <View style={styles.container}>
            <View style={styles.videoWrapper}>
                <Video
                    ref={videoRef}
                    source={{ uri: currentVideoUrl }}
                    style={styles.video}
                    resizeMode="contain"
                    paused={paused}
                    rate={playbackSpeed}
                    onLoad={onLoad}
                    onProgress={onProgress}
                    onEnd={onVideoEnd}
                    onBuffer={({ isBuffering }) => setLoading(isBuffering)}
                    controls={false}
                    bufferConfig={bufferConfig}
                    poster={posterUrl}
                    posterResizeMode="cover"
                    playInBackground={false}
                    playWhenInactive={false}
                />

                {/* Overlay Toggle Area - Fixed Touch Detection */}
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={toggleControls}
                >
                    {loading && !showCountdown && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#E50914" />
                        </View>
                    )}
                </Pressable>

                {/* Next Episode Countdown Overlay */}
                {showCountdown && (
                    <View style={styles.countdownOverlay}>
                        <AppText variant="bold" size="lg" color={colors.white} style={styles.countdownText}>
                            Next Episode Playing in {countdownValue}...
                        </AppText>
                        <TouchableOpacity style={styles.playNowButton} onPress={() => playEpisode(currentIndex + 1)}>
                            <Icon name="play-arrow" size={30} color={colors.white} />
                            <AppText variant="bold" color={colors.white}>PLAY NOW</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelCountdownButton} onPress={cancelCountdown}>
                            <AppText color={colors.white}>CANCEL</AppText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Controls Overlay */}
                {(showControls || isLocked) && (
                    <View style={styles.overlay} pointerEvents="box-none">

                        {/* Lock State UI */}
                        {isLocked ? (
                            <View style={styles.lockOverlay} pointerEvents="box-none">
                                <View style={styles.topBar}>
                                    <View style={styles.iconButton} />
                                    <View style={{ flex: 1 }} />
                                    <TouchableOpacity
                                        style={styles.unlockButton}
                                        onPress={toggleLock}
                                    >
                                        <Icon name="lock" size={30} color={colors.white} />
                                        <AppText size="xs" color={colors.white} style={styles.lockLabel}>Screen Locked</AppText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <>
                                {/* Top Bar */}
                                <View style={styles.topBar}>
                                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                                        <Icon name="arrow-back" size={30} color={colors.white} />
                                    </TouchableOpacity>
                                    <AppText color={colors.white} variant="bold" style={styles.movieTitle} numberOfLines={1}>
                                        {getDisplayTitle()}
                                    </AppText>
                                    <View style={styles.topRightIcons}>
                                        <TouchableOpacity style={styles.iconButton} onPress={toggleLock}>
                                            <Icon name="lock-open" size={24} color={colors.white} />
                                            <AppText size="xs" color={colors.white} style={styles.smallIconLabel}>Lock</AppText>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Center Controls */}
                                <View style={styles.centerControls}>
                                    <TouchableOpacity onPress={() => handleSkip(-10)} style={styles.centerIcon}>
                                        <Icon name="replay-10" size={50} color={colors.white} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handlePlayPause} style={styles.playIconContainer}>
                                        <Icon name={paused ? "play-arrow" : "pause"} size={80} color={colors.white} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleSkip(10)} style={styles.centerIcon}>
                                        <Icon name="forward-10" size={50} color={colors.white} />
                                    </TouchableOpacity>
                                </View>

                                {/* Bottom Bar */}
                                <View style={styles.bottomBar}>
                                    <View style={styles.seekContainer}>
                                        <View style={styles.progressBar}>
                                            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                                            <View style={[styles.progressKnob, { left: `${progressPercentage}%` }]} />
                                        </View>
                                        <View style={styles.timeRow}>
                                            <AppText color={colors.white} size="sm" variant="bold">{formatTime(currentTime)}</AppText>
                                            <AppText color={colors.white} size="sm" variant="bold">-{formatTime(duration - currentTime)}</AppText>
                                        </View>
                                    </View>

                                    <View style={[styles.bottomNav, isSeries && { justifyContent: 'space-between' }]}>
                                        <TouchableOpacity style={styles.bottomNavItem} onPress={openSpeedModal}>
                                            <Icon name="speed" size={24} color={colors.white} />
                                            <AppText size="xs" color={colors.white} style={styles.navLabel}>Speed ({playbackSpeed}x)</AppText>
                                        </TouchableOpacity>

                                        {isSeries && (
                                            <TouchableOpacity style={styles.bottomNavItem} onPress={openEpisodesModal}>
                                                <Icon name="collections-bookmark" size={24} color={colors.white} />
                                                <AppText size="xs" color={colors.white} style={styles.navLabel}>Episodes</AppText>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity style={styles.bottomNavItem} onPress={openAudioModal}>
                                            <Icon name="chat-bubble-outline" size={24} color={colors.white} />
                                            <AppText size="xs" color={colors.white} style={styles.navLabel}>Audio</AppText>
                                        </TouchableOpacity>

                                        {isSeries && currentIndex < episodes.length - 1 && (
                                            <TouchableOpacity style={styles.bottomNavItem} onPress={() => playEpisode(currentIndex + 1)}>
                                                <Icon name="skip-next" size={24} color={colors.white} />
                                                <AppText size="xs" color={colors.white} style={styles.navLabel}>Next</AppText>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                )}
            </View>

            {/* Speed Selection Modal */}
            <Modal
                visible={isSpeedModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeSpeedModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* <AppText variant="bold" color={colors.white} style={styles.modalTitle}>Playback Speed</AppText> */}
                        <View style={styles.modalOptions}>
                            {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                                <TouchableOpacity
                                    key={rate}
                                    style={styles.speedOption}
                                    onPress={() => selectSpeed(rate)}
                                >
                                    <View style={[styles.radio, playbackSpeed === rate && styles.radioActive]}>
                                        {playbackSpeed === rate && <View style={styles.radioInner} />}
                                    </View>
                                    <AppText color={colors.white} style={styles.speedText}>
                                        {rate === 1 ? '1x (Normal)' : `${rate}x`}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.modalCancelButton} onPress={closeSpeedModal}>
                            <AppText variant="bold" color={colors.white}>CANCEL</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Audio Selection Modal */}
            <Modal
                visible={isAudioModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeAudioModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* <AppText variant="bold" color={colors.white} style={styles.modalTitle}>Audio Track</AppText> */}
                        <View style={styles.modalOptions}>
                            {[
                                { label: 'English (Default)', url: episodes[currentIndex]?.tvShow_link || initialVideoUrl },
                                { label: 'Hindi (Dual Audio)', url: episodes[currentIndex]?.dual_link || initialDualAudioUrl }
                            ].map((option) => (
                                <TouchableOpacity
                                    key={option.label}
                                    style={styles.speedOption}
                                    onPress={() => selectAudio(option.url)}
                                >
                                    <View style={[styles.radio, currentVideoUrl === option.url && styles.radioActive]}>
                                        {currentVideoUrl === option.url && <View style={styles.radioInner} />}
                                    </View>
                                    <AppText color={colors.white} style={styles.speedText}>
                                        {option.label}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={styles.modalCancelButton} onPress={closeAudioModal}>
                            <AppText variant="bold" color={colors.white}>CANCEL</AppText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Episodes Selection Modal */}
            <Modal
                visible={isEpisodesModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeEpisodesModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { width: '80%', maxHeight: '70%' }]}>
                        <AppText variant="bold" color={colors.white} style={styles.modalTitle}>Episodes</AppText>
                        <FlatList
                            data={episodes}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={[styles.episodeItem, currentIndex === index && styles.activeEpisodeItem]}
                                    onPress={() => {
                                        playEpisode(index);
                                        closeEpisodesModal();
                                    }}
                                >
                                    <View style={styles.episodeInfo}>
                                        <AppText variant="bold" color={colors.white}>{item.season}</AppText>
                                        <AppText color={colors.textSecondary} size="sm">{item.episode}</AppText>
                                    </View>
                                    {currentIndex === index && <Icon name="play-circle-outline" size={24} color={colors.primary} />}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.modalCancelButton} onPress={closeEpisodesModal}>
                            <AppText variant="bold" color={colors.white}>CLOSE</AppText>
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
        backgroundColor: colors.black,
    },
    videoWrapper: {
        flex: 1,
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 40,
    },
    lockOverlay: {
        flex: 1,
    },
    unlockButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    lockLabel: {
        marginTop: 8,
        fontSize: 10,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    movieTitle: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10,
    },
    topRightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        alignItems: 'center',
        padding: 5,
    },
    smallIconLabel: {
        fontSize: 10,
        marginTop: 2,
    },
    centerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerIcon: {
        marginHorizontal: 80,
    },
    playIconContainer: {
        padding: 10,
    },
    bottomBar: {
        width: '100%',
    },
    seekContainer: {
        width: '100%',
        marginBottom: 15,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        position: 'relative',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#E50914', // Netflix Red
        borderRadius: 2,
    },
    progressKnob: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#E50914',
        position: 'absolute',
        top: -5,
        marginLeft: -7,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    bottomNavItem: {
        alignItems: 'center',
        minWidth: 80,
        marginHorizontal: 15,
    },
    navLabel: {
        marginTop: 6,
        fontSize: 11,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '40%',
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 24,
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    countdownText: {
        marginBottom: 30,
    },
    playNowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 4,
        marginBottom: 20,
    },
    cancelCountdownButton: {
        padding: 10,
    },
    episodeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    activeEpisodeItem: {
        backgroundColor: 'rgba(229, 9, 20, 0.1)',
    },
    episodeInfo: {
        flex: 1,
    },
    modalOptions: {
        marginBottom: 20,
    },
    speedOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
    },
    radio: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.white,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioActive: {
        borderColor: colors.white,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.white,
    },
    speedText: {
        fontSize: 16,
    },
    modalCancelButton: {
        alignSelf: 'flex-end',
        padding: 10,
    },
});

export default VideoPlayerScreen;
