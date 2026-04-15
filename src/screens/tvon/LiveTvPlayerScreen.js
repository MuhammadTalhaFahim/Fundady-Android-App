import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Image,
  TextInput,
  Keyboard,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import NavigationBar from 'react-native-system-navigation-bar';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import { movieService } from '../../services/movieService';

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
  
  const videoRef = useRef(null);

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
    if (activeChannel?.id !== channel.id) {
      setVideoLoading(true);
      setActiveChannel(channel);
    }
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
            source={{ uri: `https://entertainment-demo.squadcloud.co/TvShowPoster/${item.poster}` }}
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

  return (
    <View style={styles.container}>
      {/* Top Header Layer - Absolutely Positioned to float over content */}
      <View style={styles.header}>
        {isSearchVisible ? (
          <View style={styles.searchHeaderContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => { setIsSearchVisible(false); setSearchQuery(''); }}>
              <Icon name="arrow-back" size={28} color={colors.white} />
            </TouchableOpacity>
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
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close" size={22} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={28} color={colors.white} />
              </TouchableOpacity>
              <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
              <View style={styles.divider} />
              <AppText variant="bold" style={styles.headerTitle}>Live</AppText>
            </View>
            
            <View style={styles.headerRight}>
              <AppText style={styles.timeText} variant="bold">{formatTime(currentTime)}</AppText>
              <AppText style={styles.dateText}>{formatDate(currentTime)}</AppText>
              <TouchableOpacity style={styles.iconButton} onPress={() => setIsSearchVisible(true)}>
                <Icon name="search" size={28} color={colors.white} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View style={styles.contentContainer}>
        {/* Left Sidebar - Channel List */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <TouchableOpacity onPress={handlePrevCategory}>
              <Icon name="chevron-left" size={28} color={colors.white} />
            </TouchableOpacity>
            <AppText variant="bold" style={styles.sidebarTitle} numberOfLines={1}>
              {currentCategoryName.toUpperCase()}
            </AppText>
            <TouchableOpacity onPress={handleNextCategory}>
              <Icon name="chevron-right" size={28} color={colors.white} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
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

        {/* Right Side - Video Player */}
        <View style={styles.playerContainer}>
          {activeChannel ? (
            <View style={styles.videoWrapper}>
              <Video
                ref={videoRef}
                source={{ uri: activeChannel.channel_id }} // using channel_id as the stream URL per previous component
                style={styles.video}
                resizeMode="contain"
                onLoadStart={() => setVideoLoading(true)}
                onReadyForDisplay={() => setVideoLoading(false)}
                onBuffer={({ isBuffering }) => setVideoLoading(isBuffering)}
                controls={true} // enable default native controls for now
                playInBackground={false}
                playWhenInactive={false}
              />
              {videoLoading && (
                <View style={styles.videoLoaderOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}

              {/* Optional: Floating Channel Badge */}
              <View style={styles.watermark}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <AppText size="xs" variant="bold" color={colors.white}>LIVE</AppText>
                </View>
                <AppText variant="bold" color={colors.white} style={styles.watermarkText}>{activeChannel.name}</AppText>
              </View>
            </View>
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
  },
  logo: {
    height: 30,
    width: 70,
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
    paddingTop: 60, // account for absolute header
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
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
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
    top: spacing.lg,
    right: spacing.lg,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
    marginRight: 4,
  },
  watermarkText: {
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  }
});

export default LiveTvPlayerScreen;
