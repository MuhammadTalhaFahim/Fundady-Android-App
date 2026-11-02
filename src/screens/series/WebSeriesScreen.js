import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView as RNScrollView,
  Animated,
  Platform,
  useWindowDimensions,
<<<<<<< HEAD
  RefreshControl,
} from 'react-native';
import Loader from '../../components/common/Loader';
=======
  RefreshControl
} from 'react-native';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
import Icon from '../../components/common/SvgIcon';
import CategoryModal from '../../components/common/CategoryModal';
import { TV_SHOWS_POSTER_BASE_URL } from '../../utils/constants';
import Orientation from 'react-native-orientation-locker';
import { isTablet, isTV } from '../../utils/responsive';

import { movieService } from '../../services/movieService';

<<<<<<< HEAD
const formatShowTypeTab = st => {
  const slug = st.toLowerCase().trim();
  let title = st.replace(/_/g, ' ');
  if (slug === 'tv_shows') title = 'TV Shows';
  else if (slug === 'tv_serials') title = 'TV Serials';
  else if (slug === 'web_series') title = 'Web Series';
  return { raw: st, slug, title };
};

const DEFAULT_TABS = [
  { raw: 'Web_Series', slug: 'web_series', title: 'Web Series' },
  { raw: 'Tv_Shows', slug: 'tv_shows', title: 'TV Shows' },
  { raw: 'Tv_Serials', slug: 'tv_serials', title: 'TV Serials' },
];

const TabButton = ({ tab, activeTab, onPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Pressable
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      style={[
        styles.tab,
        activeTab === tab && styles.activeTab,
        isFocused && {
          borderColor: colors.primary,
          borderBottomWidth: 3,
          backgroundColor: 'rgba(255,255,255,0.05)',
          transform: [{ scale: 1.05 }],
        },
      ]}
    >
      <AppText
        variant={activeTab === tab || isFocused ? 'bold' : 'medium'}
        size="md"
        color={
          activeTab === tab || isFocused
            ? colors.textPrimary
            : colors.textSecondary
        }
      >
        {tab}
      </AppText>
    </Pressable>
  );
=======
const TABS = ['Web Series', 'TV Shows', 'TV Serials'];

const TabButton = ({ tab, activeTab, onPress }) => {
    const [isFocused, setIsFocused] = useState(false);
    return (
        <Pressable
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onPress={onPress}
            style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
                isFocused && {
                    borderColor: colors.primary,
                    borderBottomWidth: 3,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    transform: [{ scale: 1.05 }]
                }
            ]}
        >
            <AppText
                variant={activeTab === tab || isFocused ? 'bold' : 'medium'}
                size="md"
                color={activeTab === tab || isFocused ? colors.textPrimary : colors.textSecondary}
            >
                {tab}
            </AppText>
        </Pressable>
    );
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
};

const WebSeriesScreen = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const [isCategoryFocused, setIsCategoryFocused] = useState(false);
  const [isYearFocused, setIsYearFocused] = useState(false);
  const [isGenreFocused, setIsGenreFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (width < 600) {
        Orientation.lockToPortrait();
      }
<<<<<<< HEAD
    }, [width]),
  );
  const [tabs, setTabs] = useState(DEFAULT_TABS);
  const [activeTab, setActiveTab] = useState(DEFAULT_TABS[0]);
=======
    }, [width])
  );
  const [activeTab, setActiveTab] = useState(TABS[0]);
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [years, setYears] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('category'); // 'category', 'year', 'genre'
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isOpeningModal, setIsOpeningModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

