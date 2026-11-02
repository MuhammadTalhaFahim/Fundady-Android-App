<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
=======
import React, { useState, useEffect, useRef } from 'react';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import {
  View,
  StyleSheet,
  TextInput,
<<<<<<< HEAD
  Pressable,
  FlatList,
  Image,
  Platform,
  StatusBar,
  useWindowDimensions,
  Keyboard,
  BackHandler,
  NativeModules,
} from 'react-native';
import Icon from '../../components/common/SvgIcon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { moderateScale, isTV } from '../../utils/responsive';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
=======
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import {
  MOVIES_POSTER_BASE_URL,
  SPORTS_POSTER_BASE_URL,
  GALLERY_POSTER_BASE_URL,
<<<<<<< HEAD
  TV_SHOWS_POSTER_BASE_URL,
} from '../../utils/constants';
import { movieService } from '../../services/movieService';
import Loader from '../../components/common/Loader';

// Force-show the Android soft keyboard — needed on Android TV where
// the IME is suppressed by default even after .focus() is called.
const forceShowKeyboard = () => {
  try {
    if (NativeModules.KeyboardModule?.showKeyboard) {
      NativeModules.KeyboardModule.showKeyboard();
    }
  } catch (e) {
    // ignore on platforms without the native module
  }
};

const SEARCH_API_URL = 'https://fundady.com/api/v1/search';

// ─── Helpers ────────────────────────────────────────────────────────────────

const detectContentType = item => {
  const category = String(item.category || item.categories || '').toLowerCase();
  const showType = String(item.show_type || '').toLowerCase();
  const name = String(item.name || '').toLowerCase();
  const videoLink = String(
    item.video_link || item.movie_url || item.movie_link || '',
  ).toLowerCase();

  if (
    showType.includes('series') ||
    category.includes('series') ||
    name.includes('series') ||
    videoLink.includes('/series/')
  )
    return 'web_series';
  if (
    showType.includes('tv_show') ||
    showType.includes('tv show') ||
    category.includes('tv shows') ||
    category.includes('reality') ||
    videoLink.includes('/tv_shows/')
  )
    return 'tv_show';
  if (
    showType.includes('tv_serial') ||
    showType.includes('tv serial') ||
    category.includes('tv serials') ||
    videoLink.includes('/tv_serials/')
  )
    return 'tv_serial';
  if (
    category.includes('wwe') ||
    name.includes('wwe') ||
    videoLink.includes('wwe') ||
    videoLink.includes('wrestling')
  )
    return 'wwe';
  if (
    category.includes('cricket') ||
    name.includes('cricket') ||
    videoLink.includes('cricket')
  )
    return 'cricket';
  if (
    category.includes('ufc') ||
    name.includes('ufc') ||
    videoLink.includes('ufc')
  )
    return 'ufc';
  if (
    category.includes('aew') ||
    name.includes('aew') ||
    videoLink.includes('aew')
  )
    return 'aew';
  if (
    category.includes('football') ||
    name.includes('football') ||
    videoLink.includes('football')
  )
    return 'football';
  if (category.includes('sport') || videoLink.includes('/sports/'))
    return 'sports';
  return 'movie';
};

const posterBaseForType = (contentType, item) => {
  if (['web_series', 'tv_show', 'tv_serial'].includes(contentType))
    return TV_SHOWS_POSTER_BASE_URL;
  if (
    ['wwe', 'cricket', 'ufc', 'aew', 'football', 'sports'].includes(contentType)
  )
    return SPORTS_POSTER_BASE_URL;
  if (item.movie_id && !item.id) return GALLERY_POSTER_BASE_URL;
  return MOVIES_POSTER_BASE_URL;
};

// ─── Search item ─────────────────────────────────────────────────────────────

