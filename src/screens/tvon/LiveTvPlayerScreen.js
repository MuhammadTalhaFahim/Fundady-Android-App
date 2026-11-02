import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
<<<<<<< HEAD
  FlatList,
  StatusBar,
  Image,
  TextInput,
  Pressable,
  TouchableOpacity,
  TVEventHandler,
=======
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Image,
  TextInput,
  Keyboard,
  Pressable,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import NavigationBar from 'react-native-system-navigation-bar';
import Video from 'react-native-video';
<<<<<<< HEAD
import { CastButton, useRemoteMediaClient, useMediaStatus, MediaPlayerState, MediaStreamType } from 'react-native-google-cast';
import Icon from '../../components/common/SvgIcon';
=======
import Icon from 'react-native-vector-icons/MaterialIcons';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import { movieService } from '../../services/movieService';
import { CHANNELS_POSTER_BASE_URL } from '../../utils/constants';
<<<<<<< HEAD
import { isTV } from '../../utils/responsive';
import Loader from '../../components/common/Loader';

// Pick the stream type for react-native-video from the channel data instead of forcing HLS.
// A backend `type`/`format` field wins if present; otherwise it is detected from the URL.
// Returning undefined lets ExoPlayer detect progressive files (mp4, ts, mkv...) by itself.
const getStreamType = (channel) => {
  const backendType = String(channel?.type || channel?.format || '').toLowerCase().trim();
  if (backendType) {
    if (['m3u8', 'hls'].includes(backendType)) return 'm3u8';
    if (['mpd', 'dash'].includes(backendType)) return 'mpd';
    if (['ism', 'smooth'].includes(backendType)) return 'ism';
    return undefined;
  }

  const url = String(channel?.channel_id || '').toLowerCase().split(/[?#]/)[0];
  if (url.endsWith('.m3u8') || url.endsWith('.m3u')) return 'm3u8';
  if (url.endsWith('.mpd')) return 'mpd';
  if (url.endsWith('.ism/manifest') || url.endsWith('.ism')) return 'ism';
  return undefined;
};

// MIME type the Chromecast receiver needs for each stream type
const CAST_CONTENT_TYPES = {
  m3u8: 'application/x-mpegurl',
  mpd: 'application/dash+xml',
  ism: 'application/vnd.ms-sstr+xml',
};

const getCastContentType = (channel) => {
  const type = getStreamType(channel);
  if (type) return CAST_CONTENT_TYPES[type];
  const url = String(channel?.channel_id || '').toLowerCase().split(/[?#]/)[0];
  return url.endsWith('.ts') ? 'video/mp2t' : 'video/mp4';
};

// TV focus-aware button helper
const FocusableButton = ({ onPress, onFocus, style, focusedStyle, children, autoFocus = false, hasTVPreferredFocus = false }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Pressable
      onFocus={() => { setIsFocused(true); if (onFocus) onFocus(); }}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      autoFocus={autoFocus}
      hasTVPreferredFocus={hasTVPreferredFocus}
      focusable={true}
      style={[style, isFocused && (focusedStyle || { borderColor: colors.primary, borderWidth: 2, backgroundColor: 'rgba(229,9,20,0.15)' })]}
    >
      {typeof children === 'function' ? children(isFocused) : children}
    </Pressable>
  );
};

// TV focus-aware channel playlist item
const ChannelPlaylistItem = ({ item, index, isActive, onPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Pressable
      focusable={true}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      style={[
        styles.channelItem,
        isActive && styles.activeChannelItem,
        isFocused && {
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderColor: colors.primary,
          borderWidth: 1.5,
        }
      ]}
    >
      <AppText style={[styles.channelNumber, (isActive || isFocused) && styles.activeText]} variant="bold">
        {index + 1}
      </AppText>
      <View style={[
        styles.channelLogoContainer,
        isFocused && { borderColor: colors.primary }
      ]}>
        <Image
          source={{ uri: `${CHANNELS_POSTER_BASE_URL}${item.poster}` }}
          style={styles.channelLogoList}
          resizeMode="contain"
        />
      </View>
      <View style={styles.channelDetails}>
        <AppText
          style={styles.channelName}
          color={isActive || isFocused ? colors.white : colors.textPrimary}
          variant={isActive || isFocused ? "bold" : "regular"}
        >
          {item.name}
        </AppText>
        <AppText
          style={styles.programText}
          color={isActive || isFocused ? 'rgba(255,255,255,0.8)' : colors.textMuted}
          size="xs"
        >
          {isActive ? "Now Playing" : "Press to play"}
        </AppText>
      </View>
      {isActive && <View style={styles.activeIndicatorEdge} />}
    </Pressable>
  );
};
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

const LiveTvPlayerScreen = ({ route, navigation }) => {
  // We assume route.params contains the initially selected channel
  const initialChannel = route.params?.channel || null;
  const categoryId = route.params?.categoryId || null;
  const categoryName = route.params?.categoryName || 'ALL';

  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(initialChannel);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [categories, setCategories] = useState([]);
  const [currentCategoryId, setCurrentCategoryId] = useState(categoryId);
  const [currentCategoryName, setCurrentCategoryName] = useState(categoryName);

  const [isMaximized, setIsMaximized] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [paused, setPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const controlsTimerRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      Orientation.lockToLandscape();
      StatusBar.setHidden(true, 'fade');

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

      // Time updater
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }, [])
  );

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const catRes = await movieService.getTVCategories();
        if (catRes.status && catRes.data && catRes.data.channelCat) {
          setCategories(catRes.data.channelCat);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        // Fetch channels for the currently selected inner category
        const res = await movieService.searchTVChannels('', currentCategoryId);
        if (res.status && res.data && res.data.channels) {
          setChannels(res.data.channels);
          // Only auto-select active channel on the very first load if none was passed
          if (!activeChannel && !initialChannel && res.data.channels.length > 0) {
            setActiveChannel(res.data.channels[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching channels for player:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategoryId]); // Re-run when the local category changes

  const filteredChannels = useMemo(() => {
    return channels.filter(ch => ch.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [channels, searchQuery]);

  const handleNextCategory = () => {
    if (categories.length === 0) return;
    const allList = [{ id: null, name: 'ALL' }, ...categories];
    const currentIndex = allList.findIndex(c => c.id === currentCategoryId);
    const nextIndex = (currentIndex + 1) % allList.length;
    const nextCat = allList[nextIndex];
    setCurrentCategoryId(nextCat.id);
    setCurrentCategoryName(nextCat.name);
  };

  const handlePrevCategory = () => {
    if (categories.length === 0) return;
    const allList = [{ id: null, name: 'ALL' }, ...categories];
    const currentIndex = allList.findIndex(c => c.id === currentCategoryId);
    const prevIndex = currentIndex <= 0 ? allList.length - 1 : currentIndex - 1;
    const prevCat = allList[prevIndex];
    setCurrentCategoryId(prevCat.id);
    setCurrentCategoryName(prevCat.name);
  };

  const handleChannelSelect = (channel) => {
<<<<<<< HEAD
    if (activeChannel?.id === channel.id) {
      setVideoLoading(true);
      setActiveChannel(null);
      setTimeout(() => setActiveChannel(channel), 100);
    } else {
=======
    if (activeChannel?.id !== channel.id) {
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
      setVideoLoading(true);
      setActiveChannel(channel);
    }
  };

  const startControlsTimer = () => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
<<<<<<< HEAD
    }, 5000);
  };

  const showAndResetTimer = () => {
    setShowControls(true);
    startControlsTimer();
  };

  const showControlsRef = useRef(showControls);
  useEffect(() => { showControlsRef.current = showControls; }, [showControls]);

  const showAndResetTimerRef = useRef(null);
  useEffect(() => { showAndResetTimerRef.current = showAndResetTimer; });

  useEffect(() => {
    if (isTV && typeof TVEventHandler !== 'undefined' && TVEventHandler) {
      try {
        const tvEventHandler = new TVEventHandler();
        tvEventHandler.enable(null, (cmp, evt) => {
          if (evt) {
            const wakeupKeys = ['up', 'down', 'left', 'right', 'select', 'longSelect', 'playPause', 'menu'];
            if (wakeupKeys.includes(evt.eventType)) {
              if (showAndResetTimerRef.current) {
                showAndResetTimerRef.current();
              }
            }
          }
        });
        return () => tvEventHandler.disable();
      } catch (error) {
        console.log('Failed to init TVEventHandler:', error);
      }
    }
  }, []);

=======
    }, 4000);
  };

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  const toggleControls = () => {
    setShowControls(!showControls);
    if (!showControls) startControlsTimer();
  };

  useEffect(() => {
    if (showControls) startControlsTimer();
<<<<<<< HEAD
    const currentTimer = controlsTimerRef.current;
    return () => {
      if (currentTimer) clearTimeout(currentTimer);
    };
  }, [showControls]);

  // ── Chromecast: send the active channel to the TV once a session connects ──
  // const castClient = useRemoteMediaClient();

   const castClient = useRemoteMediaClient();

  const castMediaStatus = useMediaStatus();
  const wasCastingRef = useRef(false);

  useEffect(() => {
    if (castClient && activeChannel?.channel_id) {
      castClient.loadMedia({
        autoplay: true,
        mediaInfo: {
          contentUrl: String(activeChannel.channel_id),
          contentType: getCastContentType(activeChannel),
          streamType: MediaStreamType.LIVE,
          metadata: {
            type: 'generic',
            title: activeChannel.name,
            images: activeChannel.poster ? [{ url: `${CHANNELS_POSTER_BASE_URL}${activeChannel.poster}` }] : [],
          },
        },
      }).catch((err) => console.warn('[Cast] loadMedia failed', err));
      wasCastingRef.current = true;
    } else if (!castClient && wasCastingRef.current) {
      // Cast session ended — continue the channel on the phone
      wasCastingRef.current = false;
      setPaused(false);
    }
  }, [castClient, activeChannel]);

  // Keep the play/pause icon in sync with the TV
  useEffect(() => {
    if (!castClient) return;
    if (castMediaStatus?.playerState === MediaPlayerState.PLAYING) {
      setPaused(false);
    } else if (castMediaStatus?.playerState === MediaPlayerState.PAUSED) {
      setPaused(true);
    }
  }, [castClient, castMediaStatus]);

  const handlePlayPause = () => {
    const next = !paused;
    if (castClient) {
      const action = next ? castClient.pause() : castClient.play();
      action?.catch((err) => console.warn('[Cast] play/pause failed', err));
    }
    setPaused(next);
    startControlsTimer();
  };


  const handleToggleMute = () => {
    const next = !isMuted;
    if (castClient) {
      castClient.setStreamMuted(next).catch((err) => console.warn('[Cast] mute failed', err));
    }
    setIsMuted(next);
    startControlsTimer();
  };

=======
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [showControls]);

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    // When maximizing, hide controls after a delay
    setShowControls(true);
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const formatDate = (date) => {
    const options = { month: 'long', day: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

<<<<<<< HEAD

  const renderChannelItem = ({ item, index }) => {
    const isActive = activeChannel?.id === item.id;
    return (
      <ChannelPlaylistItem
        item={item}
        index={index}
        isActive={isActive}
        onPress={() => handleChannelSelect(item)}
      />
    );
  };
  
=======
  const renderChannelItem = ({ item, index }) => {
    const isActive = activeChannel?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.channelItem, isActive && styles.activeChannelItem]}
        onPress={() => handleChannelSelect(item)}
      >
        <AppText style={[styles.channelNumber, isActive && styles.activeText]} variant="bold">
          {index + 1}
        </AppText>
        <View style={styles.channelLogoContainer}>
          <Image
            source={{ uri: `${CHANNELS_POSTER_BASE_URL}${item.poster}` }}
            style={styles.channelLogoList}
            resizeMode="contain"
          />
        </View>
        <View style={styles.channelDetails}>
          <AppText style={styles.channelName} color={isActive ? colors.white : colors.textPrimary} variant={isActive ? "bold" : "regular"}>
            {item.name}
          </AppText>
          <AppText style={styles.programText} color={isActive ? 'rgba(255,255,255,0.7)' : colors.textMuted} size="xs">
            {isActive ? "Now Playing" : "Tap to play"}
          </AppText>
        </View>
        {isActive && <View style={styles.activeIndicatorEdge} />}
      </TouchableOpacity>
    );
  };

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  return (
    <View style={styles.container}>
      {/* Top Header Layer - Absolutely Positioned to float over content */}
      {(showControls || !isMaximized) ? (
        isMaximized ? (
<<<<<<< HEAD
          <FocusableButton
            style={styles.floatingBackButton}
            focusedStyle={styles.floatingBackButtonFocused}
            onPress={() => navigation.goBack()}
          >
            {(isFocused) => (
              <Icon name="close" size={32} color={isFocused ? colors.primary : colors.white} />
            )}
          </FocusableButton>
=======
          <TouchableOpacity 
            style={styles.floatingBackButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="close" size={32} color={colors.white} />
          </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        ) : (
          <View style={styles.header}>
            {isSearchVisible ? (
              <View style={styles.searchHeaderContainer}>
<<<<<<< HEAD
                <FocusableButton style={styles.backButton} focusedStyle={styles.backButtonFocused} onPress={() => { setIsSearchVisible(false); setSearchQuery(''); }}>
                  {(isFocused) => (
                    <Icon name="close" size={28} color={isFocused ? colors.primary : colors.white} />
                  )}
                </FocusableButton>
=======
                <TouchableOpacity style={styles.backButton} onPress={() => { setIsSearchVisible(false); setSearchQuery(''); }}>
                  <Icon name="close" size={28} color={colors.white} />
                </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                <View style={styles.searchInputWrapper}>
                  <Icon name="search" size={22} color={colors.textMuted} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search channels..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
<<<<<<< HEAD
                    <FocusableButton onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                      <Icon name="close" size={22} color={colors.textMuted} />
                    </FocusableButton>
=======
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Icon name="close" size={22} color={colors.textMuted} />
                    </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                  )}
                </View>
              </View>
            ) : (
              <>
                <View style={styles.headerLeft}>
<<<<<<< HEAD
                  <FocusableButton 
                    style={styles.backButton} 
                    focusedStyle={styles.backButtonFocused}
                    onPress={() => navigation.goBack()}
                  >
                    {(isFocused) => (
                      <Icon name="close" size={28} color={isFocused ? colors.primary : colors.white} />
                    )}
                  </FocusableButton>
                  <Image source={require('../../assets/images/fundady_logo.png')} style={styles.logo} resizeMode="contain" />
                  {/* <View style={styles.divider} /> */}
                  {/* <AppText variant="bold" style={styles.headerTitle}>Live</AppText> */}
=======
                  <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="close" size={28} color={colors.white} />
                  </TouchableOpacity>
                  <Image source={require('../../assets/images/fundady_logo.png')} style={styles.logo} resizeMode="contain" />
                  <View style={styles.divider} />
                  <AppText variant="bold" style={styles.headerTitle}>Live</AppText>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                </View>

                <View style={styles.headerRight}>
                  <AppText style={styles.timeText} variant="bold">{formatTime(currentTime)}</AppText>
<<<<<<< HEAD
                  <AppText style={styles.dateText}>{formatDate(currentTime)}</AppText>
                  {/* <TouchableOpacity style={styles.iconButton} onPress={() => setIsSearchVisible(true)}>
                    <Icon name="search" size={28} color={colors.white} />
                  </TouchableOpacity> */}
                 
=======
                  {/* <AppText style={styles.dateText}>{formatDate(currentTime)}</AppText> */}
                  {/* <TouchableOpacity style={styles.iconButton} onPress={() => setIsSearchVisible(true)}>
                    <Icon name="search" size={28} color={colors.white} />
                  </TouchableOpacity> */}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                </View>
              </>
            )}
          </View>
        )
      ) : null}

      <View style={[styles.contentContainer, !isMaximized && { paddingTop: 60 }]}>
        {/* Left Sidebar - Channel List */}
        {!isMaximized && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
<<<<<<< HEAD
              <FocusableButton
                onPress={handlePrevCategory}
                style={styles.chevronButton}
              >
                {(isFocused) => (
                  <Icon name="chevron-left" size={28} color={isFocused ? colors.primary : colors.white} />
                )}
              </FocusableButton>
              <AppText variant="bold" style={styles.sidebarTitle} numberOfLines={1}>
                {currentCategoryName.toUpperCase()}
              </AppText>
              <FocusableButton
                onPress={handleNextCategory}
                style={styles.chevronButton}
              >
                {(isFocused) => (
                  <Icon name="chevron-right" size={28} color={isFocused ? colors.primary : colors.white} />
                )}
              </FocusableButton>
=======
              {/* <TouchableOpacity onPress={handlePrevCategory}>
                <Icon name="chevron-left" size={28} color={colors.white} />
              </TouchableOpacity> */}
              <TouchableOpacity >
                <Icon name="chevron-left" size={28} color={colors.white} />
              </TouchableOpacity>
              <AppText variant="bold" style={styles.sidebarTitle} numberOfLines={1}>
                {currentCategoryName.toUpperCase()}
              </AppText>
              {/* <TouchableOpacity onPress={handleNextCategory}>
                <Icon name="chevron-right" size={28} color={colors.white} />
              </TouchableOpacity> */}
              <TouchableOpacity >
                <Icon name="chevron-right" size={28} color={colors.white} />
              </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            </View>

            {loading ? (
              <View style={styles.loaderContainer}>
<<<<<<< HEAD
                <Loader />
=======
                <ActivityIndicator size="large" color={colors.primary} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              </View>
            ) : (
              <FlatList
                data={filteredChannels}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderChannelItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <View style={styles.emptyListContainer}>
                    <AppText color={colors.textMuted}>Not found</AppText>
                  </View>
                }
              />
            )}
          </View>
