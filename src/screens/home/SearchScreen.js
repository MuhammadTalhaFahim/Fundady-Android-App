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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import AppText from '../../components/common/AppText';

const API_URL = 'https://fundady.com/api/v1/movies';
const POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';

const SearchScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [allMovies, setAllMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchAllMovies();
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const fetchAllMovies = async () => {
        try {
            const response = await fetch(API_URL);
            const json = await response.json();
            if (json.status) {
                setAllMovies(json.data);
                // Initially show some movies as "Top Searches"
                setFilteredMovies(json.data.slice(0, 15));
            }
        } catch (error) {
            console.error('Error fetching movies for search:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredMovies(allMovies.slice(0, 15));
        } else {
            const filtered = allMovies.filter((movie) =>
                movie.title.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredMovies(filtered);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setFilteredMovies(allMovies.slice(0, 15));
    };

    const renderSearchItem = ({ item }) => (
        <View style={styles.searchItemContainer}>
            <TouchableOpacity
                style={styles.searchItemDetails}
                onPress={() => navigation.navigate('MovieDetail', { movie: item })}
            >
                <Image
                    source={{ uri: `${POSTER_BASE_URL}${item.poster}` }}
                    style={styles.itemPoster}
                />
                <AppText style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                </AppText>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.playButtonIcon}
                onPress={() => {
                    const videoUrl = item.links && item.links.length > 0 ? item.links[0].movie_link : null;
                    if (videoUrl) {
                        navigation.navigate('VideoPlayer', { videoUrl });
                    } else {
                        alert('Video link not available');
                    }
                }}
            >
                <Icon name="play-circle-outline" size={35} color={colors.white} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Search Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={iconSizes.lg} color={colors.textPrimary} />
                </TouchableOpacity>
                <TextInput
                    ref={inputRef}
                    style={styles.searchInput}
                    placeholder="Search for a movie, series, etc."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoFocus={true}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                        <Icon name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <View style={styles.content}>
                    <AppText variant="bold" size="lg" style={styles.sectionTitle}>
                        {searchQuery.trim() === '' ? 'Top Searches' : 'Movies & TV'}
                    </AppText>
                    <FlatList
                        data={filteredMovies}
                        renderItem={renderSearchItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <AppText color={colors.textSecondary}>No results found for "{searchQuery}"</AppText>
                            </View>
                        }
                    />
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
    header: {
        height: Platform.OS === 'ios' ? 100 : 70,
        backgroundColor: colors.backgroundLight,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 40 : 10,
        paddingHorizontal: spacing.sm,
    },
    backButton: {
        padding: spacing.xs,
    },
    searchInput: {
        flex: 1,
        height: 40,
        backgroundColor: colors.backgroundCard,
        borderRadius: 4,
        color: colors.textPrimary,
        paddingHorizontal: spacing.md,
        marginHorizontal: spacing.sm,
        fontSize: 16,
    },
    clearButton: {
        padding: spacing.xs,
    },
    content: {
        flex: 1,
    },
    sectionTitle: {
        padding: spacing.md,
        color: colors.textPrimary,
    },
    listContainer: {
        paddingBottom: spacing.xl,
    },
    searchItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundLight,
        marginBottom: 2,
    },
    searchItemDetails: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    playButtonIcon: {
        padding: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemPoster: {
        width: 120,
        height: 70,
        resizeMode: 'cover',
    },
    itemTitle: {
        flex: 1,
        marginLeft: spacing.md,
        fontSize: 14,
        color: colors.textPrimary,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        padding: spacing.xl,
        alignItems: 'center',
    },
});

export default SearchScreen;