<<<<<<< HEAD
  // Fetch dynamic categories for tabs
  useEffect(() => {
    const fetchCategoryTabs = async () => {
      try {
        const res = await movieService.getTVShowsCategoriesList();
        const rawList = Array.isArray(res) ? res : res?.data || [];
        const validList = rawList
          .map(item => (typeof item === 'string' ? item : item?.show_type))
          .filter(
            st => st && String(st).trim() !== '' && String(st).trim() !== '0',
          )
          .map(st => formatShowTypeTab(st));

        if (validList.length > 0) {
          setTabs(validList);
          setActiveTab(prev => {
            const match = validList.find(t => t.slug === prev?.slug);
            return match || validList[0];
          });
        }
      } catch (error) {
        console.error('Error fetching TV show dynamic categories:', error);
      }
    };
    fetchCategoryTabs();
  }, []);

  useEffect(() => {
    if (activeTab) {
      fetchData();
    }
=======
  useEffect(() => {
    fetchData();
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  }, [activeTab]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, yearsRes, genresRes] = await Promise.all([
          movieService.getSeriesCategories(),
          movieService.getYears(),
<<<<<<< HEAD
          movieService.getGenres(),
=======
          movieService.getGenres()
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        ]);

        if (catsRes.status) setCategories(catsRes.data);

        if (yearsRes.status) {
          const mappedYears = yearsRes.data.map(y => ({
            id: y.year,
<<<<<<< HEAD
            name: y.year.toString(),
=======
            name: y.year.toString()
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
          }));
          setYears(mappedYears);
        }

        if (genresRes.status) setGenres(genresRes.data);
      } catch (error) {
        console.error('Error fetching series metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    filterData();
  }, [activeTab, allData, selectedCategory, selectedYear, selectedGenre]);

  const fetchData = async (isRefresh = false) => {
<<<<<<< HEAD
    if (!activeTab) return;
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setAllData([]); // Clear previous data
    }
    try {
      let response;
<<<<<<< HEAD
      if (activeTab.slug === 'web_series') {
        response = await movieService.getWebSeries();
      } else if (activeTab.slug === 'tv_shows') {
        response = await movieService.getTVShows();
      } else if (activeTab.slug === 'tv_serials') {
        response = await movieService.getTVSerials();
      } else {
        response = await movieService.getTVShowsByCategory(activeTab.slug);
      }

      if (
        response &&
        (response.status ||
          Array.isArray(response) ||
          response.data ||
          response.tvshows)
      ) {
        const data =
          response.data?.tvshows ||
          response.tvshows ||
          (Array.isArray(response.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : []);
        setAllData(Array.isArray(data) ? data : []);
      } else {
        setAllData([]);
      }
    } catch (error) {
      console.error('Error fetching series data:', error);
      setAllData([]);
=======
      if (activeTab === 'Web Series') {
        response = await movieService.getWebSeries();
      } else if (activeTab === 'TV Shows') {
        response = await movieService.getTVShows();
      } else {
        response = await movieService.getTVSerials();
      }

      if (response.status) {
        // Correct extraction for your API: response.data.tvshows is the array
        const data = response.data?.tvshows || response.tvshows || (Array.isArray(response.data) ? response.data : []);
        setAllData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching series data:', error);
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [activeTab]);

<<<<<<< HEAD
  const numCols = isTablet || isTV ? 4 : 2;
  const stableWidth = width > 600 ? width : Math.min(width, height);
  const cardWidth = (stableWidth - spacing.md * 2) / numCols - 8;

  const renderMovieItem = useCallback(
    ({ item }) => {
      return (
        <MovieCard
          imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
          onPress={() => {
            const type = activeTab?.slug || 'web_series';
            navigation.navigate('SeriesDetail', {
              id: item.id,
              contentType: type,
            });
          }}
          width={cardWidth}
          height={cardWidth * 0.5625}
          releaseDate={item.release_date}
          createdAt={item.created_at}
          style={{ margin: 4 }}
        />
      );
    },
    [cardWidth, activeTab?.slug, navigation],
  );

=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  const filterData = () => {
    if (!allData.length) {
      setFilteredData([]);
      return;
    }

    let filtered = [...allData];

    // Then filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.categories
          ?.split(',')
          .map(c => c.trim())
          .includes(selectedCategory),
      );
    }

    // Filter by selected year
    if (selectedYear) {
<<<<<<< HEAD
      filtered = filtered.filter(
        item =>
          item.date?.startsWith(selectedYear) ||
          item.release_date?.startsWith(selectedYear),
=======
      filtered = filtered.filter(item =>
        item.date?.startsWith(selectedYear) ||
        item.release_date?.startsWith(selectedYear)
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
      );
    }

    // Filter by selected genre
    if (selectedGenre) {
      filtered = filtered.filter(item =>
        item.genre
          ?.split(',')
          .map(g => g.trim())
          .includes(selectedGenre),
      );
    }

    setFilteredData(filtered);
  };

  return (
    <View style={styles.container}>
      <MainHeader variant="home" title="Series" scrollY={scrollY} />

      <View style={styles.tabsContainer}>
<<<<<<< HEAD
        <RNScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {tabs.map(tabItem => (
            <TabButton
              key={tabItem.slug}
              tab={tabItem.title}
              activeTab={activeTab?.title}
              onPress={() => {
                setActiveTab(tabItem);
                setSelectedCategory(null);
                setSelectedYear(null);
                setSelectedGenre(null);
              }}
            />
          ))}
        </RNScrollView>
=======
        {TABS.map(tab => (
          <TabButton
            key={tab}
            tab={tab}
            activeTab={activeTab}
            onPress={() => setActiveTab(tab)}
          />
        ))}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
      </View>

      <View style={styles.filterBarContainer}>
        <RNScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          <Pressable
            onFocus={() => setIsCategoryFocused(true)}
            onBlur={() => setIsCategoryFocused(false)}
            style={[
              styles.filterTab,
              selectedCategory && styles.activeFilterTab,
              isCategoryFocused && {
                borderColor: colors.primary,
                borderWidth: 2,
                transform: [{ scale: 1.08 }],
<<<<<<< HEAD
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
=======
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            ]}
            onPress={() => {
              setModalType('category');
              setIsOpeningModal(true);
              requestAnimationFrame(() => setShowModal(true));
            }}
          >
            {isOpeningModal && modalType === 'category' ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <>
                <AppText variant="medium" size="md" color={colors.textPrimary}>
                  {selectedCategory || 'Categories'}
                </AppText>
<<<<<<< HEAD
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={colors.textPrimary}
                  style={{ marginLeft: 4 }}
                />
=======
                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              </>
            )}
          </Pressable>

          <Pressable
            onFocus={() => setIsYearFocused(true)}
            onBlur={() => setIsYearFocused(false)}
            style={[
              styles.filterTab,
              selectedYear && styles.activeFilterTab,
              isYearFocused && {
                borderColor: colors.primary,
                borderWidth: 2,
                transform: [{ scale: 1.08 }],
<<<<<<< HEAD
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
=======
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            ]}
            onPress={() => {
              setModalType('year');
              setIsOpeningModal(true);
              requestAnimationFrame(() => setShowModal(true));
            }}
          >
            {isOpeningModal && modalType === 'year' ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <>
                <AppText variant="medium" size="md" color={colors.textPrimary}>
                  {selectedYear || 'Year'}
                </AppText>
<<<<<<< HEAD
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={colors.textPrimary}
                  style={{ marginLeft: 4 }}
                />
=======
                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              </>
            )}
          </Pressable>

          <Pressable
            onFocus={() => setIsGenreFocused(true)}
            onBlur={() => setIsGenreFocused(false)}
            style={[
              styles.filterTab,
              selectedGenre && styles.activeFilterTab,
              isGenreFocused && {
                borderColor: colors.primary,
                borderWidth: 2,
                transform: [{ scale: 1.08 }],
<<<<<<< HEAD
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
=======
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            ]}
            onPress={() => {
              setModalType('genre');
              setIsOpeningModal(true);
              requestAnimationFrame(() => setShowModal(true));
            }}
          >
            {isOpeningModal && modalType === 'genre' ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <>
                <AppText variant="medium" size="md" color={colors.textPrimary}>
                  {selectedGenre || 'Genre'}
                </AppText>
<<<<<<< HEAD
                <Icon
                  name="keyboard-arrow-down"
                  size={20}
                  color={colors.textPrimary}
                  style={{ marginLeft: 4 }}
                />
=======
                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
              </>
            )}
          </Pressable>
        </RNScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
<<<<<<< HEAD
          <Loader />
        </View>
      ) : isFiltering ? (
        <View style={styles.centered}>
          <Loader />
=======
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isFiltering ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
          {/* <AppText variant="medium" style={{ marginTop: spacing.md }} color={colors.textSecondary}>Applying filters...</AppText> */}
        </View>
      ) : (
        <Animated.FlatList
          data={filteredData}
<<<<<<< HEAD
          renderItem={renderMovieItem}
          keyExtractor={(item, index) =>
            item.id?.toString() || index.toString()
          }
          numColumns={numCols}
          key={isTablet || isTV ? 'tablet' : 'phone'}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={11}
          getItemLayout={(data, index) => ({
            length: cardWidth * 0.5625 + 8,
            offset: (cardWidth * 0.5625 + 8) * Math.floor(index / numCols),
            index,
          })}
=======
          renderItem={({ item }) => {
            const numCols = (isTablet || isTV) ? 4 : 2;
            const stableWidth = width > 600 ? width : Math.min(width, height);
            const cardWidth = (stableWidth - spacing.md * 2) / numCols - 8;
            return (
              <MovieCard
                imageUrl={`${TV_SHOWS_POSTER_BASE_URL}${item.poster}`}
                onPress={() => {
                  let type = 'web_series';
                  if (activeTab === 'TV Shows') type = 'tv_show';
                  if (activeTab === 'TV Serials') type = 'tv_serial';
                  navigation.navigate('SeriesDetail', { id: item.id, contentType: type });
                }}
                width={cardWidth}
                height={cardWidth * 0.5625}
                style={{ margin: 4 }}
              />
            );
          }}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          numColumns={(isTablet || isTV) ? 4 : 2}
          key={(isTablet || isTV) ? 'tablet' : 'phone'}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.backgroundLight}
            />
          }
          scrollEventThrottle={16}
<<<<<<< HEAD
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText color={colors.textSecondary}>
                No content found for {activeTab?.title || 'this section'}
              </AppText>
=======

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText color={colors.textSecondary}>No content found for {activeTab}</AppText>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            </View>
          }
        />
      )}

      <CategoryModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onShow={() => setIsOpeningModal(false)}
        title={
<<<<<<< HEAD
          modalType === 'category'
            ? 'All Categories'
            : modalType === 'year'
            ? 'All Years'
            : 'All Genres'
        }
        categories={
          modalType === 'category'
            ? categories
            : modalType === 'year'
            ? years
            : genres
        }
        selectedCategory={
          modalType === 'category'
            ? selectedCategory
            : modalType === 'year'
            ? selectedYear
            : selectedGenre
        }
        onSelectCategory={async value => {
=======
            modalType === 'category' ? 'All Categories' :
                modalType === 'year' ? 'All Years' :
                    'All Genres'
        }
        categories={
          modalType === 'category' ? categories :
            modalType === 'year' ? years :
              genres
        }
        selectedCategory={
          modalType === 'category' ? selectedCategory :
            modalType === 'year' ? selectedYear :
              selectedGenre
        }
        onSelectCategory={async (value) => {
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
          setShowModal(false);
          setIsFiltering(true);

          // Small delay to show loader
          await new Promise(resolve => setTimeout(resolve, 600));

          if (modalType === 'category') setSelectedCategory(value);
          else if (modalType === 'year') setSelectedYear(value);
          else setSelectedGenre(value);

          setIsFiltering(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsContainer: {
<<<<<<< HEAD
=======
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    paddingTop: isTV ? 0 : spacing.xxl + 50, // Offset for absolute header
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundCard,
  },
<<<<<<< HEAD
  tabsScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
  },
  filterBarContainer: {
    zIndex: 10,
    // paddingTop: Platform.OS === 'ios' ? 100 : 90,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginHorizontal: 3,
<<<<<<< HEAD
=======

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

<<<<<<< HEAD
export default WebSeriesScreen;
=======
export default WebSeriesScreen;
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
