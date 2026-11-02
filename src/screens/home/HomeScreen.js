import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  Animated,
  ImageBackground,
  Dimensions,
  FlatList,
<<<<<<< HEAD
  Platform,
  Image,
  Text,
  useWindowDimensions,
  ViewBase,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView as RNScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import CategoryModal from '../../components/common/CategoryModal';
import MovieCard from '../../components/cards/MovieCard';
<<<<<<< HEAD
import ContinueWatchingCard from '../../components/cards/ContinueWatchingCard';
import { useContinueWatching } from '../../hooks/useContinueWatching';
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import Icon from '../../components/common/SvgIcon';
import Orientation from 'react-native-orientation-locker';
import UpdateModal from '../../components/modals/UpdateModal';
import { VERSION_CONFIG } from '../../config/versionConfig';

import { movieService } from '../../services/movieService';
<<<<<<< HEAD
import { adService } from '../../services/adService';
import AdBanner from '../../components/ads/AdBanner';

import {
  moderateScale,
  isTablet,
  isTV,
  SCREEN_HEIGHT,
} from '../../utils/responsive';
import { isLatestContent } from '../../utils/helpers';
import Svg, {
  Text as SvgText,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
=======

import { moderateScale, isTablet, isTV } from '../../utils/responsive';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

const MOVIES_POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';
const GALLERY_POSTER_BASE_URL = 'https://fundady.com/FrontGallery/';
const TV_SHOWS_POSTER_BASE_URL = 'https://fundady.com/TvShowPoster/';
<<<<<<< HEAD
// ─────────────────────────────────────────────────────────────────────────────

const GalleryItemComponent = ({ item, onPress, onPlayPress, bannerWidth }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPlayFocused, setIsPlayFocused] = useState(false);

  // Safety guard — if item is undefined/null, render nothing
  if (!item) return null;

  const category = item.category || '';
  const isSeries =
    category.toLowerCase().includes('series') ||
    category.toLowerCase().includes('show') ||
    category.toLowerCase().includes('serial');

  const categoryLabel = isSeries ? 'Series' : 'Movie';

  return (
    <View style={{ width: bannerWidth }}>
      <View
        style={[
          styles.galleryItemCard,
          isFocused && {
            borderColor: colors.primary,
            borderWidth: 2.5,
            shadowColor: colors.primary,
            shadowOpacity: 0.8,
            shadowRadius: 14,
            elevation: 14,
          },
        ]}
      >
        <View style={styles.bannerContainer}>
          {/* Main Banner Image - cover, no stretch */}
          <Pressable
            onPress={onPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ width: '100%', height: '100%' }}
          >
            <Image
              source={{ uri: `${GALLERY_POSTER_BASE_URL}${item.poster}` }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </Pressable>

          {/* Dark gradient overlay at bottom */}
          <View style={styles.gradientOverlay} pointerEvents="none" />

          {/* Bottom info: title + category */}
          {/* <View style={styles.galleryBottomInfo} pointerEvents="none">
            {item.title ? (
              <AppText numberOfLines={1} style={styles.galleryTitle}>
                {item.title}
              </AppText>
            ) : null}
            {category ? (
              <AppText style={styles.galleryCategory}>{category}</AppText>
            ) : null}
          </View> */}

          {/* Play Button - bottom right */}
          <Pressable
            style={[
              styles.featuredPlayIconContainer,
              isPlayFocused && {
                borderColor: colors.primary,
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOpacity: 1,
                shadowRadius: 12,
              },
            ]}
            onFocus={() => setIsPlayFocused(true)}
            onBlur={() => setIsPlayFocused(false)}
            onPress={e => {
              e.stopPropagation && e.stopPropagation();
              onPlayPress && onPlayPress();
            }}
          >
            <Icon
              name="play-arrow"
              size={moderateScale(24)}
              color={colors.white}
            />
          </Pressable>
        </View>
      </View>
=======

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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    </View>
  );
};

