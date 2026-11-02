import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    StyleSheet,
    Animated,
    FlatList,
    Modal,
    ActivityIndicator,
    TouchableOpacity,
    Pressable,
    Dimensions,
    ScrollView as RNScrollView,
    Platform,
    useWindowDimensions,
    RefreshControl
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
import Icon from '../../components/common/SvgIcon';
import AppText from '../../components/common/AppText';
import CategoryModal from '../../components/common/CategoryModal';
import { MOVIES_POSTER_BASE_URL } from '../../utils/constants';
import Orientation from 'react-native-orientation-locker';

import { moderateScale, isTablet, isTV, SCREEN_WIDTH } from '../../utils/responsive';
import { movieService } from '../../services/movieService';
import Loader from '../../components/common/Loader';



const CinemaListScreen = ({ navigation }) => {
    const { width, height } = useWindowDimensions();
    const scrollY = React.useRef(new Animated.Value(0)).current;
    
    const [isCategoryFocused, setIsCategoryFocused] = useState(false);
    const [isYearFocused, setIsYearFocused] = useState(false);
    const [isGenreFocused, setIsGenreFocused] = useState(false);

    useFocusEffect(
        useCallback(() => {
            // Only lock portrait on phones.
            if (!isTablet && !isTV) {
                Orientation.lockToPortrait();
            }
        }, [])
    );
    const [movies, setMovies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [years, setYears] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('category'); // 'category', 'year', 'genre'
    const [loading, setLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const [isOpeningModal, setIsOpeningModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        try {
            const [moviesRes, categoriesRes, yearsRes, genresRes] = await Promise.all([
                movieService.getMovies(),
                movieService.getCategories(),
                movieService.getYears(),
                movieService.getGenres()
            ]);

            if (moviesRes.status) {
                setMovies(moviesRes.data);
            }
            if (categoriesRes.status) {
                setCategories(categoriesRes.data);
            }
            if (yearsRes.status) {
                // Map years to the format expected by CategoryModal {id, name}
                const mappedYears = yearsRes.data.map(y => ({
                    id: y.year,
                    name: y.year.toString()
                }));
                setYears(mappedYears);
            }
            if (genresRes.status) {
                setGenres(genresRes.data);
            }
        } catch (error) {
            console.error('Error fetching cinema data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        fetchData(true);
    }, []);

    const handleMoviePress = movie => {
        navigation.navigate('MovieDetail', { id: movie.id });
    };


    const getFilteredMovies = () => {
        return movies.filter(m => {
            const matchesCategory = !selectedCategory ||
                m.categories?.split(',').map(c => c.trim()).includes(selectedCategory);

            const matchesYear = !selectedYear ||
                m.release_date?.startsWith(selectedYear);

            const matchesGenre = !selectedGenre ||
                m.genre?.split(',').map(g => g.trim()).includes(selectedGenre);

            return matchesCategory && matchesYear && matchesGenre;
        });
    };

    const filteredMovies = getFilteredMovies();

    return (
        <View style={styles.container}>
            <MainHeader variant="home" title="Movies" scrollY={scrollY} />

            {loading ? (
                <View style={styles.centered}>
                    <Loader/>
                </View>
            ) : (
                <>
                    <View style={styles.stickyFilterContainer}>
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
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                    }
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
                                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
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
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                    }
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
                                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
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
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                                    }
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
                                        <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                                    </>
                                )}
                            </Pressable>
                        </RNScrollView>
                    </View>

                    {isFiltering ? (
                        <View style={styles.filterLoadingContainer}>
                            <Loader />
                            <AppText variant="medium" style={{ marginTop: spacing.md }} color={colors.textSecondary}></AppText>
                        </View>
                    ) : (
                        <Animated.FlatList
                            data={filteredMovies}
                            renderItem={({ item }) => {
                                const numCols = (isTablet || isTV) ? 5 : 3;
                                const cardWidth = (width - spacing.md * 2) / numCols - 8;
                                return (
                                    <MovieCard
                                        imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
                                        onPress={() => handleMoviePress(item)}
                                        width={cardWidth}
                                        height={cardWidth * 1.5}
                                        createdAt={item.created_at}
                                        style={{ margin: 4 }}
                                    />
                                );
                            }}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            numColumns={(isTablet || isTV) ? 5 : 3}
                            key={(isTablet || isTV) ? 'tablet' : 'phone'}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={false}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                { useNativeDriver: false }
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
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <AppText color={colors.textSecondary}>No movies found.</AppText>
                                </View>
                            }
                        />
                    )}
                </>
            )}

            <CategoryModal
                isVisible={showModal}
                onClose={() => setShowModal(false)}
                onShow={() => setIsOpeningModal(false)}
                title={
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
    scrollContent: {
        padding: spacing.md,
        paddingTop: spacing.xs,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    filterLoadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stickyFilterContainer: {
        paddingTop: isTV ? 0 : 100, // Matches the header height
        backgroundColor: colors.background,
        zIndex: 10,
    },
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: spacing.md,
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

export default CinemaListScreen;