<<<<<<< HEAD
        )}     
=======
        )}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

        {/* Right Side - Video Player */}
        <View style={[styles.playerContainer, isMaximized && { width: '100%' }]}>
          {activeChannel ? (
<<<<<<< HEAD
            <TouchableOpacity
              style={[
                styles.videoWrapper,
                isMaximized && { paddingTop: 20 }
              ]}
              activeOpacity={1}
              onPress={!isTV ? toggleMaximize : undefined}
            >
              <View 
                style={[
                  StyleSheet.absoluteFill, 
                  isMaximized ? { top: 15, bottom: 0 } : {}
                ]} 
                pointerEvents="none"
              >
                <Video
                  ref={videoRef}
                  source={{
                    uri: activeChannel.channel_id ? String(activeChannel.channel_id) : '',
                    type: getStreamType(activeChannel)
                  }}
                  style={styles.video}
                  resizeMode="stretch"
                  onLoadStart={() => setVideoLoading(true)}
                  onReadyForDisplay={() => setVideoLoading(false)}
                  onBuffer={({ isBuffering }) => setVideoLoading(isBuffering)}
                  onError={(e) => {
                    console.warn('[LiveTV] Stream error, retrying:', e?.error?.errorString || e);
                    setVideoLoading(true);
                    const ch = activeChannel;
                    setActiveChannel(null);
                    setTimeout(() => setActiveChannel(ch), 500);
                  }}
                  controls={false}
                  paused={paused || !!castClient}
                  muted={isMuted}
                  playInBackground={false}
                  playWhenInactive={false}
                  repeat={true}
                  bufferConfig={{
                    minBufferMs: 15000,
                    maxBufferMs: 30000,
                    bufferForPlaybackMs: 2500,
                    bufferForPlaybackAfterRebufferMs: 5000
                  }}
                  preferredForwardBufferDuration={10}
                  automaticallyWaitsToMinimizeStalling={true}
                />
              </View>

              {/* TV Sentinel focus catcher when controls are hidden */}
              {isTV && !showControls && (
                <Pressable
                  style={StyleSheet.absoluteFill}
                  focusable={true}
                  hasTVPreferredFocus={true}
                  onFocus={() => {}}
                  onPress={() => {
                    if (showAndResetTimerRef.current) showAndResetTimerRef.current();
                  }}
                />
              )}

              {/* Controls Overlay — always visible, buttons sit on top of tap overlay */}
=======
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={{ uri: activeChannel.channel_id ? String(activeChannel.channel_id) : '' }}
                style={styles.video}
                resizeMode="contain"
                onLoadStart={() => setVideoLoading(true)}
                onReadyForDisplay={() => setVideoLoading(false)}
                onBuffer={({ isBuffering }) => setVideoLoading(isBuffering)}
                controls={false}
                paused={paused}
                muted={isMuted}
                playInBackground={false}
                playWhenInactive={false}
                repeat={true}
              />

              {/* Invisible pressable overlay to toggle controls */}
              <Pressable 
                style={StyleSheet.absoluteFill} 
                onPress={toggleControls} 
              />

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              {showControls && (
                <View style={styles.controlsOverlay} pointerEvents="box-none">
                  {/* Center Play/Pause */}
                  <View style={styles.centerControls} pointerEvents="box-none">
<<<<<<< HEAD
                    <FocusableButton
                      style={styles.playPauseButton}
                      focusedStyle={styles.playPauseButtonFocused}
                      onPress={handlePlayPause}
                      hasTVPreferredFocus={isTV && showControls}
                    >
                      {(isFocused) => (
                        <Icon
                          name={paused ? "play-arrow" : "pause"}
                          size={50}
                          color={isFocused ? colors.primary : colors.white}
                        />
                      )}
                    </FocusableButton>
=======
                    <TouchableOpacity 
                      style={styles.playPauseButton} 
                      onPress={() => { setPaused(!paused); startControlsTimer(); }}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name={paused ? "play-arrow" : "pause"} 
                        size={50} 
                        color={colors.white} 
                      />
                    </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                  </View>

                  {/* Bottom Controls Bar */}
                  <View style={styles.bottomControlsBar} pointerEvents="box-none">
<<<<<<< HEAD
                    <View style={styles.bottomLeftControls} pointerEvents="box-none">
                      <FocusableButton
                        style={styles.controlIconCircle}
                        focusedStyle={styles.controlIconCircleFocused}
                        onPress={handleToggleMute}
                      >
                        {(isFocused) => (
                          <Icon
                            name={isMuted ? "volume-off" : "volume-up"}
                            size={24}
                            color={isFocused ? colors.primary : colors.white}
                          />
                        )}
                      </FocusableButton>
                      {!isTV && (
                        <View style={[styles.controlIconCircle, styles.castIconCircle]}>
                          <CastButton style={styles.castButton} tintColor={colors.white} />
                        </View>
                      )}
                    </View>

                    <FocusableButton
                      style={styles.maximizeButton}
                      focusedStyle={styles.maximizeButtonFocused}
                      onPress={toggleMaximize}
                    >
                      {(isFocused) => (
                        <Icon
                          name={isMaximized ? "fullscreen-exit" : "fullscreen"}
                          size={32}
                          color={isFocused ? colors.primary : colors.white}
                        />
                      )}
                    </FocusableButton>
=======
                    <TouchableOpacity 
                      style={styles.controlIconCircle} 
                      onPress={() => { setIsMuted(!isMuted); startControlsTimer(); }}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name={isMuted ? "volume-off" : "volume-up"} 
                        size={24} 
                        color={colors.white} 
                      />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.maximizeButton} 
                      onPress={toggleMaximize}
                      activeOpacity={0.7}
                    >
                      <Icon 
                        name={isMaximized ? "fullscreen-exit" : "fullscreen"} 
                        size={32} 
                        color={colors.white} 
                      />
                    </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                  </View>
                </View>
              )}
              {videoLoading && (
                <View style={styles.videoLoaderOverlay}>
<<<<<<< HEAD
                 <Loader />
                </View>
              )}
              {/* Optional: Floating Channel Badge */}
              {/* <View style={styles.watermark}>
=======
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}

              {/* Optional: Floating Channel Badge */}
              <View style={styles.watermark}>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <AppText size="xs" variant="bold" color={colors.white}>LIVE</AppText>
                </View>
                <AppText variant="bold" color={colors.white} style={styles.watermarkText}>{activeChannel.name}</AppText>
<<<<<<< HEAD
              </View> */}
            </TouchableOpacity>