const SearchItemComponent = ({
  item,
  navigateTo,
  contentType,
  posterBaseUrl,
  onPress,
  onPlayPress,
  isFocused,
  isPlayButtonFocused,
}) => {
  const [isItemFocused, setIsItemFocused] = useState(false);
  const [isPlayFocused, setIsPlayFocused] = useState(false);
  const highlighted = isFocused || isItemFocused;
  const playHighlighted = isPlayButtonFocused || isPlayFocused;

  return (
    <Pressable
      focusable={isTV}
      onFocus={() => setIsItemFocused(true)}
      onBlur={() => setIsItemFocused(false)}
      onPress={onPress}
      style={[
        styles.searchItemWrapper,
        highlighted && {
          borderColor: colors.primary,
          borderWidth: 2,
          backgroundColor: 'rgba(255,255,255,0.05)',
          transform: [{ scale: 1.02 }],
          shadowColor: colors.primary,
          shadowOpacity: 0.4,
          shadowRadius: 5,
        },
      ]}
    >
      <View style={styles.searchItemMain}>
        <Image
          source={{ uri: `${posterBaseUrl}${item.poster}` }}
          style={{
            width: moderateScale(140),
            height: moderateScale(80),
            resizeMode: 'cover',
          }}
        />
        <View style={styles.textContainer}>
          <AppText
            style={[styles.itemTitleText, { fontSize: moderateScale(15, 0.4) }]}
            numberOfLines={1}
          >
            {item.title}
          </AppText>
          {item.category || item.categories ? (
            <AppText
              color={colors.textSecondary}
              size="xs"
              style={[styles.itemCategoryText, { fontSize: moderateScale(12) }]}
            >
              {String(item.category || item.categories)}
            </AppText>
          ) : null}
        </View>
      </View>

      <Pressable
        focusable={isTV}
        onFocus={() => setIsPlayFocused(true)}
        onBlur={() => setIsPlayFocused(false)}
        onPress={onPlayPress}
        style={styles.playIconButton}
      >
        <Icon
          name="play-circle-outline"
          size={30}
          color={playHighlighted ? colors.primary : colors.white}
        />
      </Pressable>
    </Pressable>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────

=======
  TV_SHOWS_POSTER_BASE_URL
} from '../../utils/constants';
import { movieService } from '../../services/movieService';

const SEARCH_API_URL = 'https://fundady.com/api/v1/search';

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
<<<<<<< HEAD
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isClearFocused, setIsClearFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  // tvSubFocus: which column is highlighted within a result row on TV
  // 'item' = left side (→ Detail), 'play' = right play icon (→ direct play)
  const [tvSubFocus, setTvSubFocus] = useState('item');
  // isClearFocusedTV: D-pad Right from input bar lands here
  const [isClearFocusedTV, setIsClearFocusedTV] = useState(false);

  const inputRef = useRef(null);

  // Keep ref copies so TV event handler always reads fresh values
  // without needing to re-register the handler on every state change.
  const selectedIndexRef = useRef(selectedIndex);
  const resultsRef = useRef(results);
  const isInputFocusedRef = useRef(isInputFocused);
  const isKeyboardVisibleRef = useRef(isKeyboardVisible);
  const tvSubFocusRef = useRef(tvSubFocus);
  const isClearFocusedTVRef = useRef(isClearFocusedTV);
  const searchQueryRef = useRef(searchQuery);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);
  useEffect(() => {
    isInputFocusedRef.current = isInputFocused;
  }, [isInputFocused]);
  useEffect(() => {
    isKeyboardVisibleRef.current = isKeyboardVisible;
  }, [isKeyboardVisible]);
  useEffect(() => {
    tvSubFocusRef.current = tvSubFocus;
  }, [tvSubFocus]);
  useEffect(() => {
    isClearFocusedTVRef.current = isClearFocusedTV;
  }, [isClearFocusedTV]);
  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  // ── Keyboard visibility ──────────────────────────────────────────────────
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // ── Hardware back (phone/tablet) ─────────────────────────────────────────
  useEffect(() => {
    const onBack = () => {
      if (inputRef.current?.isFocused()) {
        inputRef.current.blur();
        Keyboard.dismiss();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []);

  // ── TV remote handler ────────────────────────────────────────────────────
  // IMPORTANT: callback is stable (no deps) – reads live values via refs.
  // This avoids the stale-closure bug where isInputFocused / results etc.
  // are forever frozen at their mount-time values.
  const tvHandler = useCallback(
    evt => {
      if (!isTV) return;

      const { eventType } = evt;
      const kbVisible = isKeyboardVisibleRef.current;
      const inputActive = isInputFocusedRef.current;
      const selIdx = selectedIndexRef.current;
      const currentResults = resultsRef.current;
      const subFocus = tvSubFocusRef.current;
      const clearFocused = isClearFocusedTVRef.current;

      // ── Keyboard is open ───────────────────────────────────────────────────
      // Back/Menu closes it; everything else goes to the OS so typing works.
      if (kbVisible) {
        if (eventType === 'menu' || eventType === 'back') {
          Keyboard.dismiss();
          inputRef.current?.blur();
          setSelectedIndex(-1);
          setIsClearFocusedTV(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
        return;
      }

      // ── Clear (✕) button is focused ────────────────────────────────────────
      if (clearFocused) {
        if (eventType === 'select') {
          // OK on clear button → wipe the search text, return to input
          setSearchQuery('');
          setIsClearFocusedTV(false);
          setTimeout(() => inputRef.current?.focus(), 50);
          return;
        }
        if (
          eventType === 'left' ||
          eventType === 'back' ||
          eventType === 'menu'
        ) {
          // Go back to the input bar
          setIsClearFocusedTV(false);
          setTimeout(() => inputRef.current?.focus(), 50);
          return;
        }
        // Down from clear → go into results
        if (eventType === 'down') {
          setIsClearFocusedTV(false);
          if (currentResults.length > 0) {
            setSelectedIndex(0);
            setTvSubFocus('item');
          }
          return;
        }
        return; // block other keys while clear is focused
      }

      // ── Input bar is focused (keyboard closed) ─────────────────────────────
      if (inputActive) {
        if (eventType === 'select') {
          // OK → open keyboard
          inputRef.current?.focus();
          forceShowKeyboard();
          setTimeout(forceShowKeyboard, 300);
          return;
        }
        if (eventType === 'right' && searchQueryRef.current.length > 0) {
          // Right → move focus to the ✕ (clear) button
          inputRef.current?.blur();
          setIsClearFocusedTV(true);
          return;
        }
        if (eventType === 'down') {
          inputRef.current?.blur();
          Keyboard.dismiss();
          if (currentResults.length > 0) {
            setSelectedIndex(0);
            setTvSubFocus('item');
          }
          return;
        }
        return; // block other keys on input bar
      }

      // ── Result list ────────────────────────────────────────────────────────
      if (selIdx >= 0) {
        if (eventType === 'select') {
          const item = currentResults[selIdx];
          if (!item) return;
          if (subFocus === 'play') {
            // Play icon focused → direct play
            handleDirectPlay(item, detectContentType(item));
          } else {
            // Item body focused → go to Detail screen
            const contentType = detectContentType(item);
            const navigateTo = ['web_series', 'tv_show', 'tv_serial'].includes(
              contentType,
            )
              ? 'SeriesDetail'
              : 'MovieDetail';
            navigation.navigate(navigateTo, {
              id: item.id || item.movie_id,
              contentType,
              movieDataFallback: item,
            });
          }
          return;
        }

        if (eventType === 'right') {
          // Move focus to the play icon on the right
          setTvSubFocus('play');
          return;
        }

        if (eventType === 'left') {
          if (subFocus === 'play') {
            // Go back to item body
            setTvSubFocus('item');
          } else {
            // Already on item body → do nothing (can't go further left)
          }
          return;
        }

        if (eventType === 'up') {
          setTvSubFocus('item'); // reset sub-focus when moving rows
          setSelectedIndex(prev => {
            const next = prev <= 0 ? -1 : prev - 1;
            if (next === -1) inputRef.current?.focus();
            return next;
          });
          return;
        }

        if (eventType === 'down') {
          setTvSubFocus('item'); // reset sub-focus when moving rows
          setSelectedIndex(prev =>
            Math.min(currentResults.length - 1, prev + 1),
          );
          return;
        }

        if (eventType === 'menu' || eventType === 'back') {
          setSelectedIndex(-1);
          setTvSubFocus('item');
          setTimeout(() => inputRef.current?.focus(), 50);
          return;
        }
      }
    },
    [handleDirectPlay, navigation],
  ); // stable; reads live state via refs

  // Register with whichever TV API is available.
  useEffect(() => {
    if (!isTV) return;

    // react-native >= 0.64 ships useTVEventHandler as a hook, not importable
    // in useEffect. We use the underlying subscribe API directly here.
    // This works on both older (TVEventHandler class) and newer RN TV builds.
    let cleanup = () => {};

    try {
      // Newer RN TV: TurboModule / native subscription
      const { TVEventControl } = require('react-native');
      if (TVEventControl?.addTVEventListener) {
        const sub = TVEventControl.addTVEventListener(tvHandler);
        cleanup = () => sub?.remove?.();
      } else {
        throw new Error('no TVEventControl');
      }
    } catch {
      try {
        // Older RN TV: TVEventHandler class
        const { TVEventHandler } = require('react-native');
        const handler = new TVEventHandler();
        handler.enable(null, tvHandler);
        cleanup = () => handler.disable();
      } catch {
        // Neither API available – TV remote won't work, silent fallback.
      }
    }

    return cleanup;
  }, [tvHandler]); // tvHandler is stable so this runs only once

  // ── Auto-focus input on screen focus ────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (isTV) {
        // On Android TV: focus the input so the D-pad highlight lands on it.
        // The keyboard only opens when the user presses OK/Select — handled
        // in the tvHandler above via forceShowKeyboard().
        const t = setTimeout(() => inputRef.current?.focus(), 400);
        return () => clearTimeout(t);
      } else {
        // On phone/tablet: focus + let the OS show the keyboard naturally.
        const t = setTimeout(() => inputRef.current?.focus(), 200);
        return () => clearTimeout(t);
      }
    }, []),
  );

  // ── Search API ───────────────────────────────────────────────────────────
  const fetchResults = useCallback(
    async (query, signal) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.append('title', query.trim());
        if (selectedCategory) params.append('category', selectedCategory);
        if (selectedYear) params.append('year', selectedYear);
        const qs = params.toString();
        const url = qs ? `${SEARCH_API_URL}?${qs}` : SEARCH_API_URL;
        const res = await fetch(url, { signal });
        const json = await res.json();
        if (json.status) {
          setResults(json.data?.data || json.data || []);
        }
      } catch (err) {
        if (err.name !== 'AbortError') console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory, selectedYear],
  );

  useEffect(() => {
    const controller = new AbortController();
    if (!searchQuery && !selectedCategory && !selectedYear) {
      fetchResults('', controller.signal);
      return () => controller.abort();
    }
    const t = setTimeout(
      () => fetchResults(searchQuery, controller.signal),
      400,
    );
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [searchQuery, selectedCategory, selectedYear, fetchResults]);

  // ── Direct play ──────────────────────────────────────────────────────────
  const handleDirectPlay = useCallback(
    async (item, contentType) => {
      setIsActionLoading(true);
      try {
        const id = item.id || item.movie_id;
        let detailRes;
        if (contentType === 'web_series')
          detailRes = await movieService.getWebSeriesById(id);
        else if (contentType === 'tv_show')
          detailRes = await movieService.getTVShowById(id);
        else if (contentType === 'tv_serial')
          detailRes = await movieService.getTVSerialById(id);
        else if (contentType === 'wwe')
          detailRes = await movieService.getWWEById(id);
        else if (contentType === 'cricket')
          detailRes = await movieService.getCricketById(id);
        else if (contentType === 'ufc')
          detailRes = await movieService.getUFCById(id);
        else if (contentType === 'aew')
          detailRes = await movieService.getAEWById(id);
        else detailRes = await movieService.getMovieById(id);

        if (!detailRes) return;

        const responseData = detailRes.data || detailRes;
        let mediaData = null;

        if (['cricket', 'wwe', 'ufc', 'aew'].includes(contentType)) {
          mediaData =
            responseData?.[contentType]?.data?.[0] ||
            responseData?.data?.[0] ||
            (Array.isArray(responseData) ? responseData[0] : responseData);
        } else if (
          ['web_series', 'tv_show', 'tv_serial'].includes(contentType)
        ) {
          mediaData =
            responseData?.tvshows?.[0] ||
            responseData?.tvshows?.data?.[0] ||
            responseData?.data?.[0] ||
            (Array.isArray(responseData) ? responseData[0] : responseData);
        } else {
          mediaData =
            responseData?.data?.[0] ||
            (Array.isArray(responseData) ? responseData[0] : responseData);
        }

        if (!mediaData) return;

        if (['web_series', 'tv_show', 'tv_serial'].includes(contentType)) {
          const eps = mediaData.links || mediaData.episodes || [];
          if (!eps.length) {
            alert('Episodes not found.');
            return;
          }
          const ep = eps[0];
          navigation.navigate('VideoPlayer', {
            videoUrl: ep.tvShow_link || ep.videoUrl || ep.movie_link,
            dualaudioUrl: ep.dual_link || ep.dualaudioUrl || ep.dualaudio_link,
            movieTitle: mediaData.title,
            isSeries: true,
            episodes: eps,
            initialIndex: 0,
            posterUrl: `${TV_SHOWS_POSTER_BASE_URL}${mediaData.poster}`,
          });
        } else {
          const streamLink =
            mediaData.video_link ||
            mediaData.movie_url ||
            mediaData.links?.[0]?.movie_link;
          const dualStreamLink = mediaData.links?.[0]?.dualaudio_link;
          if (!streamLink && !dualStreamLink) {
            alert('Media link not found.');
            return;
          }
          const isSports = ['wwe', 'cricket', 'ufc', 'aew'].includes(
            contentType,
          );
          navigation.navigate('VideoPlayer', {
            videoUrl: streamLink,
            dualaudioUrl: dualStreamLink,
            movieTitle: isSports
              ? mediaData.video_title || mediaData.title
              : mediaData.title,
            isSeries: false,
            posterUrl: `${
              isSports ? SPORTS_POSTER_BASE_URL : MOVIES_POSTER_BASE_URL
            }${mediaData.poster}`,
          });
        }
      } catch (err) {
        console.error('Error in direct play:', err);
        alert('Failed to start playback.');
      } finally {
        setIsActionLoading(false);
      }
    },
    [navigation],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const renderSearchItem = useCallback(
    ({ item, index }) => {
      const contentType = detectContentType(item);
      const navigateTo = ['web_series', 'tv_show', 'tv_serial'].includes(
        contentType,
      )
        ? 'SeriesDetail'
        : 'MovieDetail';
      const posterBaseUrl = posterBaseForType(contentType, item);
      const isFocused =
        isTV && index === selectedIndex && tvSubFocus === 'item';
      const isPlayBtnFocused =
        isTV && index === selectedIndex && tvSubFocus === 'play';

      return (
        <SearchItemComponent
          item={item}
          navigateTo={navigateTo}
          contentType={contentType}
          posterBaseUrl={posterBaseUrl}
          onPress={() =>
            navigation.navigate(navigateTo, {
              id: item.id || item.movie_id,
              contentType,
              movieDataFallback: item,
            })
          }
          onPlayPress={() => handleDirectPlay(item, contentType)}
          isFocused={isFocused}
          isPlayButtonFocused={isPlayBtnFocused}
        />
      );
    },
    [selectedIndex, tvSubFocus, navigation, handleDirectPlay],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <MainHeader variant="inner" showSearch={false} />
        <View style={styles.searchBarRow}>
          <View
            style={[
              styles.searchBarWrapper,
              isTV && { borderWidth: 1, borderColor: '#2a2a2a' },
              isTV &&
                isInputFocused && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
            ]}
          >
=======
  const inputRef = useRef(null);

  // Standardized fetch function with cancellation support
  const fetchResults = async (query, signal) => {
    setLoading(true);
    try {
      // Build search URL with optional parameters
      const params = new URLSearchParams();
      if (query.trim()) params.append('title', query.trim());
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedYear) params.append('year', selectedYear);

      const queryString = params.toString();
      const url = queryString ? `${SEARCH_API_URL}?${queryString}` : SEARCH_API_URL;

      const response = await fetch(url, { signal });
      const json = await response.json();
      if (json.status) {
        // The search API returns results in json.data.data
        const data = json.data?.data || json.data || [];
        setResults(data);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Perform initial load immediately, debounce user typing
    if (searchQuery === '' && !selectedCategory && !selectedYear) {
      fetchResults('', signal);
    } else {
      const timer = setTimeout(() => {
        fetchResults(searchQuery, signal);
      }, 400);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }

    return () => {
      controller.abort();
    };
  }, [searchQuery, selectedCategory, selectedYear]);

  const handleSearch = text => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDirectPlay = async (item, contentType) => {
    setIsActionLoading(true);
    try {
      let detailRes;
      const id = item.id || item.movie_id;

      if (contentType === 'web_series') {
        detailRes = await movieService.getWebSeriesById(id);
      } else if (contentType === 'tv_show') {
        detailRes = await movieService.getTVShowById(id);
      } else if (contentType === 'tv_serial') {
        detailRes = await movieService.getTVSerialById(id);
      } else if (contentType === 'wwe') {
        detailRes = await movieService.getWWEById(id);
      } else if (contentType === 'cricket') {
        detailRes = await movieService.getCricketById(id);
      } else if (contentType === 'football') {
        detailRes = await movieService.getFootballById(id);
      } else {
        detailRes = await movieService.getMovieById(id);
      }

      if (detailRes) {
        // Robust data extraction
        const responseData = detailRes.data || detailRes;
        let mediaData = null;

        if (contentType === 'cricket' || contentType === 'wwe' || contentType === 'football') {
          mediaData = responseData?.[contentType]?.data?.[0] || responseData?.data?.[0] || (Array.isArray(responseData) ? responseData[0] : responseData);
        } else if (contentType === 'web_series' || contentType === 'tv_show' || contentType === 'tv_serial') {
          mediaData = responseData?.tvshows?.[0] || responseData?.tvshows?.data?.[0] || responseData?.data?.[0] || (Array.isArray(responseData) ? responseData[0] : responseData);
        } else {
          mediaData = responseData?.data?.[0] || (Array.isArray(responseData) ? responseData[0] : responseData);
        }

        if (mediaData) {
          const isSeries = contentType === 'web_series' || contentType === 'tv_show' || contentType === 'tv_serial';
          const isSports = contentType === 'cricket' || contentType === 'wwe' || contentType === 'football';

          if (isSeries) {
            const eps = mediaData.links || mediaData.episodes || [];
            if (eps.length > 0) {
              const ep = eps[0];
              // For series, usually the ep has tvShow_link, videoUrl, or movie_link
              const videoUrl = ep.tvShow_link || ep.videoUrl || ep.movie_link;
              const dualaudioUrl = ep.dual_link || ep.dualaudioUrl || ep.dualaudio_link;

              if (videoUrl || dualaudioUrl) {
                navigation.navigate('VideoPlayer', {
                  videoUrl,
                  dualaudioUrl,
                  movieTitle: mediaData.title,
                  isSeries: true,
                  episodes: eps,
                  initialIndex: 0,
                  posterUrl: `${TV_SHOWS_POSTER_BASE_URL}${mediaData.poster}`
                });
              } else {
                alert('Series video link not found.');
              }
            } else {
              alert('Episodes not found.');
            }
          } else {
            // Movie or Sports
            const streamLink = mediaData.video_link || mediaData.movie_url || (mediaData.links && mediaData.links.length > 0 ? mediaData.links[0].movie_link : null);
            const dualStreamLink = mediaData.links && mediaData.links.length > 0 ? mediaData.links[0].dualaudio_link : null;

            if (streamLink || dualStreamLink) {
              navigation.navigate('VideoPlayer', {
                videoUrl: streamLink,
                dualaudioUrl: dualStreamLink,
                movieTitle: isSports ? (mediaData.video_title || mediaData.title) : mediaData.title,
                isSeries: false,
                posterUrl: `${isSports ? SPORTS_POSTER_BASE_URL : MOVIES_POSTER_BASE_URL}${mediaData.poster}`
              });
            } else {
              alert('Media link not found.');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in direct play:', error);
      alert('Failed to start playback.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const renderSearchItem = ({ item }) => {
    // 1. Determine Content Type and Detail Navigation Target
    const category = (item.category || '').toLowerCase();
    const showType = (item.show_type || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const title = (item.title || item.video_title || '').toLowerCase();
    const videoLink = (item.video_link || item.movie_url || item.movie_link || '').toLowerCase();

    // Determine type flags
    const isSeries = showType.includes('series') || category.includes('series') || name.includes('series') || videoLink.includes('/series/');
    const isTvShow = category.includes('tv shows') || category.includes('reality') || name.includes('tv shows') || videoLink.includes('/tv_shows/');
    const isTvSerial = category.includes('tv serials') || name.includes('tv serials') || videoLink.includes('/tv_serials/');

    const isWwe = category.includes('wwe') || name.includes('wwe') || title.includes('wwe') || videoLink.includes('wwe') || videoLink.includes('wrestling');
    const isCricket = category.includes('cricket') || name.includes('cricket') || title.includes('cricket') || videoLink.includes('cricket');
    const isFootball = category.includes('football') || name.includes('football') || title.includes('football') || videoLink.includes('football');
    const isOtherSports = category.includes('sport') || videoLink.includes('/sports/');

    const isSports = isWwe || isCricket || isFootball || isOtherSports;

    let contentType = 'movie';
    let navigateTo = 'MovieDetail';
    let posterBaseUrl = MOVIES_POSTER_BASE_URL;

    if (isSeries) {
      contentType = 'web_series';
      navigateTo = 'SeriesDetail';
      posterBaseUrl = TV_SHOWS_POSTER_BASE_URL;
    } else if (isTvShow) {
      contentType = 'tv_show';
      navigateTo = 'SeriesDetail';
      posterBaseUrl = TV_SHOWS_POSTER_BASE_URL;
    } else if (isTvSerial) {
      contentType = 'tv_serial';
      navigateTo = 'SeriesDetail';
      posterBaseUrl = TV_SHOWS_POSTER_BASE_URL;
    } else if (isWwe) {
      contentType = 'wwe';
      posterBaseUrl = SPORTS_POSTER_BASE_URL;
    } else if (isCricket) {
      contentType = 'cricket';
      posterBaseUrl = SPORTS_POSTER_BASE_URL;
    } else if (isFootball) {
      contentType = 'football';
      posterBaseUrl = SPORTS_POSTER_BASE_URL;
    } else if (isOtherSports) {
      contentType = 'sports';
      posterBaseUrl = SPORTS_POSTER_BASE_URL;
    } else if (item.movie_id && !item.id) {
      // Feature Gallery items
      posterBaseUrl = GALLERY_POSTER_BASE_URL;
    }

    return (
      <View style={styles.searchItemWrapper}>
        <TouchableOpacity
          style={styles.searchItemMain}
          onPress={() => navigation.navigate(navigateTo, {
            id: item.id || item.movie_id,
            contentType: contentType,
            movieDataFallback: item
          })}
        >
          <Image
            source={{ uri: `${posterBaseUrl}${item.poster}` }}
            style={styles.itemPosterThumbnail}
          />
          <View style={styles.textContainer}>
            <AppText style={styles.itemTitleText} numberOfLines={1}>
              {item.title}
            </AppText>
            {item.category && (
              <AppText color={colors.textSecondary} size="xs" style={styles.itemCategoryText}>
                {item.category}
              </AppText>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playIconButton}
          onPress={() => handleDirectPlay(item, contentType)}
        >
          <Icon
            name="play-circle-outline"
            size={30}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Netflix Style Header */}
      <View style={styles.headerContainer}>
        <MainHeader variant="inner" showSearch={false} />

        {/* Search Bar Row */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchBarWrapper}>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            <Icon
              name="search"
              size={24}
              color={colors.textSecondary}
              style={styles.searchIconInBar}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInputField}
              placeholder="Search shows, movies, sports..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
<<<<<<< HEAD
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                inputRef.current?.blur();
                Keyboard.dismiss();
              }}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              showSoftInputOnFocus
              autoCorrect={false}
              returnKeyType="search"
              autoFocus={!isTV}
              blurOnSubmit={false}
            />
            <Pressable
              focusable={isTV && searchQuery.length > 0}
              onPress={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              onFocus={() => {
                setIsClearFocused(true);
                setIsClearFocusedTV(true);
              }}
              onBlur={() => {
                setIsClearFocused(false);
                setIsClearFocusedTV(false);
              }}
              style={[
                (isClearFocused || isClearFocusedTV) && {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 15,
                  padding: 4,
                },
              ]}
            >
              <Icon
                name={searchQuery.length > 0 ? 'close' : ''}
                size={24}
                color={
                  isClearFocused || isClearFocusedTV
                    ? colors.primary
                    : colors.textSecondary
                }
              />
            </Pressable>
=======
              onChangeText={handleSearch}
            />
            <TouchableOpacity
              onPress={searchQuery.length > 0 ? clearSearch : null}
            >
              {/* <Icon
                name={searchQuery.length > 0 ? 'close' : 'mic'}
                size={24}
                color={colors.textSecondary}
              /> */}
                 <Icon
                name={searchQuery.length > 0 ? 'close' : ''}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
          </View>
        </View>
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.centeredView}>
<<<<<<< HEAD
          <Loader />
=======
          <ActivityIndicator size="large" color={colors.primary} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        </View>
      ) : (
        <View style={styles.contentView}>
          <FlatList
            data={results}
            renderItem={renderSearchItem}
<<<<<<< HEAD
            keyExtractor={item =>
              String(item.id || item.movie_id || Math.random())
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentStyle}
            ListEmptyComponent={
              !loading && (
                <View style={styles.noResultsBox}>
                  <AppText color={colors.textSecondary}>
                    {searchQuery === ''
                      ? 'Search what you want'
                      : `No results found for "${searchQuery}"`}
                  </AppText>
                </View>
              )
=======
            keyExtractor={item => (item.id || item.movie_id || Math.random()).toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentStyle}
            ListEmptyComponent={
              !loading ? (
                <View style={styles.noResultsBox}>
                  {searchQuery === '' ? (
                    <AppText color={colors.textSecondary}>
                      Search what you want
                    </AppText>
                  ) : (
                    <AppText color={colors.textSecondary}>
                      No results found for "{searchQuery}"
                    </AppText>
                  )}
                </View>
              ) : null
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            }
          />
        </View>
      )}

      {isActionLoading && (
        <View style={styles.actionOverlay}>
<<<<<<< HEAD
          <Loader />
=======
          <ActivityIndicator size="large" color={colors.primary} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        </View>
      )}
    </View>
  );
};

<<<<<<< HEAD
// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
=======
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  headerContainer: {
    backgroundColor: colors.black,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    paddingBottom: spacing.sm,
  },
<<<<<<< HEAD
  searchBarRow: { paddingHorizontal: spacing.sm },
=======
  searchBarRow: {
    paddingHorizontal: spacing.sm,
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    height: 50,
  },
<<<<<<< HEAD
  searchIconInBar: { marginRight: spacing.sm },
=======
  searchIconInBar: {
    marginRight: spacing.sm,
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  searchInputField: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    height: '100%',
  },
<<<<<<< HEAD
  contentView: { flex: 1 },
  listContentStyle: { paddingBottom: spacing.xl },
=======
  contentView: {
    flex: 1,
  },
  listContentStyle: {
    paddingBottom: spacing.xl,
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  searchItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginBottom: 2,
    paddingRight: spacing.sm,
<<<<<<< HEAD
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchItemMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  itemTitleText: { fontSize: 15, color: colors.white },
  itemCategoryText: { marginTop: 2 },
=======
  },
  searchItemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPosterThumbnail: {
    width: 140,
    height: 80,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  itemTitleText: {
    fontSize: 15,
    color: colors.white,
  },
  itemCategoryText: {
    marginTop: 2,
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  playIconButton: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
<<<<<<< HEAD
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noResultsBox: { padding: spacing.xl, alignItems: 'center' },
=======
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default SearchScreen;