<<<<<<< HEAD
const TopTenItemComponent = ({ item, index, onPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isDoubleDigit = index >= 9; // 10th item (index 9) is "10"

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={[
        styles.topTenCardContainer,
        index === 0 && { width: moderateScale(130) },
        isDoubleDigit && { width: moderateScale(165) },
      ]}
    >
      <MovieCard
        imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
        onPress={onPress}
        width={moderateScale(110)}
        height={moderateScale(160)}
        style={[
          styles.topTenMovieCard,
          index === 0 && { marginLeft: moderateScale(22) },
          isDoubleDigit && { marginLeft: moderateScale(50) },
          isFocused && {
            borderColor: colors.primary,
            borderWidth: 2.5,
            shadowColor: colors.primary,
            shadowOpacity: 0.6,
            shadowRadius: 8,
          },
        ]}
      />
      <View
        style={[
          styles.topTenNumberContainer,
          index === 0 && { left: -moderateScale(14) },
          { width: isDoubleDigit ? moderateScale(115) : moderateScale(80) },
        ]}
      >
        {isDoubleDigit ? (
          <Svg
            width={moderateScale(115)}
            height={moderateScale(105)}
            viewBox="0 0 115 105"
          >
            <SvgText
              x="32"
              y="90"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill={colors.background}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            >
              1
            </SvgText>
            <SvgText
              x="75"
              y="90"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill={colors.background}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            >
              0
            </SvgText>
          </Svg>
        ) : (
          <Svg
            width={moderateScale(80)}
            height={moderateScale(105)}
            viewBox="0 0 80 105"
          >
            <SvgText
              x="38"
              y="90"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
            >
              {index + 1}
            </SvgText>
            <SvgText
              x="38"
              y="90"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill="black"
              stroke="none"
            >
              {index + 1}
            </SvgText>
          </Svg>
        )}
      </View>
    </Pressable>
  );
};

const TopTenSeriesItemComponent = ({ item, index, onPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isDoubleDigit = index >= 9;
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
<<<<<<< HEAD
      style={[
        styles.topTenSeriesCardContainer,
        index === 0 && { width: moderateScale(185) },
        isDoubleDigit && { width: moderateScale(215) },
      ]}
    >
      <View
        style={[
          styles.topTenNumberContainer,
          index === 0 && { left: -moderateScale(14) },
          { width: isDoubleDigit ? moderateScale(115) : moderateScale(80) },
        ]}
      >
        {isDoubleDigit ? (
          <Svg
            width={moderateScale(115)}
            height={moderateScale(105)}
            viewBox="0 0 115 105"
          >
            <SvgText
              x="32"
              y="90"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill={colors.background}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            >
              1
            </SvgText>
            <SvgText
              x="75"
              y="90"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill={colors.background}
              stroke="#FFFFFF"
              strokeWidth="2.5"
            >
              0
            </SvgText>
          </Svg>
        ) : (
          <Svg
            width={moderateScale(80)}
            height={moderateScale(105)}
            viewBox="0 0 80 105"
          >
            <SvgText
              x="38"
              y="90"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
            >
              {index + 1}
            </SvgText>
            <SvgText
              x="38"
              y="90"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontSize="90"
              fontWeight="bold"
              fill="black"
              stroke="none"
            >
              {index + 1}
            </SvgText>
          </Svg>
        )}
      </View>
=======
      style={[styles.topTenSeriesCardContainer]}
    >
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
      <MovieCard
        imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
        onPress={onPress}
        width={moderateScale(180)}
        height={moderateScale(101)}
        style={[
          styles.topTenSeriesCard,
<<<<<<< HEAD
          index === 0 && { marginLeft: moderateScale(18) },
          isDoubleDigit && { marginLeft: moderateScale(38) },
          isFocused && {
            borderColor: colors.primary,
            borderWidth: 2.5,
            shadowColor: colors.primary,
            shadowOpacity: 0.6,
            shadowRadius: 8,
          },
        ]}
      />
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    </Pressable>
  );
};

<<<<<<< HEAD
const HomeScreen = ({ navigation }) => {
  const { width: currentWidth, height: currentHeight } = useWindowDimensions();

  // On Phones, we always want the portrait width for the banner to prevent stretching
  // during orientation transitions (like when coming back from the video player).
=======
// ─── HomeScreen ────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { width: currentWidth, height: currentHeight } = useWindowDimensions();
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  const portraitWidth =
    currentWidth < currentHeight ? currentWidth : currentHeight;
  const bannerWidth = isTablet || isTV ? currentWidth : portraitWidth;

  const scrollY = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
<<<<<<< HEAD
      // Only lock portrait on phones. RootNavigator handles Tablet/TV landscape.
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
      if (!isTablet && !isTV) {
        Orientation.lockToPortrait();
      }
    }, []),
  );
<<<<<<< HEAD
  const [indianMovies, setIndianMovies] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [internationalMovies, setInternationalMovies] = useState([]);
  const [southPrimeMovies, setSouthPrimeMovies] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [ads, setAds] = useState({});
  const [topTenMovies, setTopTenMovies] = useState([]);
  const [topTenWebSeriesData, setTopTenWebSeriesData] = useState([]);
  const [topTenTvShowsData, setTopTenTvShowsData] = useState([]);
  const [topTenTvSerialsData, setTopTenTvSerialsData] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [tvSerials, setTvSerials] = useState([]);
=======

  const [movies, setMovies] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [topTenMovies, setTopTenMovies] = useState([]);
  const [topTenSeries, setTopTenSeries] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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

