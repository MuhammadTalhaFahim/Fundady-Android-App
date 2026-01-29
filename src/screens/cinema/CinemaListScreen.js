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
import MovieGridItem from '../../components/common/MovieGridItem';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../components/common/AppText';
import CategoryModal from '../../components/common/CategoryModal';

const MOVIES_API_URL = 'https://fundady.com/api/v1/movies';
const CATEGORIES_API_URL = 'https://fundady.com/api/v1/categories';

const CinemaListScreen = () => {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const [movies, setMovies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchMovies(), fetchCategories()]);
        setLoading(false);
    };

    const fetchMovies = async () => {
        try {
            const response = await fetch(MOVIES_API_URL);
            const json = await response.json();
            if (json.status) {
                setMovies(json.data);
            }
        } catch (error) {
            console.error('Error fetching movies for Cinema screen:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(CATEGORIES_API_URL);
            const json = await response.json();
            if (json.status) {
                setCategories(json.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const getFilteredMovies = () => {
        if (!selectedCategory) return movies;
        return movies.filter(m =>
            m.categories?.split(',').map(c => c.trim()).includes(selectedCategory)
        );
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
<<<<<<< HEAD
                <Animated.FlatList
                    data={filteredMovies}
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
                    ListHeaderComponent={
=======
                <>
                    <View style={styles.stickyFilterContainer}>
>>>>>>> 44aadc5 (phase 1 changes)
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
<<<<<<< HEAD
                    }
                />
=======
                    </View>

                    <Animated.FlatList
                        data={filteredMovies}
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
                    />
                </>
>>>>>>> 44aadc5 (phase 1 changes)
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
    listContent: {
        padding: spacing.md,
<<<<<<< HEAD
        paddingTop: Platform.OS === 'ios' ? 100 : 90,
=======
        paddingTop: spacing.xs,
>>>>>>> 44aadc5 (phase 1 changes)
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
<<<<<<< HEAD
=======
    stickyFilterContainer: {
        paddingTop: Platform.OS === 'ios' ? 100 : 90,
        zIndex: 10,
    },
>>>>>>> 44aadc5 (phase 1 changes)
    filterBar: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: spacing.sm,
<<<<<<< HEAD
        marginBottom: spacing.sm,
=======
        paddingHorizontal: spacing.md,
        backgroundColor: colors.background,
>>>>>>> 44aadc5 (phase 1 changes)
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

export default CinemaListScreen;

