import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  ScrollView as RNScrollView,
  Animated,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CategoryModal from '../../components/common/CategoryModal';
import { TV_SHOWS_POSTER_BASE_URL } from '../../utils/constants';

import { movieService } from '../../services/movieService';

const { width } = Dimensions.get('window');

const TABS = ['Web Series', 'TV Shows', 'TV Serials'];

const WebSeriesScreen = ({ navigation }) => {
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState(TABS[0]);
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

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, yearsRes, genresRes] = await Promise.all([
          movieService.getSeriesCategories(),
          movieService.getYears(),
          movieService.getGenres()
        ]);

        if (catsRes.status) setCategories(catsRes.data);

        if (yearsRes.status) {
          const mappedYears = yearsRes.data.map(y => ({
            id: y.year,
            name: y.year.toString()
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

  const fetchData = async () => {
    setLoading(true);
    setAllData([]); // Clear previous data
    try {
      let response;
      if (activeTab === 'Web Series') {
        response = await movieService.getWebSeries();
      } else if (activeTab === 'TV Shows') {
        response = await movieService.getTVShows();
      } else {
        response = await movieService.getTVSerials();
      }

      if (response.status) {
        // Handle different data structures if necessary
        const data = response.data?.tvshows?.data || response.data || [];
        setAllData(data);
      }
    } catch (error) {
      console.error('Error fetching series data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      filtered = filtered.filter(item =>
        item.date?.startsWith(selectedYear) ||
        item.release_date?.startsWith(selectedYear)
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
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <AppText
              variant={activeTab === tab ? 'bold' : 'medium'}
              size="md"
              color={activeTab === tab ? colors.textPrimary : colors.textSecondary}
            >
              {tab}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterBarContainer}>
        <RNScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          <TouchableOpacity
            style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
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
                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedYear && styles.activeFilterTab]}
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
                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedGenre && styles.activeFilterTab]}
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
                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
              </>
            )}
          </TouchableOpacity>
        </RNScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : isFiltering ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          {/* <AppText variant="medium" style={{ marginTop: spacing.md }} color={colors.textSecondary}>Applying filters...</AppText> */}
        </View>
      ) : (
        <Animated.FlatList
          data={filteredData}
          renderItem={({ item }) => {
            const cardWidth = (width - spacing.md * 2) / 3 - 8;
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
                height={cardWidth * 1.5}
                style={{ margin: 4 }}
              />
            );
          }}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText color={colors.textSecondary}>No content found for {activeTab}</AppText>
            </View>
          }
        />
      )}

      <CategoryModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        onShow={() => setIsOpeningModal(false)}
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
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl + 50, // Offset for absolute header
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundCard,
  },
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

  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default WebSeriesScreen;