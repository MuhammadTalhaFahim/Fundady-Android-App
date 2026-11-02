import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  StatusBar,
  Image,
  Animated,
  Keyboard,
  useWindowDimensions,
  RefreshControl,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import NavigationBar from 'react-native-system-navigation-bar';
import Icon from '../../components/common/SvgIcon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import ChannelGridItem from '../../components/tv/ChannelGridItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { movieService } from '../../services/movieService';
import { isTablet, isTV } from '../../utils/responsive';
import Loader from '../../components/common/Loader';

const SIDEBAR_EXPANDED_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 80;

// TV focus-aware icon button helper
const FocusableIconButton = ({ onPress, iconName, size = 24, style, focusedStyle }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      focusable={true}
      style={[
        style,
        isFocused && (focusedStyle || {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 8,
          borderColor: colors.primary,
          borderWidth: 1.5,
        })
      ]}
    >
      <Icon name={iconName} size={size} color={colors.white} />
    </Pressable>
  );
};

// static helper for category icons
const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('movie')) return 'movie';
  if (n.includes('news')) return 'language';
  if (n.includes('sport')) return 'sports-soccer';
  if (n.includes('music')) return 'music-note';
  if (n.includes('kids')) return 'child-care';
  if (n.includes('religion')) return 'church';
  if (n.includes('education')) return 'school';
  return 'live-tv';
};

// Focus-aware category item
const CategoryItem = ({ isActive, isFocused, onFocus, onBlur, onPress, iconName, displayName, channelCount, isSidebarCollapsed }) => {
  return (
    <Pressable
      focusable={true}
      onFocus={onFocus}
      onBlur={onBlur}
      onPress={onPress}
      style={[
        styles.categoryItem,
        isActive && styles.activeCategoryItem,
        isFocused && {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: colors.primary,
          borderWidth: 1.5,
          transform: [{ scale: 1.02 }]
        }
      ]}
    >
      <View style={styles.categoryIconContainer}>
        <Icon
          name={iconName}
          size={24}
          color={isActive || isFocused ? colors.white : colors.textMuted}
        />
      </View>
      {!isSidebarCollapsed && (
        <View style={styles.categoryInfo}>
          <AppText
            style={styles.categoryName}
            variant={isActive || isFocused ? 'bold' : 'medium'}
            color={isActive || isFocused ? colors.white : colors.textSecondary}
            numberOfLines={1}
          >
            {displayName}
          </AppText>
          <AppText
            style={styles.categoryCount}
            color={isActive || isFocused ? 'rgba(255,255,255,0.7)' : colors.textMuted}
            size="xs"
          >
            {channelCount} Channels
          </AppText>
        </View>
      )}
      {isActive && <View style={styles.activeIndicator} />}
    </Pressable>
  );
};

