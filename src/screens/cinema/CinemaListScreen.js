import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    FlatList,
    ActivityIndicator,
    Modal,
    TouchableOpacity,
    Dimensions,
    ScrollView as RNScrollView,
    Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import MainHeader from '../../components/headers/MainHeader';
import MovieCard from '../../components/cards/MovieCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../components/common/AppText';
import CategoryModal from '../../components/common/CategoryModal';
import { MOVIES_POSTER_BASE_URL } from '../../utils/constants';

import { movieService } from '../../services/movieService';

const { width } = Dimensions.get('window');

const CinemaListScreen = ({ navigation }) => {
    const scrollY = React.useRef(new Animated.Value(0)).current;
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

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
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
        }
    };

    const handleMoviePress = movie => {
        navigation.navigate('MovieDetail', { movie });
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
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    <View style={styles.stickyFilterContainer}>
                        <RNScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterBar}
                        >
                            <TouchableOpacity
                                style={[styles.filterTab, selectedCategory && styles.activeFilterTab]}
                                onPress={() => {
                                    setModalType('category');
                                    setShowModal(true);
                                }}
                            >
                                <AppText variant="medium" size="md" color={colors.textPrimary}>
                                    {selectedCategory || 'Categories'}
                                </AppText>
                                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.filterTab, selectedYear && styles.activeFilterTab]}
                                onPress={() => {
                                    setModalType('year');
                                    setShowModal(true);
                                }}
                            >
                                <AppText variant="medium" size="md" color={colors.textPrimary}>
                                    {selectedYear || 'Year'}
                                </AppText>
                                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.filterTab, selectedGenre && styles.activeFilterTab]}
                                onPress={() => {
                                    setModalType('genre');
                                    setShowModal(true);
                                }}
                            >
                                <AppText variant="medium" size="md" color={colors.textPrimary}>
                                    {selectedGenre || 'Genre'}
                                </AppText>
                                <Icon name="keyboard-arrow-down" size={20} color={colors.textPrimary} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        </RNScrollView>
                    </View>

                    {isFiltering ? (
                        <View style={styles.filterLoadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <AppText variant="medium" style={{ marginTop: spacing.md }} color={colors.textSecondary}></AppText>
                        </View>
                    ) : (
                        <Animated.FlatList
                            data={filteredMovies}
                            renderItem={({ item }) => {
                                const cardWidth = (width - spacing.md * 2) / 3 - 8;
                                return (
                                    <MovieCard
                                        imageUrl={`${MOVIES_POSTER_BASE_URL}${item.poster}`}
                                        onPress={() => handleMoviePress(item)}
                                        width={cardWidth}
                                        height={cardWidth * 1.5}
                                        style={{ margin: 4 }}
                                    />
                                );
                            }}
                            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                            numColumns={3}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            onScroll={Animated.event(
                                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                                { useNativeDriver: false }
                            )}
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
        paddingTop: Platform.OS === 'ios' ? 100 : 90,
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
        marginHorizontal: 3,
    },
    activeFilterTab: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
});

export default CinemaListScreen;

