import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
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

import {
  MOVIES_POSTER_BASE_URL,
  SPORTS_POSTER_BASE_URL,
  GALLERY_POSTER_BASE_URL,
  TV_SHOWS_POSTER_BASE_URL
} from '../../utils/constants';
import { movieService } from '../../services/movieService';

const SEARCH_API_URL = 'https://fundady.com/api/v1/search';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
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
          </View>
        </View>
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.contentView}>
          <FlatList
            data={results}
            renderItem={renderSearchItem}
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
            }
          />
        </View>
      )}

      {isActionLoading && (
        <View style={styles.actionOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
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
  searchBarRow: {
    paddingHorizontal: spacing.sm,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    height: 50,
  },
  searchIconInBar: {
    marginRight: spacing.sm,
  },
  searchInputField: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    height: '100%',
  },
  contentView: {
    flex: 1,
  },
  listContentStyle: {
    paddingBottom: spacing.xl,
  },
  searchItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginBottom: 2,
    paddingRight: spacing.sm,
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
  playIconButton: {
    padding: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default SearchScreen;