=======
              </View>
            </View>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
          ) : (
            <View style={styles.emptyPlayerContainer}>
              {!loading && <AppText color={colors.textMuted}>Select a channel to start watching</AppText>}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
<<<<<<< HEAD
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  logo: {
    height: 60,
    width: 190,
=======
  },
  logo: {
    height: 60,
    width: 120,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    marginRight: spacing.md,
  },
  divider: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    color: colors.white,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: colors.white,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  dateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginRight: spacing.xl,
  },
  iconButton: {
    padding: spacing.sm,
  },
  searchHeaderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 40,
    marginLeft: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    marginLeft: spacing.sm,
    fontSize: 15,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: '35%',
    backgroundColor: '#121212',
    borderRightWidth: 1,
    borderRightColor: '#222',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#1a1a1a',
  },
  sidebarTitle: {
    color: colors.white,
    letterSpacing: 1.5,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyListContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
  },
  activeChannelItem: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)', // modern subtle red tint instead of solid block
  },
  activeIndicatorEdge: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
  },
  channelNumber: {
    width: 30,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  activeText: {
    color: colors.primary,
  },
  channelLogoContainer: {
    width: 60,
    height: 40,
    backgroundColor: '#000',
    borderRadius: 6,
    marginHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    padding: 2,
  },
  channelLogoList: {
    width: '100%',
    height: '100%',
  },
  channelDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  channelName: {
    fontSize: 15,
    marginBottom: 2,
  },
  programText: {
    fontSize: 11,
  },
  playerContainer: {
    width: '65%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
<<<<<<< HEAD
=======
    // Added padding to prevent the video edges from cutting off
    paddingHorizontal: 35,
    paddingVertical: 15,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  emptyPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermark: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    zIndex: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
<<<<<<< HEAD
    marginRight: 4, 
=======
    marginRight: 4,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  },
  watermarkText: {
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: spacing.lg,
    zIndex: 10,
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  bottomControlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  controlIconCircle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
<<<<<<< HEAD
  bottomLeftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  castIconCircle: {
    marginLeft: spacing.md,
  },
  castButton: {
    width: 24,
    height: 24,
  },
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  maximizeButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  floatingBackButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xl,
<<<<<<< HEAD
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chevronButton: {
    padding: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  playPauseButtonFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
  },
  controlIconCircleFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
  },
  maximizeButtonFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
  },
  floatingBackButtonFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
  },
  backButtonFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
  }
});

export default LiveTvPlayerScreen;
=======
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  }
});

export default LiveTvPlayerScreen;
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
