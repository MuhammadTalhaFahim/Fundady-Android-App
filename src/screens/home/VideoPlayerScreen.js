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
    PanResponder,
    useWindowDimensions,
    findNodeHandle,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import NavigationBar from 'react-native-system-navigation-bar';
import Icon from '../../components/common/SvgIcon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';

import { moderateScale, isTablet, isTV, SCREEN_WIDTH } from '../../utils/responsive';

// Focus-aware pressable button
const FocusableButton = React.forwardRef(({ onPress, onFocus, style, focusedStyle, children, autoFocus = false, hasTVPreferredFocus = false }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <Pressable
            ref={ref}
            onFocus={() => {
                setIsFocused(true);
                if (onFocus) onFocus();
            }}
            onBlur={() => setIsFocused(false)}
            onPress={onPress}
            autoFocus={autoFocus}
            hasTVPreferredFocus={hasTVPreferredFocus}
            focusable={true}
            style={[style, isFocused && (focusedStyle || styles.defaultFocused)]}
        >
            {typeof children === 'function' ? children(isFocused) : children}
        </Pressable>
    );
});

const VideoPlayerScreen = ({ route, navigation }) => {
    const {
        videoUrl: initialVideoUrl,
        dualaudioUrl: initialDualAudioUrl,
        movieTitle,
        posterUrl,
        isSeries = false,
        episodes: rawEpisodes = [],
        initialIndex = 0
    } = route.params;

    // Sort episodes naturally to ensure correct order
    const episodes = [...rawEpisodes].sort((a, b) => {
        const sA = parseInt(a.season?.match(/\d+/)?.[0] || 0);
        const sB = parseInt(b.season?.match(/\d+/)?.[0] || 0);
        if (sA !== sB) return sA - sB;
        
        const eA = parseInt(a.episode?.match(/\d+/)?.[0] || 0);
        const eB = parseInt(b.episode?.match(/\d+/)?.[0] || 0);
        return eA - eB;
    });

    const { width: dynamicWidth, height: dynamicHeight } = useWindowDimensions();
    const videoRef = useRef(null);
    const controlTimerRef = useRef(null);
    const resumeTimeRef = useRef(0);
    const countdownTimerRef = useRef(null);
    const handleSeekRef = useRef(null);
    const handleSkipRef = useRef(null);
    const durationRef = useRef(0);
    const screenWidthRef = useRef(dynamicWidth);
    const currentTimeRef = useRef(0);
    const speedButtonRef = useRef(null);
    const episodesButtonRef = useRef(null);

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
    const [isSeeking, setIsSeeking] = useState(false);

    // Series State
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [currentVideoUrl, setCurrentVideoUrl] = useState(initialVideoUrl);
    const [currentDualAudioUrl, setCurrentDualAudioUrl] = useState(initialDualAudioUrl);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdownValue, setCountdownValue] = useState(5);

    // TV Sentinel refs for progress-bar seeking
    const progressBarRef = useRef(null);
    const leftSentinelRef = useRef(null);
    const rightSentinelRef = useRef(null);
    const [progressBarNodeId, setProgressBarNodeId] = useState(null);
    const [leftSentinelNodeId, setLeftSentinelNodeId] = useState(null);
    const [rightSentinelNodeId, setRightSentinelNodeId] = useState(null);
    const [isProgressFocused, setIsProgressFocused] = useState(false);

    // Bounce focus back to progress bar for native continuous seek
    const bounceFocus = useCallback(() => {
        if (progressBarRef.current && typeof progressBarRef.current.setNativeProps === 'function') {
            // Temporarily set preferred focus to bounce it back
            progressBarRef.current.setNativeProps({ hasTVPreferredFocus: true });
            // Reset immediately after so it doesn't get permanently stuck
            setTimeout(() => {
                progressBarRef.current?.setNativeProps({ hasTVPreferredFocus: false });
            }, 30);
        }
    }, []);

    const consecutiveSkipsRef = useRef(0);
    const lastSkipTimeRef = useRef(0);

    const getDynamicSkipAmount = useCallback(() => {
        const now = Date.now();
        // If the next skip happens within 400ms, consider it a continuous hold
        if (now - lastSkipTimeRef.current < 400) {
            consecutiveSkipsRef.current += 1;
        } else {
            consecutiveSkipsRef.current = 1;
        }
        lastSkipTimeRef.current = now;

        const skips = consecutiveSkipsRef.current;
        if (skips > 15) return 120; // 2 minutes jump per tick after long hold
        if (skips > 8) return 60;   // 1 minute jump per tick
        if (skips > 4) return 30;   // 30 seconds jump per tick
        return 10;                  // Default 10 seconds
    }, []);

    const handleLeftFocus = useCallback(() => {
        const amount = getDynamicSkipAmount();
        handleSkipRef.current?.(-amount);
        setTimeout(bounceFocus, 10);
    }, [bounceFocus, getDynamicSkipAmount]);

    const handleRightFocus = useCallback(() => {
        const amount = getDynamicSkipAmount();
        handleSkipRef.current?.(amount);
        setTimeout(bounceFocus, 10);
    }, [bounceFocus, getDynamicSkipAmount]);

    // Buffer configuration for better loading on slow networks
    const bufferConfig = {
        minBufferMs: 15000,
        maxBufferMs: 50000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000
    };

    useFocusEffect(
        useCallback(() => {
            // Force landscape for everyone when playing video
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
                // ONLY lock back to portrait on phones
                if (!isTablet && !isTV) {
                    Orientation.lockToPortrait();
                }
                
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
                if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            };
        }, [])
    );

    useEffect(() => {
        if (showControls && !paused && !isLocked) {
            startControlTimer();
        }
    }, [showControls, paused, isLocked]);

    // ── TV: keep a ref so the sentinel knows the latest showControls value ────
    const showControlsRef = useRef(showControls);
    useEffect(() => { showControlsRef.current = showControls; }, [showControls]);

    const startControlTimer = () => {
        // Auto-hide timer disabled per user request to keep controls focused
    };

    const toggleControls = () => {
        setShowControls(prev => !prev);
    };

    const handlePlayPause = () => {
        setPaused(!paused);
        if (showControls) startControlTimer();
    };

    const handleSkip = (seconds) => {
        if (videoRef.current) {
            setIsSeeking(true);
            const newTime = Math.max(0, Math.min(durationRef.current, currentTimeRef.current + seconds));
            console.log('[VideoPlayerScreen] handleSkip called:', seconds, 'currentTime:', currentTimeRef.current, 'newTime:', newTime, 'duration:', durationRef.current);
            videoRef.current.seek(newTime);
            setCurrentTime(newTime);
            currentTimeRef.current = newTime;
            
            if (controlTimerRef.current) clearTimeout(controlTimerRef.current);
            startControlTimer();

            // Ignore progress updates for 1 second to let the player stabilize
            setTimeout(() => {
                setIsSeeking(false);
            }, 1000);
        }
    };

    const onProgress = (data) => {
        if (!isSeeking) {
            setCurrentTime(data.currentTime);
            currentTimeRef.current = data.currentTime;
        }
    };

    const onLoad = (data) => {
        setDuration(data.duration);
        durationRef.current = data.duration;
        setLoading(false);
        if (resumeTimeRef.current > 0 && videoRef.current) {
            videoRef.current.seek(resumeTimeRef.current);
            resumeTimeRef.current = 0; // reset after seeking
        }
    };

    // Keep refs in sync with state
    useEffect(() => {
        durationRef.current = duration;
    }, [duration]);

    useEffect(() => {
        screenWidthRef.current = dynamicWidth;
    }, [dynamicWidth]);

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
        currentTimeRef.current = 0;
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
        let e = ep.episode?.replace(/Episode\s+/i, 'E')?.replace(/\s+to\s+/i, '-') || '';
        // If it's just a number, prepend E
        if (/^\d+$/.test(e)) e = `E${e}`;

        return `S${s}-${e} ${movieTitle}`;
    };

    const openSpeedModal = () => {
        setPaused(true);
        setIsSpeedModalVisible(true);
    };

    const closeSpeedModal = () => {
        setIsSpeedModalVisible(false);
        setPaused(false);
        if (isTV) {
            setTimeout(() => {
                if (speedButtonRef.current && typeof speedButtonRef.current.setNativeProps === 'function') {
                    speedButtonRef.current.setNativeProps({ hasTVPreferredFocus: true });
                    setTimeout(() => {
                        speedButtonRef.current?.setNativeProps({ hasTVPreferredFocus: false });
                    }, 50);
                }
            }, 100);
        }
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
        if (isTV) {
            setTimeout(() => {
                if (episodesButtonRef.current && typeof episodesButtonRef.current.setNativeProps === 'function') {
                    episodesButtonRef.current.setNativeProps({ hasTVPreferredFocus: true });
                    setTimeout(() => {
                        episodesButtonRef.current?.setNativeProps({ hasTVPreferredFocus: false });
                    }, 50);
                }
            }, 100);
        }
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

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                setIsSeeking(true);
                if (handleSeekRef.current) handleSeekRef.current(evt);
                if (controlTimerRef.current) clearTimeout(controlTimerRef.current);
            },
            onPanResponderMove: (evt, gestureState) => {
                if (handleSeekRef.current) handleSeekRef.current(evt);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (videoRef.current) {
                    const { pageX } = evt.nativeEvent;
                    const currentBarWidth = screenWidthRef.current - 80;
                    const barStart = 40;
                    let finalProgress = (pageX - barStart) / currentBarWidth;
                    if (finalProgress < 0) finalProgress = 0;
                    if (finalProgress > 1) finalProgress = 1;
                    
                    const finalTime = finalProgress * durationRef.current;
                    videoRef.current.seek(finalTime);
                    setCurrentTime(finalTime);
                    currentTimeRef.current = finalTime;

                    // Keep isSeeking true for a moment to ignore stale progress reports
                    setTimeout(() => {
                        setIsSeeking(false);
                    }, 1000);
                } else {
                    setIsSeeking(false);
                }
                startControlTimer();
            },
            onPanResponderTerminate: () => {
                setIsSeeking(false);
                startControlTimer();
            },
        })
    ).current;

    const handleSeek = (evt) => {
        const { pageX } = evt.nativeEvent;
        const currentBarWidth = screenWidthRef.current - 80;
        const barStart = 40;
        
        let newProgress = (pageX - barStart) / currentBarWidth;
        if (newProgress < 0) newProgress = 0;
        if (newProgress > 1) newProgress = 1;
        
        if (durationRef.current > 0) {
            const newTime = newProgress * durationRef.current;
            setCurrentTime(newTime);
            currentTimeRef.current = newTime;
        }
    };

    useEffect(() => {
        handleSeekRef.current = handleSeek;
        handleSkipRef.current = handleSkip;
    });

    // TV Note: DPAD Left/Right are navigation keys consumed by Android's focus
    // system — they NEVER reach TVEventHandler. Seeking is done by navigating
    // to the replay-10 / forward-10 Pressable buttons and pressing OK (select).

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

                {/* Loading indicator — pointerEvents none so it never blocks D-pad */}
                {loading && !showCountdown && (
                    <View style={[StyleSheet.absoluteFill, styles.loaderContainer]} pointerEvents="none">
                        <ActivityIndicator size="large" color="#E50914" />
                    </View>
                )}

                {/* Touch-only tap-to-toggle (phone/tablet only) */}
                {!isTV && (
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={toggleControls}
                        focusable={false}
                    />
                )}

                {/*
                  TV SENTINEL: When controls are hidden this invisible Pressable
                  holds hasTVPreferredFocus so the very next D-pad key lands here.
                  Its onFocus callback shows the controls, then it disappears and
                  hasTVPreferredFocus moves to the real Play button.
                */}
                {isTV && !showControls && (
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        focusable={true}
                        hasTVPreferredFocus={true}
                        onFocus={() => setShowControls(true)}
                    />
                )}

                {/* Next Episode Countdown Overlay */}
                {/* {showCountdown && (
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
                )} */}

                {/* Controls Overlay */}
                {(showControls || isLocked) && (
                    <View style={styles.overlay} pointerEvents="box-none">

                        {/* Lock State UI */}
                        {isLocked ? (
                            <View style={styles.lockOverlay} pointerEvents="box-none">
                                <View style={styles.topBar}>
                                    <View style={styles.iconButton} />
                                    <View style={{ flex: 1 }} />
                                    <FocusableButton
                                        style={styles.unlockButton}
                                        focusedStyle={styles.unlockButtonFocused}
                                        onPress={toggleLock}
                                        hasTVPreferredFocus={isTV && isLocked}
                                    >
                                        {(isFocused) => (
                                            <>
                                                <Icon name="lock" size={30} color={isFocused ? colors.primary : colors.white} />
                                                <AppText size="xs" color={isFocused ? colors.primary : colors.white} style={styles.lockLabel}>Screen Locked</AppText>
                                            </>
                                        )}
                                    </FocusableButton>
                                </View>
                            </View>
                        ) : (
                            <>
                                {/* Top Bar */}
                                <View style={styles.topBar}>
                                    <FocusableButton 
                                        onPress={() => navigation.goBack()} 
                                        onFocus={startControlTimer}
                                        style={styles.iconButton}
                                        focusedStyle={styles.iconButtonFocused}
                                    >
                                        {(isFocused) => (
                                            <Icon name="close" size={30} color={isFocused ? colors.primary : colors.white} />
                                        )}
                                    </FocusableButton>
                                    <AppText color={colors.white} variant="bold" style={styles.movieTitle} numberOfLines={1}>
                                        {getDisplayTitle()}
                                    </AppText>
                                    <View style={styles.topRightIcons}>
                                        <FocusableButton 
                                            onPress={toggleLock}
                                            onFocus={startControlTimer}
                                            style={styles.iconButton}
                                            focusedStyle={styles.iconButtonFocused}
                                        >
                                            {(isFocused) => (
                                                <>
                                                    <Icon name="lock-open" size={24} color={isFocused ? colors.primary : colors.white} />
                                                    <AppText size="xs" color={isFocused ? colors.primary : colors.white} style={styles.smallIconLabel}>Lock</AppText>
                                                </>
                                            )}
                                        </FocusableButton>
                                    </View>
                                </View>

                                {/* Center Controls */}
                                <View style={styles.centerControls}>
                                    <FocusableButton 
                                        onPress={() => handleSkip(-10)} 
                                        onFocus={startControlTimer}
                                        style={styles.centerIcon}
                                        focusedStyle={styles.centerIconFocused}
                                    >
                                        {(isFocused) => (
                                            <Icon name="replay-10" size={50} color={isFocused ? colors.primary : colors.white} />
                                        )}
                                    </FocusableButton>
                                    <FocusableButton 
                                        onPress={handlePlayPause} 
                                        onFocus={startControlTimer}
                                        style={styles.playIconContainer}
                                        focusedStyle={styles.playIconContainerFocused}
                                        hasTVPreferredFocus={isTV && showControls}
                                    >
                                        {(isFocused) => (
                                            <Icon name={paused ? "play-arrow" : "pause"} size={80} color={isFocused ? colors.primary : colors.white} />
                                        )}
                                    </FocusableButton>
                                    <FocusableButton 
                                        onPress={() => handleSkip(10)} 
                                        onFocus={startControlTimer}
                                        style={styles.centerIcon}
                                        focusedStyle={styles.centerIconFocused}
                                    >
                                        {(isFocused) => (
                                            <Icon name="forward-10" size={50} color={isFocused ? colors.primary : colors.white} />
                                        )}
                                    </FocusableButton>
                                </View>

                                {/* Bottom Bar */}
                                <View style={styles.bottomBar}>
                                    <View 
                                        style={styles.seekContainer}
                                        {...(!isTV ? panResponder.panHandlers : {})}
                                    >
                                        {/* 
                                          SENTINEL PATTERN (Netflix-style TV seeking):
                                          Two invisible Pressables sit left/right of the progress bar.
                                          nextFocusLeft/Right on progress bar point to them.
                                          DPAD Left → left sentinel gets focus → seek(-10) → bounce focus back to bar.
                                          Because focus returns to bar, holding the key repeats this natively!
                                        */}
                                        {isTV && (
                                            <Pressable
                                                ref={leftSentinelRef}
                                                focusable={true}
                                                style={[styles.hiddenSentinel, { left: 0 }]}
                                                onLayout={() => {
                                                    const id = findNodeHandle(leftSentinelRef.current);
                                                    if (id) setLeftSentinelNodeId(id);
                                                }}
                                                onFocus={() => {
                                                    setIsProgressFocused(true);
                                                    handleLeftFocus();
                                                }}
                                                {...(progressBarNodeId ? { nextFocusRight: progressBarNodeId } : {})}
                                            />
                                        )}

                                        <Pressable
                                            ref={progressBarRef}
                                            style={[styles.progressBar, isProgressFocused && styles.progressBarFocused]}
                                            focusable={isTV ? true : false}
                                            hasTVPreferredFocus={false}
                                            onLayout={() => {
                                                const id = findNodeHandle(progressBarRef.current);
                                                if (id) setProgressBarNodeId(id);
                                            }}
                                            onFocus={() => {
                                                setIsProgressFocused(true);
                                                startControlTimer();
                                            }}
                                            onBlur={() => setIsProgressFocused(false)}
                                            onPress={handlePlayPause}
                                            {...(isTV && leftSentinelNodeId ? { nextFocusLeft: leftSentinelNodeId } : {})}
                                            {...(isTV && rightSentinelNodeId ? { nextFocusRight: rightSentinelNodeId } : {})}
                                        >
                                            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                                            <View style={[styles.progressKnob, isProgressFocused && styles.progressKnobFocused, { left: `${progressPercentage}%` }]} />
                                        </Pressable>

                                        {isTV && (
                                            <Pressable
                                                ref={rightSentinelRef}
                                                focusable={true}
                                                style={[styles.hiddenSentinel, { right: 0 }]}
                                                onLayout={() => {
                                                    const id = findNodeHandle(rightSentinelRef.current);
                                                    if (id) setRightSentinelNodeId(id);
                                                }}
                                                onFocus={() => {
                                                    setIsProgressFocused(true);
                                                    handleRightFocus();
                                                }}
                                                {...(progressBarNodeId ? { nextFocusLeft: progressBarNodeId } : {})}
                                            />
                                        )}

                                        <View style={styles.timeRow}>
                                            <AppText color={colors.white} size="sm" variant="bold">{formatTime(currentTime)}</AppText>
                                            <AppText color={colors.white} size="sm" variant="bold">-{formatTime(duration - currentTime)}</AppText>
                                        </View>
                                    </View>

                                    <View style={styles.bottomNav}>
                                        <FocusableButton 
                                            ref={speedButtonRef}
                                            onPress={openSpeedModal}
                                            onFocus={startControlTimer}
                                            style={styles.bottomNavItem}
                                            focusedStyle={styles.bottomNavItemFocused}
                                        >
                                            {(isFocused) => (
                                                <>
                                                    <Icon name="speed" size={24} color={isFocused ? colors.primary : colors.white} />
                                                    <AppText size="xs" color={isFocused ? colors.primary : colors.white} style={styles.navLabel}>Speed ({playbackSpeed}x)</AppText>
                                                </>
                                            )}
                                        </FocusableButton>

                                        {/* <FocusableButton 
                                            onPress={openAudioModal}
                                            onFocus={startControlTimer}
                                            style={styles.bottomNavItem}
                                            focusedStyle={styles.bottomNavItemFocused}
                                        >
                                            {(isFocused) => (
                                                <>
                                                    <Icon name="headset" size={24} color={isFocused ? colors.primary : colors.white} />
                                                    <AppText size="xs" color={isFocused ? colors.primary : colors.white} style={styles.navLabel}>Audio</AppText>
                                                </>
                                            )}
                                        </FocusableButton> */}

                                        {isSeries && (
                                            <FocusableButton 
                                                ref={episodesButtonRef}
                                                onPress={openEpisodesModal}
                                                onFocus={startControlTimer}
                                                style={styles.bottomNavItem}
                                                focusedStyle={styles.bottomNavItemFocused}
                                            >
                                                {(isFocused) => (
                                                    <>
                                                        <Icon name="collections-bookmark" size={24} color={isFocused ? colors.primary : colors.white} />
                                                        <AppText size="xs" color={isFocused ? colors.primary : colors.white} style={styles.navLabel}>Episodes</AppText>
                                                    </>
                                                )}
                                            </FocusableButton>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                )}
            </View>

            {/* Speed Selection Modal */}
            {/* Speed Selection Modal */}
            {isSpeedModalVisible && (
                <View style={styles.fullscreenOverlay}>
                    <Pressable style={styles.modalOverlay} onPress={closeSpeedModal}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalOptions}>
                                {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
                                    <FocusableButton
                                        key={rate}
                                        style={styles.speedOption}
                                        focusedStyle={styles.speedOptionFocused}
                                        hasTVPreferredFocus={playbackSpeed === rate}
                                        onPress={() => selectSpeed(rate)}
                                    >
                                        {(isFocused) => (
                                            <>
                                                <View style={[styles.radio, playbackSpeed === rate && styles.radioActive]}>
                                                    {playbackSpeed === rate && <View style={styles.radioInner} />}
                                                </View>
                                                <AppText color={isFocused ? colors.primary : colors.white} style={styles.speedText}>
                                                    {rate === 1 ? '1x (Normal)' : `${rate}x`}
                                                </AppText>
                                            </>
                                        )}
                                    </FocusableButton>
                                ))}
                            </View>
                            <FocusableButton 
                                style={styles.modalCancelButton} 
                                focusedStyle={styles.defaultFocused}
                                onPress={closeSpeedModal}
                            >
                                <AppText variant="bold" color={colors.white}>CANCEL</AppText>
                            </FocusableButton>
                        </View>
                    </Pressable>
                </View>
            )}

            {/* Audio Selection Modal */}
            {/* {isAudioModalVisible && (
                <View style={styles.fullscreenOverlay}>
                    <Pressable style={styles.modalOverlay} onPress={closeAudioModal}>
                        <View style={styles.modalContent}>
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
                    </Pressable>
                </View>
            )} */}

            {/* Episodes Selection Modal */}
            {isEpisodesModalVisible && (
                <View style={styles.fullscreenOverlay}>
                    <Pressable style={styles.modalOverlay} onPress={closeEpisodesModal}>
                        <View style={[styles.modalContent, { width: '80%', maxHeight: '70%' }]}>
                            <AppText variant="bold" color={colors.white} style={styles.modalTitle}>Episodes</AppText>
                            <FlatList
                                data={episodes}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => (
                                    <FocusableButton
                                        style={[styles.episodeItem, currentIndex === index && styles.activeEpisodeItem]}
                                        focusedStyle={styles.episodeItemFocused}
                                        hasTVPreferredFocus={isEpisodesModalVisible && currentIndex === index}
                                        onPress={() => {
                                            playEpisode(index);
                                            closeEpisodesModal();
                                        }}
                                    >
                                        {(isFocused) => (
                                            <>
                                                <View style={styles.episodeInfo}>
                                                    <AppText variant="bold" color={isFocused ? colors.primary : colors.white}>{item.season}</AppText>
                                                    <AppText color={isFocused ? colors.primary : colors.textSecondary} size="sm">{item.episode}</AppText>
                                                </View>
                                                {currentIndex === index && <Icon name="play-circle-outline" size={24} color={isFocused ? colors.primary : colors.primary} />}
                                            </>
                                        )}
                                    </FocusableButton>
                                )}
                            />
                            <FocusableButton 
                                style={styles.modalCancelButton} 
                                focusedStyle={styles.defaultFocused}
                                onPress={closeEpisodesModal}
                            >
                                <AppText variant="bold" color={colors.white}>CLOSE</AppText>
                            </FocusableButton>
                        </View>
                    </Pressable>
                </View>
            )}
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
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    iconButtonFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(229,9,20,0.15)',
    },
    smallIconLabel: {
        fontSize: 10,
        marginTop: 2,
    },
    unlockButtonFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(229,9,20,0.2)',
    },
    centerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerIcon: {
        marginHorizontal: 80,
        borderRadius: 50,
        padding: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    centerIconFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(229,9,20,0.15)',
    },
    playIconContainer: {
        padding: 10,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    playIconContainerFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(229,9,20,0.15)',
    },
    defaultFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    bottomBar: {
        width: '100%',
    },
    seekContainer: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        marginBottom: 15,
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        position: 'relative',
    },
    progressBarFocused: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 4,
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
    progressKnobFocused: {
        width: 20,
        height: 20,
        borderRadius: 10,
        top: -6,
        marginLeft: -10,
        borderWidth: 1.5,
        borderColor: colors.white,
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
        gap: 10,
    },
    bottomNavItem: {
        alignItems: 'center',
        minWidth: 80,
        marginHorizontal: 15,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    bottomNavItemFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(229,9,20,0.15)',
    },
    navLabel: {
        marginTop: 6,
        fontSize: 11,
    },
    // Invisible Pressable used for TV DPAD Left/Right sentinel seeking
    hiddenSentinel: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    fullscreenOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2000,
        backgroundColor: 'black', // Solid black background to prevent any leaking
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.98)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: isTV ? '30%' : isTablet ? '35%' : '45%',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
        paddingHorizontal: 10,
        borderWidth: 1.5,
        borderColor: 'transparent',
        borderRadius: 8,
    },
    episodeItemFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(229,9,20,0.15)',
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
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    speedOptionFocused: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(229,9,20,0.15)',
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