<<<<<<< HEAD
  // Continue Watching (local storage) — placed before the `if (loading)` early return
  const { items: continueWatching, remove: removeContinueWatching } =
    useContinueWatching();

  const handleContinueWatchingPress = item => {
    navigation.navigate('VideoPlayer', {
      videoUrl: item.videoUrl,
      dualaudioUrl: item.dualaudioUrl,
      movieTitle: item.title,
      isSeries: item.isSeries,
      episodes: item.episodes,
      initialIndex: item.episodeIndex,
      contentId: item.contentId,
      contentType: item.contentType,
      posterUrl: item.posterUrl,
    });
  };

  const handleContinueWatchingRemove = item => {
    Alert.alert(
      'Remove from Continue Watching?',
      item.title,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeContinueWatching(item.key),
        },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await Promise.all([
        fetchNewArrivals(),
        fetchIndianMovies(),
        fetchInternationalMovies(),
        fetchSouthPrimeMovies(),
        fetchGallery(),
        fetchCategories(),
        fetchWebSeries(),
        fetchTVShows(),
        fetchTVSerials(),
        fetchTopTenMovies(),
        fetchTopTenWebSeries(),
        fetchTopTenTvShows(),
        fetchTopTenTvSerials(),
        fetchAds(),
      ]);
      // Check for updates after data is loaded
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
    // eslint-disable-next-line react-hooks/exhaustive-deps
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  }, []);

  const checkForUpdates = async () => {
    try {
      const res = await movieService.checkUpdate();
      if (res.status && res.data) {
        const latest = res.data;
<<<<<<< HEAD
        // Compare version codes from API
        if (latest.versionCode > VERSION_CONFIG.currentVersionCode) {
          setUpdateData({
            ...latest,
            forceUpdate: latest.forceUpdate === 1, // Convert 0/1 to boolean
          });
=======
        if (latest.versionCode > VERSION_CONFIG.currentVersionCode) {
          setUpdateData({ ...latest, forceUpdate: latest.forceUpdate === 1 });
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
          setShowUpdateModal(true);
        }
      }
    } catch (error) {
      console.error('Update check failed:', error);
    }
  };

<<<<<<< HEAD
  const fetchAds = async () => {
    try {
      setAds(await adService.getAds());
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  };

  const fetchNewArrivals = async () => {
    try {
      const json = await movieService.getMovies();
      if (json.status) {
        const all = Array.isArray(json.data) ? json.data : [];
        const filtered = all.filter(movie => isLatestContent(movie.created_at));
        // Sort by newest created_at first
        const sorted = filtered.sort((a, b) => {
          const dateA = new Date(
            (a.created_at || '').replace(' ', 'T'),
          ).getTime();
          const dateB = new Date(
            (b.created_at || '').replace(' ', 'T'),
          ).getTime();
          return dateB - dateA;
        });
        setNewArrivals(sorted.slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    }
  };

  const fetchIndianMovies = async () => {
    try {
      const json = await movieService.getMoviesByCategories(['hindi']);
      if (json.status) {
        const sorted = (Array.isArray(json.data) ? json.data : []).sort(
          (a, b) => {
            const timeA = new Date(a.updated_at || a.created_at).getTime();
            const timeB = new Date(b.updated_at || b.created_at).getTime();
            return timeB - timeA;
          },
        );
        setIndianMovies(sorted.slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching Indian movies:', error);
    }
  };

  const fetchInternationalMovies = async () => {
    try {
      const json = await movieService.getMoviesByCategories(['english']);
      if (json.status) {
        const sorted = (Array.isArray(json.data) ? json.data : []).sort(
          (a, b) => {
            const timeA = new Date(a.updated_at || a.created_at).getTime();
            const timeB = new Date(b.updated_at || b.created_at).getTime();
            return timeB - timeA;
          },
        );
        setInternationalMovies(sorted.slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching International movies:', error);
    }
  };

  const fetchSouthPrimeMovies = async () => {
    try {
      const json = await movieService.getMoviesByCategories([
        'tamil',
        'telugu',
        'kannada',
        'malayalam',
      ]);
      if (json.status) {
        const sorted = (Array.isArray(json.data) ? json.data : []).sort(
          (a, b) => {
            const timeA = new Date(a.updated_at || a.created_at).getTime();
            const timeB = new Date(b.updated_at || b.created_at).getTime();
            return timeB - timeA;
          },
        );
        setSouthPrimeMovies(sorted.slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching South Prime movies:', error);
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    }
  };

  const fetchGallery = async () => {
    try {
      const json = await movieService.getGallery();
<<<<<<< HEAD
      if (json.status) {
        setGallery(json.data);
      }
=======
      if (json.status) setGallery(json.data);
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const json = await movieService.getCategories();
<<<<<<< HEAD
      if (json.status) {
        setCategories(json.data);
      }
=======
      if (json.status) setCategories(json.data);
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchWebSeries = async () => {
    try {
      const json = await movieService.getWebSeries();
      if (json.status) {
<<<<<<< HEAD
        // Correct extraction for your API structure: json.data.tvshows is the array
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        const seriesData =
          json.data?.tvshows ||
          json.tvshows ||
          (Array.isArray(json.data) ? json.data : []);
        const dataArray = Array.isArray(seriesData) ? seriesData : [];
<<<<<<< HEAD

        // Sort by latest (handles null dates safely)
        const sorted = [...dataArray].sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
          const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });
=======
        const sorted = [...dataArray].sort(
          (a, b) =>
            new Date(b.updated_at || b.created_at || 0) -
            new Date(a.updated_at || a.created_at || 0),
        );
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        setWebSeries(sorted);
      }
    } catch (error) {
      console.error('Error fetching web series:', error);
    }
  };

<<<<<<< HEAD
  const fetchTVShows = async () => {
    try {
      const json = await movieService.getTVShows();
      if (json.status) {
        const seriesData =
          json.data?.tvshows ||
          json.tvshows ||
          (Array.isArray(json.data) ? json.data : []);
        const dataArray = Array.isArray(seriesData) ? seriesData : [];

        const sorted = [...dataArray].sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
          const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        setTvShows(sorted);
      }
    } catch (error) {
      console.error('Error fetching TV Shows:', error);
    }
  };

  const fetchTVSerials = async () => {
    try {
      const json = await movieService.getTVSerials();
      if (json.status) {
        const seriesData =
          json.data?.tvshows ||
          json.tvshows ||
          (Array.isArray(json.data) ? json.data : []);
        const dataArray = Array.isArray(seriesData) ? seriesData : [];

        const sorted = [...dataArray].sort((a, b) => {
          const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
          const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
          return timeB - timeA;
        });
        setTvSerials(sorted);
      }
    } catch (error) {
      console.error('Error fetching TV Serials:', error);
    }
  };

  const fetchTopTenMovies = async () => {
    try {
      const json = await movieService.getTopTenMovies();
      if (json.status && json.data?.movies) {
        setTopTenMovies(json.data.movies.slice(0, 10));
      }
=======
  const fetchTopTenMovies = async () => {
    try {
      const json = await movieService.getTopTenMovies();
      if (json.status && json.data?.movies)
        setTopTenMovies(json.data.movies.slice(0, 10));
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    } catch (error) {
      console.error('Error fetching top ten movies:', error);
    }
  };

<<<<<<< HEAD
  const fetchTopTenWebSeries = async () => {
    try {
      const json = await movieService.getTopTenSeries('web_series');
      if (json.status && json.data?.series) {
        setTopTenWebSeriesData(json.data.series.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching top ten web series:', error);
    }
  };

  const fetchTopTenTvShows = async () => {
    try {
      const json = await movieService.getTopTenSeries('tv_shows');
      if (json.status && json.data?.series) {
        setTopTenTvShowsData(json.data.series.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching top ten TV shows:', error);
    }
  };

  const fetchTopTenTvSerials = async () => {
    try {
      const json = await movieService.getTopTenSeries('tv_serials');
      if (json.status && json.data?.series) {
        setTopTenTvSerialsData(json.data.series.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching top ten TV serials:', error);
    }
  };

  const handleGalleryPlay = useCallback(
    async item => {
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
                contentId: media.id ?? id,
                contentType: !isSeries
                  ? 'movie'
                  : category.toLowerCase().includes('serial')
                  ? 'tv_serial'
                  : category.toLowerCase().includes('show')
                  ? 'tv_show'
                  : 'web_series',
                posterUrl: isSeries
                  ? `${TV_SHOWS_POSTER_BASE_URL}${media.poster}`
                  : `${MOVIES_POSTER_BASE_URL}${media.poster}`,
              });
            } else
              Toast.show({ type: 'error', text1: 'Video link not available' });
          } else
            Toast.show({ type: 'error', text1: 'Media content not found.' });
        } else
          Toast.show({
            type: 'error',
            text1: 'Could not retrieve media details.',
          });
      } catch (error) {
        console.error('Error fetching banner media:', error);
        Toast.show({ type: 'error', text1: 'Failed to load video.' });
      } finally {
        setIsActionLoading(false);
      }
    },
    [navigation],
  );

  const handleMoviePress = useCallback(
    movie => {
      navigation.navigate('MovieDetail', { id: movie.id, fromTab: 'Home' });
    },
    [navigation],
  );

  // Auto-play logic for gallery
  // Fix: use a ref for galleryIndex inside interval to avoid stale closure
  // and remove galleryIndex from deps to stop re-creating interval on every slide
  const galleryIndexRef = useRef(0);

  useEffect(() => {
    galleryIndexRef.current = galleryIndex;
  }, [galleryIndex]);

  useEffect(() => {
    if (gallery.length > 1) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gallery]);
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimer.current = setInterval(() => {
<<<<<<< HEAD
      const nextIndex = (galleryIndexRef.current + 1) % gallery.length;
      galleryRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setGalleryIndex(nextIndex);
    }, 5000); // 5 seconds interval
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setGalleryIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Movie sections are now fetched directly from the API with category[] filters
  // No more client-side filtering needed

  const latestWebSeries = webSeries.slice(0, 20);
  const latestTVShows = tvShows.slice(0, 20);
  const latestTVSerials = tvSerials.slice(0, 20);

  const topTenWebSeries = topTenWebSeriesData;
  const topTenTvShows = topTenTvShowsData;
  const topTenTvSerials = topTenTvSerialsData;

  const renderMovieItem = useCallback(
    ({ item }) => (
      <MovieCard
        imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
        onPress={() => handleMoviePress(item)}
        width={moderateScale(110)}
        height={moderateScale(160)}
        createdAt={item.created_at}
        style={styles.movieCard}
      />
    ),
    [handleMoviePress],
  );

  const renderWebSeriesItem = useCallback(
    ({ item }) => (
      <MovieCard
        imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
        onPress={() =>
          navigation.navigate('SeriesDetail', {
            id: item.id,
            contentType: 'web_series',
            fromTab: 'Home',
          })
        }
        width={moderateScale(180)}
        height={moderateScale(101)}
        createdAt={item.created_at}
        style={styles.movieCard}
      />
    ),
    [navigation],
  );

  const renderTVShowsItem = useCallback(
    ({ item }) => (
      <MovieCard
        imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
        onPress={() =>
          navigation.navigate('SeriesDetail', {
            id: item.id,
            contentType: 'tv_show',
            fromTab: 'Home',
          })
        }
        width={moderateScale(180)}
        height={moderateScale(101)}
        createdAt={item.created_at}
        style={styles.movieCard}
      />
    ),
    [navigation],
  );

  const renderTVSerialsItem = useCallback(
    ({ item }) => (
      <MovieCard
        imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
        onPress={() =>
          navigation.navigate('SeriesDetail', {
            id: item.id,
            contentType: 'tv_serial',
            fromTab: 'Home',
          })
        }
        width={moderateScale(180)}
        height={moderateScale(101)}
        createdAt={item.created_at}
        style={styles.movieCard}
      />
    ),
    [navigation],
  );

  const renderGalleryItem = useCallback(
    ({ item }) => {
      const category = item.category || '';
      const isSeries =
        category.toLowerCase().includes('series') ||
        category.toLowerCase().includes('show') ||
        category.toLowerCase().includes('serial');

      return (
        <GalleryItemComponent
          item={item}
          bannerWidth={bannerWidth}
          onPress={() => {
            navigation.navigate(isSeries ? 'SeriesDetail' : 'MovieDetail', {
              id: item.movie_id,
              fromTab: 'Home',
              contentType: isSeries
                ? category.toLowerCase().includes('serial')
                  ? 'tv_serial'
                  : category.toLowerCase().includes('show')
                  ? 'tv_show'
                  : 'web_series'
                : undefined,
            });
          }}
          onPlayPress={() => handleGalleryPlay(item)}
        />
      );
    },
    [bannerWidth, navigation, handleGalleryPlay],
  );

  const renderTopTenItem = useCallback(
    ({ item, index }) => (
      <TopTenItemComponent
        item={item}
        index={index}
        onPress={() => handleMoviePress(item)}
      />
    ),
    [handleMoviePress],
  );

  const renderTopTenWebSeriesItem = useCallback(
    ({ item, index }) => (
      <TopTenSeriesItemComponent
        item={item}
        index={index}
        onPress={() =>
          navigation.navigate('SeriesDetail', {
            id: item.id,
            contentType: 'web_series',
            fromTab: 'Home',
          })
        }
      />
    ),
    [navigation],
  );

  const renderTopTenTVShowsItem = useCallback(
    ({ item, index }) => (
      <TopTenSeriesItemComponent
        item={item}
        index={index}
        onPress={() =>
          navigation.navigate('SeriesDetail', {
            id: item.id,
            contentType: 'tv_show',
            fromTab: 'Home',
          })
        }
      />
    ),
    [navigation],
  );

  const renderTopTenTVSerialsItem = useCallback(
    ({ item, index }) => (
      <TopTenSeriesItemComponent
        item={item}
        index={index}
        onPress={() =>
          navigation.navigate('SeriesDetail', {
            id: item.id,
            contentType: 'tv_serial',
            fromTab: 'Home',
          })
        }
      />
    ),
    [navigation],
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
<<<<<<< HEAD
        <Loader />
=======
        <ActivityIndicator size="large" color={colors.primary} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
      </View>
    );
  }

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      <MainHeader scrollY={scrollY} variant="home" title="Home" />

      {/* Sticky Overlay Filter Bar - Shows only when scrolled enough */}
=======
      {/* TV pe header relative flow mein, phone/tablet pe absolute overlay */}
      <MainHeader scrollY={scrollY} variant="home" />

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
      >
        {/* <View style={styles.filterBar}>
                    <TouchableOpacity
                        style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <AppText variant="medium" size="md" color={colors.textPrimary}>
                            {selectedCategory || 'Categories'}
                        </AppText>
                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View> */}
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.backgroundLight}
            progressViewOffset={Platform.OS === 'ios' ? 140 : 120}
          />
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
<<<<<<< HEAD
        scrollEventThrottle={32}
        contentContainerStyle={{ paddingTop: 0 }}
        removeClippedSubviews={true}
      >
        {/* TV: invisible focus trap so no card is highlighted on app open */}
        {isTV && (
          <View
            focusable={true}
            hasTVPreferredFocus={true}
            style={{ width: 0, height: 0, opacity: 0 }}
          />
        )}

        {/* Space for the header overlaying the banner initially */}
        {!isTV && (
          <View style={{ height: Platform.OS === 'ios' ? 110 : 100 }} />
        )}

        {/* Inline Filter Bar - Moves with scroll until sticky overlay takes over */}
        {/* <View style={styles.inlineFilterBar}>
                    <TouchableOpacity
                        style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <AppText variant="medium" size="md" color={colors.textPrimary}>
                            {selectedCategory || 'Categories'}
                        </AppText>
                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View> */}
=======
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* Header spacer — TV pe chota, phone pe bada */}
        <View
          style={{ height: isTV ? 0 : Platform.OS === 'ios' ? 110 : 100 }}
        />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

        {/* Featured Gallery Carousel */}
        {gallery.length > 0 && (
          <View style={styles.galleryWrapper}>
            <FlatList
              ref={galleryRef}
              data={gallery}
              renderItem={renderGalleryItem}
<<<<<<< HEAD
              keyExtractor={(item, index) =>
                item
                  ? `gallery-${item.movie_id || item.id || index}`
                  : `gallery-${index}`
              }
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              removeClippedSubviews={true}
              initialNumToRender={2}
              maxToRenderPerBatch={2}
              windowSize={3}
=======
              keyExtractor={item => `gallery-${item.id}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={false} // ← TV spatial nav fix
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              getItemLayout={(data, index) => ({
                length: bannerWidth,
                offset: bannerWidth * index,
                index,
              })}
            />
<<<<<<< HEAD
            {/* Pagination Dots */}
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
              <AppText variant="bold" size="xl" style={[styles.sectionTitle]}>
=======
              <AppText variant="bold" size="xl" style={styles.sectionTitle}>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                Top 10 Movies in Pakistan Today
              </AppText>
              <FlatList
                horizontal
                data={topTenMovies}
                renderItem={renderTopTenItem}
                keyExtractor={item => `top-${item.id}`}
                showsHorizontalScrollIndicator={false}
<<<<<<< HEAD
                contentContainerStyle={styles.topTenListContent}
                style={styles.topTenFlatList}
                removeClippedSubviews={true}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
=======
                removeClippedSubviews={false} // ← TV spatial nav fix
                contentContainerStyle={[
                  styles.topTenListContent,
                  { overflow: 'visible' }, // ← border show hogi
                ]}
                style={{ overflow: 'visible' }}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              />
            </View>
          )}

<<<<<<< HEAD
          {newArrivals.length > 0 && (
            <>
              <AppText
                variant="bold"
                size="xl"
                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
              >
                New Arrival
              </AppText>
              <FlatList
                horizontal
                data={newArrivals}
                renderItem={renderMovieItem}
                keyExtractor={item => `new-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.newArrivalListContent}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
              />
            </>
          )}

          {continueWatching.length > 0 && (
            <>
              <AppText
                variant="bold"
                size="xl"
                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
              >
                Continue Watching
              </AppText>
              <FlatList
                horizontal
                data={continueWatching}
                renderItem={({ item }) => (
                  <ContinueWatchingCard
                    imageUrl={item.posterUrl}
                    title={item.title}
                    progress={
                      item.duration > 0 ? item.position / item.duration : 0
                    }
                    width={moderateScale(180)}
                    height={moderateScale(101)}
                    onPress={() => handleContinueWatchingPress(item)}
                    onLongPress={() => handleContinueWatchingRemove(item)}
                  />
                )}
                keyExtractor={item => `cw-${item.key}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.newArrivalListContent}
              />
            </>
          )}

          {/* Ad slot 1 — after Continue Watching */}
          {ads['ad 1']?.length > 0 && (
            <AdBanner ads={ads['ad 1']} width={bannerWidth} />
          )}

          {indianMovies.length > 0 && (
            <>
              <AppText
                variant="bold"
                size="xl"
                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
              >
=======
          {bollywoodMovies.length > 0 && (
            <>
              <AppText variant="bold" size="xl" style={styles.sectionTitle}>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                Bollywood
              </AppText>
              <FlatList
                horizontal
<<<<<<< HEAD
                data={indianMovies}
                renderItem={renderMovieItem}
                keyExtractor={item => `indian-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
=======
                data={bollywoodMovies}
                renderItem={renderMovieItem}
                keyExtractor={item => `bolly-${item.id}`}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={false} // ← TV spatial nav fix
                contentContainerStyle={styles.listContent}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              />
            </>
          )}

<<<<<<< HEAD
          {internationalMovies.length > 0 && (
=======
          {hollywoodMovies.length > 0 && (
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
                data={internationalMovies}
                renderItem={renderMovieItem}
                keyExtractor={item => `intl-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
=======
                data={hollywoodMovies}
                renderItem={renderMovieItem}
                keyExtractor={item => `holly-${item.id}`}
                showsHorizontalScrollIndicator={false}
                removeClippedSubviews={false} // ← TV spatial nav fix
                contentContainerStyle={styles.listContent}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              />
            </>
          )}

<<<<<<< HEAD
          {/* Ad slots 2, 3, 4 — Hollywood section */}
          {/* {['ad 2', 'ad 3', 'ad 4'].map(slot =>
            ads[slot]?.length > 0 ? (
              <AdBanner key={slot} ads={ads[slot]} />
            ) : null,
          )} */}

          {ads['ad 2']?.length > 0 && (
            <AdBanner ads={ads['ad 2']} width={bannerWidth} />
          )}

          {southPrimeMovies.length > 0 && (
            <>
              <AppText
                variant="bold"
                size="xl"
                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
              >
                South Indian
              </AppText>
              <FlatList
                horizontal
                data={southPrimeMovies}
                renderItem={renderMovieItem}
                keyExtractor={item => `south-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
              />
            </>
          )}

          {ads['ad 3']?.length > 0 && (
            <AdBanner ads={ads['ad 3']} width={bannerWidth} />
          )}

          {topTenTvSerials.length > 0 && (
            <View style={[styles.topTenSection, { marginTop: spacing.lg }]}>
              <AppText variant="bold" size="xl" style={styles.sectionTitle}>
                Top 10 TV Serials in Pakistan Today
              </AppText>
              <FlatList
                horizontal
                data={topTenTvSerials}
                renderItem={renderTopTenTVSerialsItem}
                keyExtractor={item => `top-serial-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topTenListContent}
                style={styles.topTenFlatList}
                removeClippedSubviews={false}
              />
            </View>
          )}
          {latestTVShows.length > 0 && (
            <>
              <AppText
                variant="bold"
                size="xl"
                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
              >
                TV Shows
              </AppText>
              <FlatList
                horizontal
                data={latestTVShows}
                renderItem={renderTVShowsItem}
                keyExtractor={item => `show-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={false}
              />
            </>
          )}

          {topTenWebSeries.length > 0 && (
            <View style={[styles.topTenSection, { marginTop: spacing.lg }]}>
              <AppText variant="bold" size="xl" style={styles.sectionTitle}>
                Top 10 Web series in Pakistan Today
              </AppText>
              <FlatList
                horizontal
                data={topTenWebSeries}
                renderItem={renderTopTenWebSeriesItem}
                keyExtractor={item => `top-web-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topTenListContent}
                style={styles.topTenFlatList}
                removeClippedSubviews={true}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
              />
            </View>
          )}

          {ads['ad 4']?.length > 0 && (
            <AdBanner ads={ads['ad 4']} width={bannerWidth} />
          )}

=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={true}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
              />
            </>
          )}

          {/* {topTenTvShows.length > 0 && (
            <View style={[styles.topTenSection, { marginTop: spacing.lg }]}>
              <AppText variant="bold" size="xl" style={styles.sectionTitle}>
               Trending TV-Shows in Pakistan Today
              </AppText>
              <FlatList
                horizontal
                data={topTenTvShows}
                renderItem={renderTopTenTVShowsItem}
                keyExtractor={item => `top-show-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topTenListContent}
                style={styles.topTenFlatList}
                removeClippedSubviews={true}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
              />
            </View>
          )} */}
          {/* 
          {latestTVSerials.length > 0 && (
            <>
              <AppText
                variant="bold"
                size="xl"
                style={[styles.sectionTitle, { marginTop: spacing.lg }]}
              >
                TV Serials
              </AppText>
              <FlatList
                horizontal
                data={latestTVSerials}
                renderItem={renderTVSerialsItem}
                keyExtractor={item => `serial-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                removeClippedSubviews={false}
              />
            </>
          )}  */}
=======
                removeClippedSubviews={false} // ← TV spatial nav fix
                contentContainerStyle={styles.listContent}
              />
            </>
          )}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
          <Loader />
=======
          <ActivityIndicator size="large" color={colors.primary} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  galleryWrapper: {
    width: '100%',
    marginTop: spacing.sm,
    paddingVertical: 6,
  },
  galleryItemCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.backgroundLight,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
<<<<<<< HEAD
    gap: 5,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  bannerContainer: {
    width: '100%',
    // On TV screens, use a fixed height (55% of screen) so the banner never
    // overflows the viewport and cuts off. Tablets keep the aspect ratio.
    ...(isTV
      ? { height: Math.round(SCREEN_HEIGHT * 0.55) }
      : { aspectRatio: isTablet ? 16 / 7 : 16 / 9 }),
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
<<<<<<< HEAD
    height: '60%',
    backgroundColor: 'transparent',
    // Multi-stop gradient effect using layered shadows
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -30 },
    shadowOpacity: 1,
    shadowRadius: 40,
    background:
      'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
  },
  categoryBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: '#ffbd00',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryBadgeText: {
    color: colors.black,
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  galleryBottomInfo: {
    position: 'absolute',
    bottom: moderateScale(54),
    left: spacing.md,
    right: moderateScale(60),
  },
  galleryTitle: {
    color: colors.white,
    fontSize: moderateScale(16, 0.4),
    fontWeight: '700',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  galleryCategory: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: moderateScale(11),
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.2,
=======
    height: '50%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 1,
    shadowRadius: 30,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
  featuredTitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
    color: colors.textPrimary,
    letterSpacing: 1,
    fontSize: moderateScale(26, 0.4),
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  featuredTags: {
    color: colors.white,
    fontSize: moderateScale(13),
    fontWeight: '600',
  },
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
<<<<<<< HEAD
  netflixPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
  },
  playButtonText: {
    color: colors.black,
    marginLeft: spacing.xs,
    fontSize: moderateScale(14),
  },
  netflixListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
  },
  listButtonText: {
    color: colors.white,
    marginLeft: spacing.xs,
    fontSize: moderateScale(14),
  },
  content: {
    paddingVertical: spacing.md,
  },
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  sectionTitle: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
    fontSize: moderateScale(18, 0.3),
  },
<<<<<<< HEAD
  listContent: {
    paddingHorizontal: spacing.md,
  },
  movieCard: {
    marginRight: spacing.sm,
  },
  // ── New Arrivals styles ─────────────────────────────────────────
  newArrivalSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionAccentBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  newLivePill: {
    marginLeft: spacing.sm,
    backgroundColor: 'rgba(229,9,20,0.18)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  newLivePillText: {
    color: colors.primary,
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  newArrivalListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
=======
  listContent: { paddingHorizontal: spacing.md },
  movieCard: { marginRight: spacing.sm },
  centered: { justifyContent: 'center', alignItems: 'center' },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
  featuredContent: {
    width: '100%',
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  bannerNetflixLogo: {
    width: 25,
    height: 40,
    position: 'absolute',
    top: 20,
    left: 20,
    resizeMode: 'contain',
  },
  tagLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  tagDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
    marginHorizontal: spacing.sm,
    opacity: 0.6,
  },
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
<<<<<<< HEAD
  topTenSection: {
    paddingVertical: 4,
    overflow: 'visible',
  },
  topTenFlatList: {
    overflow: 'visible',
    marginVertical: -6,
  },
  topTenListContent: {
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.md,
    // Compensate for the negative marginVertical above so items sit in correct position
    paddingVertical: 6,
  },
  topTenCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    height: moderateScale(175), // Extra height for focus border room
    width: moderateScale(165),
    overflow: 'visible',
  },
  topTenMovieCard: {
    marginLeft: moderateScale(50),
    elevation: 5,
    zIndex: 1, // Card sits behind the number
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  topTenNumberContainer: {
    position: 'absolute',
    left: 0,
    bottom: -moderateScale(15),
    zIndex: 10, // Number always in front of card
    elevation: 20, // Ensure it's above the card on Android
  },
  topTenNumber: {
    fontSize: moderateScale(120), // Increased size
    fontWeight: '900',
    color: colors.background, // Match background for hollow effect
    includeFontPadding: false,
    letterSpacing: -5,
  },
  topTenNumberOutline: {
    position: 'absolute',
    color: '#FFFFFF', // Solid white for a brighter, clearer outline
  },
  topTenSeriesCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    height: moderateScale(120), // Increased from 110 for border room
    width: moderateScale(225),
    overflow: 'visible',
  },
  topTenSeriesCard: {
    marginLeft: moderateScale(40), // Increased from 35 for number space
    elevation: 5,
    zIndex: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
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
    // elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
});

export default HomeScreen;
