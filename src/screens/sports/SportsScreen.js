import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Modal,
    TouchableOpacity,
<<<<<<< HEAD
    Pressable,
    FlatList,
    Platform,
    useWindowDimensions,
    ScrollView as RNScrollView,
    RefreshControl
} from 'react-native';
import Loader from '../../components/common/Loader';
=======
    FlatList,
    ActivityIndicator,
    Platform,
    useWindowDimensions,
    ScrollView as RNScrollView,
} from 'react-native';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import { useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
<<<<<<< HEAD
import Icon from '../../components/common/SvgIcon';
=======
import Icon from 'react-native-vector-icons/MaterialIcons';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import CategoryModal from '../../components/common/CategoryModal';
import { moderateScale, isTablet, isTV, SCREEN_WIDTH } from '../../utils/responsive';
import { movieService } from '../../services/movieService';
import { SPORTS_POSTER_BASE_URL } from '../../utils/constants';
import { getTimeAgo } from '../../utils/helpers';

<<<<<<< HEAD
const DEFAULT_SPORTS_TABS = [
    { id: 1, name: 'WWE', slug: 'wwe' },
    { id: 2, name: 'CRICKET', slug: 'cricket' },
    { id: 5, name: 'UFC', slug: 'ufc' },
    { id: 7, name: 'AEW', slug: 'aew' },
    { id: 3, name: 'FOOTBALL', slug: 'football' },
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
};
=======
const TABS = ['WWE', 'Cricket', 'UFC', 'AEW'];
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

const SportsScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const scrollY = React.useRef(new Animated.Value(0)).current;

<<<<<<< HEAD
    const [tabs, setTabs] = useState(DEFAULT_SPORTS_TABS);
    const [activeTab, setActiveTab] = useState(DEFAULT_SPORTS_TABS[0]);
=======
    const [activeTab, setActiveTab] = useState(TABS[0]);
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    const [allData, setAllData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [loading, setLoading] = useState(true);
<<<<<<< HEAD
    const [refreshing, setRefreshing] = useState(false);
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

    // Lock orientation to portrait when screen is focused (Phones only)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!isTablet && !isTV) {
                Orientation.lockToPortrait();
            }
        });

        return unsubscribe;
    }, [navigation]);

<<<<<<< HEAD
    // Fetch dynamic categories from sports/cat API
    useEffect(() => {
        const fetchSportsCategoryTabs = async () => {
            try {
                const res = await movieService.getSportsCategoriesList();
                const rawList = Array.isArray(res) ? res : (res?.data || []);
                const validList = rawList
                    .filter(c => c && (c.name || typeof c === 'string'))
                    .map(c => {
                        const name = typeof c === 'string' ? c : c.name;
                        const slug = name.toLowerCase().trim().replace(/\s+/g, '_');
                        return {
                            id: c.id || slug,
                            name: name,
                            slug: slug
                        };
                    });

                if (validList.length > 0) {
                    setTabs(validList);
                    // setActiveTab(prev => {
                    //     const match = validList.find(t => t.slug === prev?.slug);
                    //     return match || validList[0];
                    // });
                    // Set the active tab to the first tab in the fetched list, ensuring the first tab is selected regardless of previous state
                    setActiveTab(validList[0]);
                }
            } catch (error) {
                console.error('Error fetching dynamic sports categories:', error);
            }
        };
        fetchSportsCategoryTabs();
    }, []);

    useEffect(() => {
        if (activeTab) {
            fetchData();
        }
    }, [activeTab]);

    const fetchData = async (isRefresh = false) => {
        if (!activeTab) return;
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
            setAllData([]);
        }
        try {
            let dataPromise;
            if (activeTab.slug === 'wwe') dataPromise = movieService.getWWE();
            else if (activeTab.slug === 'cricket') dataPromise = movieService.getCricket();
            else if (activeTab.slug === 'ufc') dataPromise = movieService.getUFC();
            else if (activeTab.slug === 'aew') dataPromise = movieService.getAEW();
            else if (activeTab.slug === 'football') dataPromise = movieService.getFootball();
            else dataPromise = movieService.getSportsByCategory(activeTab.slug);
=======
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        setAllData([]);
        try {
            let dataPromise;
            if (activeTab === 'WWE') dataPromise = movieService.getWWE();
            else if (activeTab === 'Cricket') dataPromise = movieService.getCricket();
            else if (activeTab === 'UFC') dataPromise = movieService.getUFC();
            else if (activeTab === 'AEW') dataPromise = movieService.getAEW();
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

            const [dataRes, catsRes] = await Promise.all([
                dataPromise,
                movieService.getSeriesCategories()
            ]);

            if (dataRes) {
<<<<<<< HEAD
                const slug = activeTab.slug;
                const extractedData =
                    dataRes.data?.[slug]?.data ||
                    dataRes.data?.[slug] ||
                    dataRes[slug]?.data ||
                    dataRes[slug] ||
=======
                const tabKey = activeTab.toLowerCase();
                const extractedData =
                    dataRes.data?.[tabKey]?.data ||
                    dataRes.data?.[tabKey] ||
                    dataRes[tabKey]?.data ||
                    dataRes[tabKey] ||
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                    dataRes.data?.data ||
                    dataRes.data ||
                    (Array.isArray(dataRes) ? dataRes : []);

                setAllData(Array.isArray(extractedData) ? extractedData : []);
            }

            if (catsRes && (catsRes.data || Array.isArray(catsRes))) {
                setCategories(catsRes.data || (Array.isArray(catsRes) ? catsRes : []));
            }
        } catch (error) {
            console.error('Error fetching sports data:', error);
            setAllData([]);
        } finally {
            setLoading(false);
<<<<<<< HEAD
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        fetchData(true);
    }, [activeTab]);

