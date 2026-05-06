import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Platform,
    useWindowDimensions,
    ScrollView as RNScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CategoryModal from '../../components/common/CategoryModal';
import { moderateScale, isTablet, isTV, SCREEN_WIDTH } from '../../utils/responsive';
import { movieService } from '../../services/movieService';
import { SPORTS_POSTER_BASE_URL } from '../../utils/constants';
import { getTimeAgo } from '../../utils/helpers';

const TABS = ['WWE', 'Cricket', 'UFC', 'AEW'];

const SportsScreen = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const scrollY = React.useRef(new Animated.Value(0)).current;

    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [allData, setAllData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Lock orientation to portrait when screen is focused (Phones only)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!isTablet && !isTV) {
                Orientation.lockToPortrait();
            }
        });

        return unsubscribe;
    }, [navigation]);

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

            const [dataRes, catsRes] = await Promise.all([
                dataPromise,
                movieService.getSeriesCategories()
            ]);

            if (dataRes) {
                const tabKey = activeTab.toLowerCase();
                const extractedData =
                    dataRes.data?.[tabKey]?.data ||
                    dataRes.data?.[tabKey] ||
                    dataRes[tabKey]?.data ||
                    dataRes[tabKey] ||
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
        }
    };

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
                    ))}
                </RNScrollView>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <Animated.FlatList
                    data={filteredData}
                    renderItem={({ item }) => {
                        const numCols = (isTablet || isTV) ? 4 : 2;
                        const cardWidth = (width - spacing.md * 2) / numCols - 8;
                        
                        // Use video_title directly as it already contains the date from the API
                        const displayTitle = item.video_title || item.title || item.name || '';
                        const timeAgo = getTimeAgo(item.release_date || item.created_at || item.updated_at || item.date);

                        return (
                            <MovieCard
                                imageUrl={`${SPORTS_POSTER_BASE_URL}${item.poster}`}
                                onPress={() => navigation.navigate('MovieDetail', {
                                    id: item.id,
                                    contentType: activeTab.toLowerCase(),
                                    movieDataFallback: item
                                })}
                                width={cardWidth}
                                height={cardWidth * 0.5625}
                                title={displayTitle}
                                subtitle={timeAgo}
                                style={{ margin: 4, marginBottom: 12 }}
                            />
                        );
                    }}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    numColumns={(isTablet || isTV) ? 4 : 2}
                    key={(isTablet || isTV) ? 'tablet' : 'phone'}
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
        paddingTop: spacing.xxl + 50,
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
