import React, { useEffect, useRef, useState } from 'react';
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
    const { videoUrl, movieTitle } = route.params;
    const videoRef = useRef(null);
    const controlTimerRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isSpeedModalVisible, setIsSpeedModalVisible] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
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

<<<<<<< HEAD
            if (NavigationBar && typeof NavigationBar.show === 'function') {
                NavigationBar.show();
            }
=======
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
>>>>>>> 44aadc5 (phase 1 changes)

            if (controlTimerRef.current) clearTimeout(controlTimerRef.current);
        };
    }, []);

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
    };

    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
<<<<<<< HEAD
                {/* <Video
=======
                <Video
>>>>>>> 44aadc5 (phase 1 changes)
                    ref={videoRef}
                    source={{ uri: videoUrl }}
                    style={styles.video}
                    resizeMode="contain"
                    paused={paused}
                    rate={playbackSpeed}
                    onLoad={onLoad}
                    onProgress={onProgress}
                    onBuffer={({ isBuffering }) => setLoading(isBuffering)}
                    controls={false}
<<<<<<< HEAD
                /> */}
=======
                />
>>>>>>> 44aadc5 (phase 1 changes)

                {/* Overlay Toggle Area - Fixed Touch Detection */}
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={toggleControls}
                >
                    {loading && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#E50914" />
                        </View>
                    )}
                </Pressable>

                {/* Controls Overlay */}
                {(showControls || isLocked) && (
                    <View style={styles.overlay} pointerEvents="box-none">

                        {/* Lock State UI */}
                        {isLocked ? (
                            <View style={styles.lockOverlay} pointerEvents="box-none">
                                <TouchableOpacity
                                    style={styles.unlockButton}
                                    onPress={toggleLock}
                                >
                                    <Icon name="lock" size={30} color={colors.white} />
                                    <AppText size="xs" color={colors.white} style={styles.lockLabel}>Screen Locked</AppText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                {/* Top Bar */}
                                <View style={styles.topBar}>
                                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                                        <Icon name="arrow-back" size={30} color={colors.white} />
                                    </TouchableOpacity>
                                    <AppText color={colors.white} variant="bold" style={styles.movieTitle}>
                                        {movieTitle || 'Movie Title'}
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

                                    <View style={styles.bottomNav}>
                                        <TouchableOpacity style={styles.bottomNavItem} onPress={openSpeedModal}>
                                            <Icon name="speed" size={24} color={colors.white} />
                                            <AppText size="xs" color={colors.white} style={styles.navLabel}>Speed ({playbackSpeed}x)</AppText>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.bottomNavItem}>
                                            <Icon name="collections-bookmark" size={24} color={colors.white} />
                                            <AppText size="xs" color={colors.white} style={styles.navLabel}>Episodes</AppText>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.bottomNavItem}>
                                            <Icon name="chat-bubble-outline" size={24} color={colors.white} />
                                            <AppText size="xs" color={colors.white} style={styles.navLabel}>Audio & Subtitles</AppText>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.bottomNavItem}>
                                            <Icon name="skip-next" size={24} color={colors.white} />
                                            <AppText size="xs" color={colors.white} style={styles.navLabel}>Next</AppText>
                                        </TouchableOpacity>
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
                        <AppText variant="bold" color={colors.white} style={styles.modalTitle}>Playback Speed</AppText>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    unlockButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    lockLabel: {
        marginTop: 10,
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    bottomNavItem: {
        alignItems: 'center',
        minWidth: 80,
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
