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
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';

const SEARCH_API_URL = 'https://fundady.com/api/v1/search';
const POSTER_BASE_URL = 'https://fundady.com/MoviesPoster/';

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Standardized fetch function with cancellation support
  const fetchResults = async (query, signal) => {
    setLoading(true);
    try {
      const url = query.trim()
        ? `${SEARCH_API_URL}?title=${encodeURIComponent(query)}`
        : SEARCH_API_URL;

      const response = await fetch(url, { signal });
      const json = await response.json();
      if (json.status) {
        // The search API returns results in json.data.data
        const data = json.data?.data || json.data || [];
        setResults(data);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // Perform initial load immediately, debounce user typing
    if (searchQuery === '') {
      fetchResults('', signal);
    } else {
      const timer = setTimeout(() => {
        fetchResults(searchQuery, signal);
      }, 400);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }

    return () => {
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearch = text => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.searchItemRow}
      onPress={() => navigation.navigate('MovieDetail', { movie: item })}
    >
      <Image
        source={{ uri: `${POSTER_BASE_URL}${item.poster}` }}
        style={styles.itemPosterThumbnail}
      />
      <AppText style={styles.itemTitleText} numberOfLines={1}>
        {item.title}
      </AppText>
      <Icon
        name="play-circle-outline"
        size={28}
        color={colors.white}
        style={styles.playIcon}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Netflix Style Header */}
      <View style={styles.headerContainer}>
        <MainHeader variant="inner" />

        {/* Search Bar Row */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchBarWrapper}>
            <Icon
              name="search"
              size={24}
              color={colors.textSecondary}
              style={styles.searchIconInBar}
            />
            <TextInput
              ref={inputRef}
              style={styles.searchInputField}
              placeholder="Search shows, movies, sports..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            <TouchableOpacity
              onPress={searchQuery.length > 0 ? clearSearch : null}
            >
              <Icon
                name={searchQuery.length > 0 ? 'close' : 'mic'}
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {loading && results.length === 0 ? (
        <View style={styles.centeredView}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.contentView}>
          <FlatList
            data={results}
            renderItem={renderSearchItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContentStyle}
            // ListEmptyComponent={
            //     !loading ? (
            //         <View style={styles.noResultsBox}>
            //             <AppText color={colors.textSecondary}>No results found for "{searchQuery}"</AppText>
            //         </View>
            //     ) : null
            // }

            ListEmptyComponent={
              !loading ? (
                <View style={styles.noResultsBox}>
                  {searchQuery === '' ? (
                    <AppText color={colors.textSecondary}>
                      Search what you want
                    </AppText>
                  ) : (
                    <AppText color={colors.textSecondary}>
                      No results found for "{searchQuery}"
                    </AppText>
                  )}
                </View>
              ) : null
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
  headerContainer: {
    backgroundColor: colors.black,
    paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight,
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconPadding: {
    padding: spacing.xs,
  },
  searchBarRow: {
    paddingHorizontal: spacing.sm,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b2b2b',
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    height: 50,
  },
  searchIconInBar: {
    marginRight: spacing.sm,
  },
  searchInputField: {
    flex: 1,
    color: colors.white,
    fontSize: 16,
    height: '100%',
  },
  contentView: {
    flex: 1,
  },
  resultsLabel: {
    padding: spacing.md,
    color: colors.white,
  },
  listContentStyle: {
    paddingBottom: spacing.xl,
  },
  searchItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginBottom: 2,
  },
  itemPosterThumbnail: {
    width: 140,
    height: 80,
    resizeMode: 'cover',
  },
  itemTitleText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: 15,
    color: colors.white,
  },
  playIcon: {
    padding: spacing.md,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});

export default SearchScreen;
