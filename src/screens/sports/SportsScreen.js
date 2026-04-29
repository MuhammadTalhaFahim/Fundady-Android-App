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
import { movieService } from '../../services/movieService';
import { SPORTS_POSTER_BASE_URL } from '../../utils/constants';

const TABS = ['WWE', 'Cricket', 'Football'];

const SportsScreen = () => {
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();
    const scrollY = React.useRef(new Animated.Value(0)).current;
    
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const [allData, setAllData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Lock orientation to portrait when screen is focused
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (width < 600) {
                Orientation.lockToPortrait();
            }
        });

        return unsubscribe;
    }, [navigation, width]);

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
            else dataPromise = movieService.getFootball();

            const [dataRes, catsRes] = await Promise.all([
                dataPromise,
                movieService.getSeriesCategories()
            ]);

            if (dataRes) {
                const tabKey = activeTab.toLowerCase();
                const extractedData =
                    dataRes.data?.[tabKey]?.data ||
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
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <Animated.FlatList
                    data={filteredData}
                    renderItem={({ item }) => {
                        const stableWidth = width > 600 ? width : Math.min(width, height);
                        const cardWidth = (stableWidth - spacing.md * 2) / 2 - 8;
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
                                style={{ margin: 4 }}
                            />
                        );
                    }}
                    keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                    numColumns={2}
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
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xxl + 50,
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
