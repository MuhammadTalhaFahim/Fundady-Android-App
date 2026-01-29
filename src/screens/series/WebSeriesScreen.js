import React, { useState, useEffect } from 'react';
import {
<<<<<<< HEAD
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
=======
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
>>>>>>> 44aadc5 (phase 1 changes)
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieGridItem from '../../components/common/MovieGridItem';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CategoryModal from '../../components/common/CategoryModal';

<<<<<<< HEAD

=======
>>>>>>> 44aadc5 (phase 1 changes)
const MOVIES_API_URL = 'https://fundady.com/api/v1/movies';
const CATEGORIES_API_URL = 'https://fundady.com/api/v1/categories';
const TABS = ['Web Series', 'TV Shows', 'TV Serials'];

const WebSeriesScreen = () => {
<<<<<<< HEAD
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [allData, setAllData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterData();
    }, [activeTab, allData, selectedCategory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [moviesRes, catsRes] = await Promise.all([
                fetch(MOVIES_API_URL),
                fetch(CATEGORIES_API_URL)
            ]);
            const moviesJson = await moviesRes.json();
            const catsJson = await catsRes.json();

            if (moviesJson.status) setAllData(moviesJson.data);
            if (catsJson.status) setCategories(catsJson.data);
        } catch (error) {
            console.error('Error fetching series data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        if (!allData.length) return;

        let filtered = [];
        // First filter by active tab type
        if (activeTab === 'Web Series') {
            filtered = allData.filter(item =>
                item.categories?.toLowerCase().includes('web series') ||
                item.genre?.toLowerCase().includes('web series')
            );
        } else if (activeTab === 'TV Shows') {
            filtered = allData.filter(item =>
                item.categories?.toLowerCase().includes('show') ||
                item.genre?.toLowerCase().includes('reality-tv')
            );
            if (filtered.length === 0) filtered = allData.slice(10, 20); // Dummy for variety
        } else {
            filtered = allData.filter(item =>
                item.categories?.toLowerCase().includes('serial') ||
                item.genre?.toLowerCase().includes('family')
            );
            if (filtered.length === 0) filtered = allData.slice(20, 30); // Dummy for variety
        }

        // Then filter by selected category
        if (selectedCategory) {
            filtered = filtered.filter(item =>
                item.categories?.split(',').map(c => c.trim()).includes(selectedCategory)
            );
        }

        setFilteredData(filtered);
    };

    return (
        <View style={styles.container}>
            <MainHeader variant="home" title="Series" scrollY={scrollY} />

            {/* <View style={styles.tabsContainer}>
=======
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [allData, setAllData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [activeTab, allData, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [moviesRes, catsRes] = await Promise.all([
        fetch(MOVIES_API_URL),
        fetch(CATEGORIES_API_URL),
      ]);
      const moviesJson = await moviesRes.json();
      const catsJson = await catsRes.json();

      if (moviesJson.status) setAllData(moviesJson.data);
      if (catsJson.status) setCategories(catsJson.data);
    } catch (error) {
      console.error('Error fetching series data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!allData.length) return;

    let filtered = [];
    // First filter by active tab type
    if (activeTab === 'Web Series') {
      filtered = allData.filter(
        item =>
          item.categories?.toLowerCase().includes('web series') ||
          item.genre?.toLowerCase().includes('web series'),
      );
    } else if (activeTab === 'TV Shows') {
      filtered = allData.filter(
        item =>
          item.categories?.toLowerCase().includes('show') ||
          item.genre?.toLowerCase().includes('reality-tv'),
      );
      if (filtered.length === 0) filtered = allData.slice(10, 20); // Dummy for variety
    } else {
      filtered = allData.filter(
        item =>
          item.categories?.toLowerCase().includes('serial') ||
          item.genre?.toLowerCase().includes('family'),
      );
      if (filtered.length === 0) filtered = allData.slice(20, 30); // Dummy for variety
    }

    // Then filter by selected category
    if (selectedCategory) {
      filtered = filtered.filter(item =>
        item.categories
          ?.split(',')
          .map(c => c.trim())
          .includes(selectedCategory),
      );
    }

    setFilteredData(filtered);
  };

  return (
    <View style={styles.container}>
      <MainHeader variant="home" title="Series" scrollY={scrollY} />

      <View style={styles.soonContainer}>
        <AppText style={styles.subtitle}>Coming Soon.</AppText>
      </View>
      {/* 
            <View style={styles.tabsContainer}>
>>>>>>> 44aadc5 (phase 1 changes)
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
<<<<<<< HEAD
            </View>

            {loading ? (
=======
            </View> */}
      {/* 
            <View style={styles.filterBarContainer}>
                <View style={styles.filterBar}>
                    <TouchableOpacity
                        style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                        onPress={() => setShowCategoryModal(true)}
                    >
                        <AppText variant="medium" size="md" color={colors.textPrimary}>
                            {selectedCategory || 'Categories'}
                        </AppText>
                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>
            </View> */}

      {/* {loading ? (
>>>>>>> 44aadc5 (phase 1 changes)
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <Animated.FlatList
                    data={filteredData}
                    renderItem={({ item }) => <MovieGridItem item={item} />}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false },
                    )}
                    scrollEventThrottle={16}
<<<<<<< HEAD
                    ListHeaderComponent={
                        <View style={styles.filterBar}>
                            <TouchableOpacity
                                style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                                onPress={() => setShowCategoryModal(true)}
                            >
                                <AppText variant="medium" size="md" color={colors.textPrimary}>
                                    {selectedCategory || 'Categories'}
                                </AppText>
                                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        </View>
                    }
=======
>>>>>>> 44aadc5 (phase 1 changes)
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <AppText color={colors.textSecondary}>No content found for {activeTab}</AppText>
                        </View>
                    }
                />
            )} */}
<<<<<<< HEAD
            
            <CategoryModal
                isVisible={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
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
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        marginBottom: spacing.sm,
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
    },
    activeFilterTab: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
});

export default WebSeriesScreen;

=======

      <CategoryModal
        isVisible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
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
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  soonContainer:{
    marginTop: spacing.xxxl+30,
     paddingHorizontal: spacing.md,
  },
});

export default WebSeriesScreen;
>>>>>>> 44aadc5 (phase 1 changes)