const CategoryItemWrapper = ({ item, isActive, isAllChannels, channelCount, isSidebarCollapsed, onPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  const iconName = isAllChannels ? 'dashboard' : getCategoryIcon(item.name);
  const displayName = isAllChannels ? 'ALL CHANNELS' : item.name.toUpperCase();

  return (
    <CategoryItem
      isActive={isActive}
      isFocused={isFocused}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPress={onPress}
      iconName={iconName}
      displayName={displayName}
      channelCount={channelCount}
      isSidebarCollapsed={isSidebarCollapsed}
    />
  );
};

const LiveTvScreen = ({ navigation }) => {
  const [channels, setChannels] = useState([]);
  const [allChannelsForCounts, setAllChannelsForCounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [channelSearchQuery, setChannelSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isChannelSearchVisible, setIsChannelSearchVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Animation values
  const sidebarWidth = useRef(new Animated.Value(SIDEBAR_EXPANDED_WIDTH)).current;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigatingToPlayer = useRef(false);

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Responsive grid calculation
  const numColumns = useMemo(() => {
    const currentSidebarWidth = isSidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
    const horizontalPadding = Math.max(insets.left, 10) + Math.max(insets.right, 10);
    const availableWidth = SCREEN_WIDTH - currentSidebarWidth - horizontalPadding - 20;
    const itemWidth = 128; // 120 card width + 8 total horizontal margin
    return Math.max(2, Math.floor(availableWidth / itemWidth));
  }, [isSidebarCollapsed, SCREEN_WIDTH, insets]);

  useFocusEffect(
    useCallback(() => {
      navigatingToPlayer.current = false;
      // On phones, we lock to landscape. On Tablet/TV, RootNavigator already handled it.
      if (!isTablet && !isTV) {
        Orientation.lockToLandscape();
      }
      StatusBar.setHidden(true, 'fade');

      const initImmersive = async () => {
        if (NavigationBar) {
          try {
            if (typeof NavigationBar.stickyImmersive === 'function') {
              await NavigationBar.stickyImmersive();
            } else if (typeof NavigationBar.hide === 'function') {
              await NavigationBar.hide();
            }
          } catch (e) {
            console.log('NavigationBar immersive failed:', e);
          }
        }
      };

      initImmersive();

      return () => {
        if (!navigatingToPlayer.current) {
          // Add a tiny delay so the navigation transition can start before orientation changes
          // This makes the transition back to portrait home screen much smoother
          setTimeout(() => {
            // Only reset to portrait on phones
            if (!isTablet && !isTV) {
              Orientation.lockToPortrait();
              StatusBar.setHidden(false, 'fade');
              const restoreUI = async () => {
                if (NavigationBar) {
                  try {
                    if (typeof NavigationBar.fullScreen === 'function') {
                      await NavigationBar.fullScreen(false);
                    }
                    await NavigationBar.show();
                  } catch (e) {
                    console.log('Blur UI restore failed:', e);
                  }
                }
              };
              restoreUI();
            }
          }, 100);
        }
      };
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchCategories = async (name = '') => {
    try {
      const res = await movieService.getTVCategories(name);
      if (res.status) {
        setCategories(res.data.channelCat || []);
      }
    } catch (error) {
      console.error('Error fetching TV categories:', error);
    }
  };

  const fetchChannels = async (name = '', catId = null) => {
    try {
      if (!name && !catId && channels.length === 0) setLoading(true);
      else setSearching(true);

      const res = await movieService.searchTVChannels(name, catId);
      if (res.status) {
        setChannels(res.data.channels || []);
      }
    } catch (error) {
      console.error('Error fetching TV channels:', error);
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [allRes, catRes, chanRes] = await Promise.all([
        movieService.getTVChannels(),
        movieService.getTVCategories(),
        movieService.searchTVChannels(channelSearchQuery, selectedCategoryId)
      ]);

      if (allRes.status) setAllChannelsForCounts(allRes.data.channels || []);
      if (catRes.status) setCategories(catRes.data.channelCat || []);
      if (chanRes.status) setChannels(chanRes.data.channels || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [channelSearchQuery, selectedCategoryId]);

  const expandSidebar = () => {
    Animated.spring(sidebarWidth, {
      toValue: SIDEBAR_EXPANDED_WIDTH,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setIsSidebarCollapsed(false);
  };

  const collapseSidebar = () => {
    Animated.spring(sidebarWidth, {
      toValue: SIDEBAR_COLLAPSED_WIDTH,
      useNativeDriver: false,
      friction: 8,
    }).start();
    setIsSidebarCollapsed(true);
    Keyboard.dismiss();
  };

  const executeSearch = () => {
    Keyboard.dismiss();
    fetchChannels(channelSearchQuery, selectedCategoryId);
  };

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
    fetchChannels(channelSearchQuery, id);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(categorySearchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [categorySearchQuery]);

  const getChannelCount = (catId) => {
    return allChannelsForCounts.filter(ch => ch.category_id === catId).length;
  };

  const renderCategoryItem = ({ item }) => {
    const isActive = selectedCategoryId === item.id;
    return (
      <CategoryItemWrapper
        item={item}
        isActive={isActive}
        isAllChannels={false}
        channelCount={getChannelCount(item.id)}
        isSidebarCollapsed={isSidebarCollapsed}
        onPress={() => handleCategorySelect(item.id)}
      />
    );
  };

  const handleChannelPress = (channel) => {
    navigatingToPlayer.current = true;

    let catName = 'ALL';
    if (selectedCategoryId) {
      const cat = categories.find(c => c.id === selectedCategoryId);
      if (cat) catName = cat.name.toUpperCase();
    }

    navigation.navigate('LiveTvPlayer', {
      channel: channel,
      categoryId: selectedCategoryId,
      categoryName: catName
    });
  };

  const handleBack = () => {
    // Simply go back and let the useFocusEffect cleanup handle the orientation reset
    // This prevents the screen from 'flipping' twice during the transition
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Loader />
        <AppText style={{ marginTop: 20 }} color={colors.textSecondary}>Loading Channels...</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, {
      paddingLeft: Math.max(insets.left, 10),
      paddingRight: Math.max(insets.right, 10)
    }]}>
      {/* Sidebar - Left */}
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        <View style={styles.sidebarHeader}>
          {!isSidebarCollapsed ? (
            <View style={styles.logoRow}>
              <FocusableIconButton
                onPress={handleBack}
                iconName="arrow-back"
                size={24}
                style={styles.backButton}
              />
              <Image
                source={require('../../assets/images/fundady_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <FocusableIconButton
                onPress={collapseSidebar}
                iconName="chevron-left"
                size={24}
                style={styles.toggleButton}
              />
            </View>
          ) : (
            <FocusableIconButton
              onPress={expandSidebar}
              iconName="menu"
              size={28}
              style={styles.toggleButtonCollapsed}
            />
          )}
        </View>

        {!isSidebarCollapsed && (
          <View style={[
            styles.searchContainer,
            isSearchFocused && {
              borderColor: colors.primary,
              borderWidth: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }
          ]}>
            <Icon name="search" size={20} color={isSearchFocused ? colors.primary : colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search category"
              placeholderTextColor={colors.textMuted}
              value={categorySearchQuery}
              onChangeText={setCategorySearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>
        )}

        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          ListHeaderComponent={
            <CategoryItemWrapper
              isActive={!selectedCategoryId}
              isAllChannels={true}
              channelCount={allChannelsForCounts.length}
              isSidebarCollapsed={isSidebarCollapsed}
              onPress={() => handleCategorySelect(null)}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCategoryContainer}>
              {!isSidebarCollapsed && <AppText color={colors.textMuted} style={styles.emptyText}>No categories found</AppText>}
            </View>
          }
        />
      </Animated.View>

      {/* Content - Right */}
      <View style={styles.mainContent}>
        <View style={styles.contentHeader}>
          <View style={styles.titleContainer}>
            <AppText variant="bold" style={styles.currentCategoryTitle}>
              {selectedCategoryId
                ? categories.find(c => c.id === selectedCategoryId)?.name.toUpperCase()
                : 'ALL CHANNELS'}
            </AppText>
            <View style={styles.categoryUnderline} />
          </View>
          
          <View style={styles.headerRightActions}>
            {isChannelSearchVisible ? (
              <View style={styles.channelSearchContainer}>
                <Icon name="search" size={20} color={colors.textMuted} />
                <TextInput
                  style={styles.channelSearchInput}
                  placeholder="Search channels..."
                  placeholderTextColor={colors.textMuted}
                  value={channelSearchQuery}
                  onChangeText={setChannelSearchQuery}
                  onSubmitEditing={executeSearch}
                  returnKeyType="search"
                  autoFocus
                />
                <TouchableOpacity onPress={() => { setIsChannelSearchVisible(false); setChannelSearchQuery(''); }}>
                  <Icon name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.headerIconButton} onPress={() => setIsChannelSearchVisible(true)}>
                <Icon name="search" size={24} color={colors.white} />
              </TouchableOpacity>
            )}
           
          </View>
        </View>

        {searching ? (
          <View style={styles.searchingOverlay}>
            <Loader />
            <AppText style={{ marginTop: 15 }} color={colors.white}>Searching...</AppText>
          </View>
        ) : (
          <FlatList
            key={`grid-${numColumns}`}
            data={channels}
            renderItem={({ item }) => (
              <ChannelGridItem item={item} onPress={handleChannelPress} />
            )}
            keyExtractor={item => item.id.toString()}
            numColumns={numColumns}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
                progressBackgroundColor={colors.backgroundLight}
              />
            }
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="tv-off" size={64} color={colors.textMuted} />
                <AppText style={{ marginTop: 15 }} color={colors.textMuted}>No channels found in this category</AppText>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 10,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    height: '100%',
    backgroundColor: '#0f0f0f',
    borderRadius: 20,
    marginRight: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  sidebarHeader: {
    padding: spacing.md,
    height: 80,
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    height: 60,
    width: 190,
  },
  toggleButton: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  toggleButtonCollapsed: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    marginLeft: spacing.sm,
    fontSize: 13,
  },
  categoryList: {
    paddingBottom: spacing.xl,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.sm,
    marginBottom: 4,
    borderRadius: 12,
    minHeight: 56,
  },
  activeCategoryItem: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  categoryName: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  categoryCount: {
    fontSize: 10,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    left: 4,
    top: '25%',
    bottom: '25%',
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    height: 80,
  },
  titleContainer: {
    position: 'relative',
  },
  currentCategoryTitle: {
    color: colors.white,
    fontSize: 18,
    letterSpacing: 2,
  },
  categoryUnderline: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 40,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    height: 44,
    width: 250,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  channelSearchInput: {
    flex: 1,
    color: colors.white,
    marginLeft: spacing.sm,
    fontSize: 14,
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingBottom: 100,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  searchingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyCategoryContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  }
});

export default LiveTvScreen;
