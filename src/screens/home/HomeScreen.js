import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Animated,
  ImageBackground,
  Dimensions,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
  Text,
  Pressable,
  useWindowDimensions,
  Modal,
  TouchableOpacity,
  ScrollView as RNScrollView,
  RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import CategoryModal from '../../components/common/CategoryModal';
import MovieCard from '../../components/cards/MovieCard';
import Icon from '../../components/common/SvgIcon';
import Orientation from 'react-native-orientation-locker';
import UpdateModal from '../../components/modals/UpdateModal';
import { VERSION_CONFIG } from '../../config/versionConfig';

import { movieService } from '../../services/movieService';

import { moderateScale, isTablet, isTV } from '../../utils/responsive';

const MOVIES_POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';
const GALLERY_POSTER_BASE_URL = 'https://fundady.com/FrontGallery/';
const TV_SHOWS_POSTER_BASE_URL = 'https://fundady.com/TvShowPoster/';

// ─── TV-optimized Gallery Item ─────────────────────────────────────────────────
const GalleryItemComponent = ({ item, bannerWidth, onPress, onPlayPress }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ width: bannerWidth }}>
      <Pressable
        onPress={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={[
          styles.galleryItemCard,
          isFocused && styles.galleryItemCardFocused,
        ]}
      >
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: `${GALLERY_POSTER_BASE_URL}${item.poster}` }}
            style={styles.bannerImage}
            resizeMode="cover"
          />

          <Pressable
            style={[
              styles.featuredPlayIconContainer,
              isFocused && styles.featuredPlayIconFocused,
            ]}
            onPress={onPlayPress}
          >
            <Icon
              name="play-arrow"
              size={moderateScale(28)}
              color={colors.white}
            />
          </Pressable>

          <View style={styles.gradientOverlay} />
          <View style={styles.featuredInfoSection}>
            <View style={styles.buttonRow} />
          </View>
        </View>
      </Pressable>
    </View>
  );
};

// ─── TV-optimized Top Ten Movie Item ──────────────────────────────────────────

const TopTenItemComponent = ({ item, index, onPress }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    // Outer View — yahan number aur card dono sibling hain
    <View style={[
      styles.topTenCardContainer,
      isTV && { width: moderateScale(200) },
    ]}>
      
      {/* Card — zIndex low */}
      <View style={{ zIndex: 1 }}>
        <MovieCard
          imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
          onPress={onPress}
          width={moderateScale(110)}
          height={moderateScale(160)}
          style={[
            styles.topTenMovieCard,
            isFocused && { borderColor: colors.primary },
          ]}
        />
      </View>

      {/* Number — position absolute, zIndex high, Pressable bahar */}
      <View
        pointerEvents="none"
        style={[
          styles.topTenNumberContainer,
          index === 0 && { left: moderateScale(20) },
        ]}
      >
        <Text style={[styles.topTenNumber, styles.topTenNumberOutline, { transform: [{ translateX: -1.5 }, { translateY: -1.5 }] }]}>{index + 1}</Text>
        <Text style={[styles.topTenNumber, styles.topTenNumberOutline, { transform: [{ translateX: 1.5 }, { translateY: -1.5 }] }]}>{index + 1}</Text>
        <Text style={[styles.topTenNumber, styles.topTenNumberOutline, { transform: [{ translateX: -1.5 }, { translateY: 1.5 }] }]}>{index + 1}</Text>
        <Text style={[styles.topTenNumber, styles.topTenNumberOutline, { transform: [{ translateX: 1.5 }, { translateY: 1.5 }] }]}>{index + 1}</Text>
        <Text style={styles.topTenNumber}>{index + 1}</Text>
      </View>

      {/* Pressable — poore area pe, transparent, sabse upar */}
      <Pressable
        onPress={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
};

// ─── TV-optimized Top Ten Series Item ─────────────────────────────────────────
const TopTenSeriesItemComponent = ({ item, index, onPress }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={[styles.topTenSeriesCardContainer]}
    >
      <MovieCard
        imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
        onPress={onPress}
        width={moderateScale(180)}
        height={moderateScale(101)}
        style={[
          styles.topTenSeriesCard,
          isFocused && { borderColor: colors.primary }, // ← focus border sirf MovieCard pe
        ]}
      />
      <View
        style={[
          styles.topTenNumberContainer,
          index === 0 && { left: moderateScale(20) },
        ]}
      >
        <Text
          style={[
            styles.topTenNumber,
            styles.topTenNumberOutline,
            { transform: [{ translateX: -1.5 }, { translateY: -1.5 }] },
          ]}
        >
          {index + 1}
        </Text>
        <Text
          style={[
            styles.topTenNumber,
            styles.topTenNumberOutline,
            { transform: [{ translateX: 1.5 }, { translateY: -1.5 }] },
          ]}
        >
          {index + 1}
        </Text>
        <Text
          style={[
            styles.topTenNumber,
            styles.topTenNumberOutline,
            { transform: [{ translateX: -1.5 }, { translateY: 1.5 }] },
          ]}
        >
          {index + 1}
        </Text>
        <Text
          style={[
            styles.topTenNumber,
            styles.topTenNumberOutline,
            { transform: [{ translateX: 1.5 }, { translateY: 1.5 }] },
          ]}
        >
          {index + 1}
        </Text>
        <Text style={styles.topTenNumber}>{index + 1}</Text>
      </View>
    </Pressable>
  );
};