=======
        }
    };

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    const getFilteredData = () => {
        if (!selectedCategory) return allData;
        return allData.filter(item =>
            item.name?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            item.title?.toLowerCase().includes(selectedCategory.toLowerCase())
        );
    };

    const filteredData = getFilteredData();

    return (
        <View style={styles.container}>
            <MainHeader variant="home" title="Sports" scrollY={scrollY} />

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
                            tab={tabItem.name}
                            activeTab={activeTab?.name}
                            onPress={() => {
                                setActiveTab(tabItem);
                                setSelectedCategory(null);
                            }}
                        />
=======
                <RNScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScrollContent}
                >
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => {
                                setActiveTab(tab);
                                setSelectedCategory(null);
                            }}
                        >
                            <AppText
                                variant={activeTab === tab ? 'bold' : 'medium'}
                                size="md"
                                color={activeTab === tab ? colors.textPrimary : colors.textSecondary}
                            >
                                {tab}
                            </AppText>
                        </TouchableOpacity>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                    ))}
                </RNScrollView>
            </View>

            {loading ? (
                <View style={styles.centered}>
<<<<<<< HEAD
                    <Loader />
=======
                    <ActivityIndicator size="large" color={colors.primary} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                </View>
            ) : (
                <Animated.FlatList
                    data={filteredData}
                    renderItem={({ item }) => {
                        const numCols = (isTablet || isTV) ? 4 : 2;
                        const cardWidth = (width - spacing.md * 2) / numCols - 8;
<<<<<<< HEAD

=======
                        
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                        // Use video_title directly as it already contains the date from the API
                        const displayTitle = item.video_title || item.title || item.name || '';
                        const timeAgo = getTimeAgo(item.release_date || item.created_at || item.updated_at || item.date);

                        return (
                            <MovieCard
                                imageUrl={`${SPORTS_POSTER_BASE_URL}${item.poster}`}
                                onPress={() => navigation.navigate('MovieDetail', {
                                    id: item.id,
<<<<<<< HEAD
                                    contentType: activeTab?.slug || 'wwe',
=======
                                    contentType: activeTab.toLowerCase(),
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                                    movieDataFallback: item
                                })}
                                width={cardWidth}
                                height={cardWidth * 0.5625}
                                title={displayTitle}
                                subtitle={timeAgo}
<<<<<<< HEAD
                                releaseDate={item.release_date}
                                createdAt={item.created_at}
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                                style={{ margin: 4, marginBottom: 12 }}
                            />
                        );
                    }}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    numColumns={(isTablet || isTV) ? 4 : 2}
                    key={(isTablet || isTV) ? 'tablet' : 'phone'}
<<<<<<< HEAD
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                            progressBackgroundColor={colors.backgroundLight}
                        />
                    }
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false },
                    )}
                    scrollEventThrottle={16}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
<<<<<<< HEAD
                            <AppText color={colors.textSecondary}>No content found for {activeTab?.name || 'this category'}</AppText>
=======
                            <AppText color={colors.textSecondary}>No content found for {activeTab}</AppText>
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
                        </View>
                    }
                />
            )}

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
<<<<<<< HEAD
        paddingTop: isTV ? 0 : 100,
=======
        paddingTop: spacing.xxl + 50,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.backgroundCard,
    },
    tabsScrollContent: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
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
});

export default SportsScreen;