// ─── HomeScreen ────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { width: currentWidth, height: currentHeight } = useWindowDimensions();
  const portraitWidth =
    currentWidth < currentHeight ? currentWidth : currentHeight;
  const bannerWidth = isTablet || isTV ? currentWidth : portraitWidth;

  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      if (!isTablet && !isTV) {
        Orientation.lockToPortrait();
      }
    }, []),
  );

  const [movies, setMovies] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [topTenMovies, setTopTenMovies] = useState([]);
  const [topTenSeries, setTopTenSeries] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryRef = useRef(null);
  const autoPlayTimer = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      await Promise.all([
        fetchMovies(),
        fetchGallery(),
        fetchCategories(),
        fetchWebSeries(),
        fetchTopTenMovies(),
        fetchTopTenSeries(),
      ]);
      checkForUpdates();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, []);

  const checkForUpdates = async () => {
    try {
      const res = await movieService.checkUpdate();
      if (res.status && res.data) {
        const latest = res.data;
        if (latest.versionCode > VERSION_CONFIG.currentVersionCode) {
          setUpdateData({ ...latest, forceUpdate: latest.forceUpdate === 1 });
          setShowUpdateModal(true);
        }
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };

  const fetchMovies = async () => {
    try {
      const json = await movieService.getMovies();
      if (json.status) {
        const sorted = json.data.sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at) -
            new Date(a.updated_at || a.created_at),
        );
        setMovies(sorted);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const json = await movieService.getGallery();
      if (json.status) setGallery(json.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const json = await movieService.getCategories();
      if (json.status) setCategories(json.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchWebSeries = async () => {
    try {
      const json = await movieService.getWebSeries();
      if (json.status) {
        const seriesData =
          json.data?.tvshows ||
          json.tvshows ||
          (Array.isArray(json.data) ? json.data : []);
        const dataArray = Array.isArray(seriesData) ? seriesData : [];
        const sorted = [...dataArray].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at || 0) -
            new Date(a.updated_at || a.created_at || 0),
        );
        setWebSeries(sorted);
      }
    } catch (error) {
      console.error('Error fetching web series:', error);
    }
  };

  const fetchTopTenMovies = async () => {
    try {
      const json = await movieService.getTopTenMovies();
      if (json.status && json.data?.movies)
        setTopTenMovies(json.data.movies.slice(0, 10));
    } catch (error) {
      console.error('Error fetching top ten movies:', error);
    }
  };

  const fetchTopTenSeries = async () => {
    try {
      const json = await movieService.getTopTenSeries();
      if (json.status && json.data?.series)
        setTopTenSeries(json.data.series.slice(0, 10));
    } catch (error) {
      console.error('Error fetching top ten series:', error);
    }
  };

  const handleGalleryPlay = async item => {
    const category = item.category || '';
    const isSeries =
      category.toLowerCase().includes('series') ||
      category.toLowerCase().includes('show') ||
      category.toLowerCase().includes('serial');
    setIsActionLoading(true);
    try {
      let response;
      const id = item.movie_id;
      if (isSeries) {
        if (category.toLowerCase().includes('serial'))
          response = await movieService.getTVSerialById(id);
        else if (category.toLowerCase().includes('show'))
          response = await movieService.getTVShowById(id);
        else response = await movieService.getWebSeriesById(id);
      } else {
        response = await movieService.getMovieById(id);
      }
      if (response.status && response.data) {
        const media = isSeries
          ? response.data?.tvshows?.[0] ||
            response.data?.tvshows?.data?.[0] ||
            (Array.isArray(response.data) ? response.data[0] : response.data)
          : Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        if (media && media.links && media.links.length > 0) {
          const ep = media.links[0];
          const videoUrl = isSeries ? ep.tvShow_link : ep.movie_link;
          const dualaudioUrl = isSeries ? ep.dual_link : ep.dualaudio_link;
          if (videoUrl) {
            navigation.navigate('VideoPlayer', {
              videoUrl,
              dualaudioUrl,
              movieTitle: media.title,
              isSeries,
              episodes: isSeries ? media.links : [],
              initialIndex: 0,
              posterUrl: isSeries
                ? `${TV_SHOWS_POSTER_BASE_URL}${media.poster}`
                : `${MOVIES_POSTER_BASE_URL}${media.poster}`,
            });
          } else alert('Video link not available');
        } else alert('Media content not found.');
      } else alert('Could not retrieve media details.');
    } catch (error) {
      console.error('Error fetching banner media:', error);
      alert('Failed to load video.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMoviePress = movie =>
    navigation.navigate('MovieDetail', { id: movie.id });

  useEffect(() => {
    if (gallery.length > 1) startAutoPlay();
    return () => stopAutoPlay();
  }, [gallery, galleryIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimer.current = setInterval(() => {
      const nextIndex = (galleryIndex + 1) % gallery.length;
      galleryRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setGalleryIndex(nextIndex);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setGalleryIndex(viewableItems[0].index);
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const getFilteredMovies = () => {
    const featuredMovieIds = gallery.map(g => g.movie_id);
    let filtered = movies.filter(m => !featuredMovieIds.includes(m.id));
    if (selectedCategory) {
      filtered = filtered.filter(m =>
        m.categories
          ?.split(',')
          .map(c => c.trim())
          .includes(selectedCategory),
      );
    }
    return filtered;
  };

  const currentFilteredMovies = getFilteredMovies();

  const bollywoodMovies = currentFilteredMovies
    .filter(m => m.categories?.toLowerCase().includes('hindi'))
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at) -
        new Date(a.updated_at || a.created_at),
    )
    .slice(0, 20);

  const hollywoodMovies = currentFilteredMovies
    .filter(m => !m.categories?.toLowerCase().includes('hindi'))
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at) -
        new Date(a.updated_at || a.created_at),
    )
    .slice(0, 20);

  const latestWebSeries = webSeries.slice(0, 20);

  // ── Render functions ──────────────────────────────────────────────────────
  const renderMovieItem = ({ item }) => (
    <MovieCard
      imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
      onPress={() => handleMoviePress(item)}
      width={moderateScale(110)}
      height={moderateScale(160)}
      style={styles.movieCard}
    />
  );

  const renderWebSeriesItem = ({ item }) => (
    <MovieCard
      imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
      onPress={() =>
        navigation.navigate('SeriesDetail', {
          id: item.id,
          contentType: 'web_series',
        })
      }
      width={moderateScale(180)}
      height={moderateScale(101)}
      style={styles.movieCard}
    />
  );

  const renderGalleryItem = ({ item }) => {
    const category = item.category || '';
    const isSeries =
      category.toLowerCase().includes('series') ||
      category.toLowerCase().includes('show') ||
      category.toLowerCase().includes('serial');

    return (
      <GalleryItemComponent
        item={item}
        bannerWidth={bannerWidth}
        onPress={() =>
          navigation.navigate(isSeries ? 'SeriesDetail' : 'MovieDetail', {
            id: item.movie_id,
            contentType: isSeries
              ? category.toLowerCase().includes('serial')
                ? 'tv_serial'
                : category.toLowerCase().includes('show')
                ? 'tv_show'
                : 'web_series'
              : undefined,
          })
        }
        onPlayPress={() => handleGalleryPlay(item)}
      />
    );
  };

  const renderTopTenItem = ({ item, index }) => (
    <TopTenItemComponent
      item={item}
      index={index}
      onPress={() => handleMoviePress(item)}
    />
  );

  const renderTopTenSeriesItem = ({ item, index }) => (
    <TopTenSeriesItemComponent
      item={item}
      index={index}
      onPress={() =>
        navigation.navigate('SeriesDetail', {
          id: item.id,
          contentType: 'web_series',
        })
      }
    />
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* TV pe header relative flow mein, phone/tablet pe absolute overlay */}
      <MainHeader scrollY={scrollY} variant="home" />

      <Animated.View
        style={[
          styles.stickyFilterContainer,
          {
            opacity: scrollY.interpolate({
              inputRange: [400, 450],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [400, 450],
                  outputRange: [-20, 0],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
        pointerEvents="box-none"
      />

      <Animated.ScrollView
        style={styles.scrollView}
        bounces={!isTV}
        removeClippedSubviews={false} // ← TV spatial nav fix
        refreshControl={
          !isTV ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.backgroundLight}
              progressViewOffset={Platform.OS === 'ios' ? 140 : 120}
            />
          ) : undefined
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Header spacer — TV pe chota, phone pe bada */}
        <View
          style={{ height: isTV ? 0 : Platform.OS === 'ios' ? 110 : 100 }}
        />

        {/* Featured Gallery Carousel */}
        {gallery.length > 0 && (
          <View style={styles.galleryWrapper}>
            <FlatList
              ref={galleryRef}
              data={gallery}
              renderItem={renderGalleryItem}
              keyExtractor={item => `gallery-${item.id}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={false} // ← TV spatial nav fix
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              getItemLayout={(data, index) => ({
                length: bannerWidth,
                offset: bannerWidth * index,
                index,
              })}
            />
            {gallery.length > 1 && (
              <View style={styles.paginationDots}>
                {gallery.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      galleryIndex === i
                        ? styles.activeDot
                        : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.content}>
          {topTenMovies.length > 0 && (
            <View style={styles.topTenSection}>
              <AppText variant="bold" size="xl" style={styles.sectionTitle}>
                Top 10 Movies in Pakistan Today
              </AppText>
              <FlatList
                horizontal
                data={topTenMovies}
                renderItem={renderTopTenItem}
                keyExtractor={item => `top-${item.id}`}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={false} // ← TV spatial nav fix
                contentContainerStyle={[
                  styles.topTenListContent,
                  { overflow: 'visible' }, // ← border show hogi
                ]}
                style={{ overflow: 'visible' }}
              />
            </View>
          )}

          {bollywoodMovies.length > 0 && (
            <>
              <AppText variant="bold" size="xl" style={styles.sectionTitle}>
                Bollywood
              </AppText>
              <FlatList
                horizontal
                data={bollywoodMovies}
                renderItem={renderMovieItem}
                keyExtractor={item => `bolly-${item.id}`}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={false} // ← TV spatial nav fix
                contentContainerStyle={styles.listContent}
              />
            </>
          )}

          {hollywoodMovies.length > 0 && (
            <>
              <AppText
                variant="bold"
                size="xl"
                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
              >
                Hollywood
              </AppText>
              <FlatList
                horizontal
                data={hollywoodMovies}
                renderItem={renderMovieItem}
                keyExtractor={item => `holly-${item.id}`}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={false} // ← TV spatial nav fix
                contentContainerStyle={styles.listContent}
              />
            </>
          )}

          {latestWebSeries.length > 0 && (
            <>
              <AppText
                variant="bold"
                size="xl"
                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
              >
                Web Series
              </AppText>
              <FlatList
                horizontal
                data={latestWebSeries}
                renderItem={renderWebSeriesItem}
                keyExtractor={item => `web-${item.id}`}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={false} // ← TV spatial nav fix
                contentContainerStyle={styles.listContent}
              />
            </>
          )}
        </View>
      </Animated.ScrollView>

      <CategoryModal
        isVisible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {isActionLoading && (
        <View style={styles.actionOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <UpdateModal
        visible={showUpdateModal}
        updateData={updateData}
        onDismiss={() => setShowUpdateModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  galleryWrapper: { width: '100%', marginTop: isTV ? 0 : spacing.sm },
  galleryItemCard: {
    marginHorizontal: isTV ? 0 : spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: isTV ? 0 : 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  // ← TV focus pe gallery banner glow
  galleryItemCardFocused: {
    borderColor: colors.primary,
    // transform: [{ scale: 1.01 }],
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: { height: 6, borderRadius: 3 },
  activeDot: { width: 20, backgroundColor: colors.primary },
  inactiveDot: { width: 6, backgroundColor: 'rgba(255,255,255,0.3)' },
  bannerContainer: {
    width: '100%',
    aspectRatio: isTablet || isTV ? 16 / 7 : 16 / 10,
  },
  bannerImage: { width: '100%', height: '100%' },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  featuredInfoSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  featuredPlayIconContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: moderateScale(25),
    width: moderateScale(47),
    height: moderateScale(47),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.textPrimary,
    zIndex: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  featuredPlayIconFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  content: { paddingVertical: spacing.md },
  sectionTitle: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: moderateScale(18, 0.3),
  },
  listContent: { paddingHorizontal: spacing.md },
  movieCard: { marginRight: spacing.sm },
  centered: { justifyContent: 'center', alignItems: 'center' },
  stickyFilterContainer: {
    paddingTop: Platform.OS === 'ios' ? 100 : 90,
    backgroundColor: colors.background,
    zIndex: 10,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  topTenSection: { marginBottom: spacing.lg },
  topTenListContent: { paddingHorizontal: spacing.md, paddingLeft: spacing.md },
  topTenCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    height: moderateScale(160) + 4,
    width: moderateScale(160),
    overflow: 'visible', // ← ZAROORI — border clip nahi hogi
    paddingVertical: 2, // ← top/bottom border show hogi
    paddingHorizontal: 2,
    // borderRadius: 8, borderWidth: 2, borderColor: 'transparent',
  },
  // ← TV focus pe Top Ten card glow
  topTenCardFocused: {
    // borderColor: colors.primary,
    // transform: [{ scale: 1.05 }],
  },
  topTenMovieCard: {
    marginLeft: moderateScale(45),
    elevation: 0,
    zIndex: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  topTenNumberContainer: {
    position: 'absolute',
    left: 0,
    bottom: -moderateScale(15),
    zIndex: 999, // ← uncomment aur zyada karo
    elevation: 999,
  },
  topTenNumber: {
    fontSize: isTV ? moderateScale(90) : moderateScale(120),
    fontWeight: '900',
    color: colors.background,
    includeFontPadding: false,
    letterSpacing: -5,
    zIndex: 10,
  },
  topTenNumberOutline: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.6)',
    opacity:0.5
  },
  topTenSeriesCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    height: moderateScale(110),
    width: moderateScale(220),
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topTenSeriesCard: {
    marginLeft: moderateScale(35),
    elevation: 5,
    zIndex: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  inlineFilterBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default HomeScreen;
