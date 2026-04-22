import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Image,
  Animated,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import NavigationBar from 'react-native-system-navigation-bar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import ChannelGridItem from '../../components/tv/ChannelGridItem';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { movieService } from '../../services/movieService';


const SIDEBAR_EXPANDED_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 60;

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
    const itemWidth = 128; // 120 card width + 8 total horizontal margin (4 each side)
    return Math.max(2, Math.floor(availableWidth / itemWidth));
  }, [isSidebarCollapsed, SCREEN_WIDTH, insets]);

  useFocusEffect(
    useCallback(() => {
      navigatingToPlayer.current = false;
      Orientation.lockToLandscape();
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
        if (res.data.channelCat?.length > 0 && !selectedCategoryId) {
          // Default to first category if none selected
          // setSelectedCategoryId(res.data.channelCat[0].id);
        }
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

  const fetchData = async () => {
    setLoading(true);
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
    }
  };

  const expandSidebar = () => {
    Animated.timing(sidebarWidth, {
      toValue: SIDEBAR_EXPANDED_WIDTH,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsSidebarCollapsed(false);
  };

  const collapseSidebar = () => {
    Animated.timing(sidebarWidth, {
      toValue: SIDEBAR_COLLAPSED_WIDTH,
      duration: 300,
      useNativeDriver: false,
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

  const filteredChannels = channels;

  const filteredCategories = categories;

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
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSidebarCollapsed && styles.categoryItemCollapsed,
          isActive && !isSidebarCollapsed && styles.activeCategoryItem
        ]}
        onPress={() => handleCategorySelect(item.id)}
      >
        {!isSidebarCollapsed && (
          <>
            <AppText
              style={styles.categoryName}
              variant={isActive ? "bold" : "regular"}
              color={isActive ? colors.white : colors.textSecondary}
              numberOfLines={1}
            >
              {item.name.toUpperCase()}
            </AppText>
            <AppText
              style={styles.categoryCount}
              color={isActive ? colors.white : colors.textMuted}
            >
              {getChannelCount(item.id)}
            </AppText>
          </>
        )}

        {isSidebarCollapsed && (
          <View style={[styles.activeIconContainerCollapsed, !isActive && styles.inactiveIconContainerCollapsed]}>
            <Icon name="live-tv" size={!isActive ? 18 : 22} color={isActive ? colors.primary : colors.white} />
            {isActive && <View style={styles.activeIconUnderline} />}
          </View>
        )}
        {!isSidebarCollapsed && isActive && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
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

  const handleBack = async () => {
    try {
      Orientation.lockToPortrait();
      StatusBar.setHidden(false, 'fade');
      if (NavigationBar) {
        if (typeof NavigationBar.fullScreen === 'function') {
          await NavigationBar.fullScreen(false);
        }
        await NavigationBar.show();
      }
    } catch (e) {
      console.log('Error in handleBack reset:', e);
    }
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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
          {!isSidebarCollapsed && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Icon name="arrow-back" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={isSidebarCollapsed ? expandSidebar : null}
            activeOpacity={isSidebarCollapsed ? 0.7 : 1}
            style={styles.logoContainer}
          >
            <Image
              source={require('../../assets/images/fundady_logo.png')}
              style={isSidebarCollapsed ? styles.logoSmall : styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
          {!isSidebarCollapsed && (
            <TouchableOpacity onPress={collapseSidebar}>
              <Icon name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>

        {!isSidebarCollapsed && (
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search category"
              placeholderTextColor={colors.textMuted}
              value={categorySearchQuery}
              onChangeText={setCategorySearchQuery}
            />
          </View>
        )}

        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            (!categorySearchQuery || 'all'.includes(categorySearchQuery.toLowerCase())) ? (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  isSidebarCollapsed && styles.categoryItemCollapsed,
                  !selectedCategoryId && !isSidebarCollapsed && styles.activeCategoryItem
                ]}
                onPress={() => handleCategorySelect(null)}
              >
                {!isSidebarCollapsed && (
                  <>
                    <AppText style={styles.categoryName} color={!selectedCategoryId ? colors.white : colors.textSecondary}>ALL</AppText>
                    <AppText style={styles.categoryCount} color={!selectedCategoryId ? colors.white : colors.textMuted}>{allChannelsForCounts.length}</AppText>
                    {!selectedCategoryId && <View style={styles.activeIndicator} />}
                  </>
                )}
                {isSidebarCollapsed && (
                  <View style={[styles.activeIconContainerCollapsed, selectedCategoryId !== null && styles.inactiveIconContainerCollapsed]}>
                    <Icon name="live-tv" size={selectedCategoryId !== null ? 18 : 22} color={selectedCategoryId === null ? colors.primary : colors.white} />
                    {selectedCategoryId === null && <View style={styles.activeIconUnderline} />}
                  </View>
                )}
              </TouchableOpacity>
            ) : null
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
          {isChannelSearchVisible ? (
            <View style={styles.channelSearchContainer}>
              <Icon name="search" size={24} color={colors.textMuted} />
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
                <Icon name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <AppText variant="bold" style={styles.currentCategoryTitle}>
                {selectedCategoryId
                  ? categories.find(c => c.id === selectedCategoryId)?.name.toUpperCase()
                  : 'ALL CHANNELS'}
              </AppText>
              <View style={styles.headerIcons}>
                <TouchableOpacity style={styles.headerIcon} onPress={() => setIsChannelSearchVisible(true)}>
                  <Icon name="search" size={24} color={colors.white} />
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.headerIcon}>
                  <Icon name="more-vert" size={24} color={colors.white} />
                </TouchableOpacity> */}
              </View>
            </>
          )}
        </View>

        {searching ? (
          <View style={styles.searchingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            key={`grid-${numColumns}`}
            data={filteredChannels}
            renderItem={({ item }) => (
              // <ChannelGridItem item={item} onPress={handleChannelPress} />
              <ChannelGridItem item={item} />
            )}
            keyExtractor={item => item.id.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppText color={colors.textMuted}>No channels found</AppText>
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
    backgroundColor: '#0a0a0a',
    borderRightWidth: 1,
    borderRightColor: '#222',
    overflow: 'hidden',
    borderRadius: 15,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginTop: 10,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    height: 60,
    width: 120,
  },
  logoSmall: {
    height: 50,
    width: 40,
  },
  backButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 4,
    height: 45,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    marginLeft: spacing.sm,
    fontSize: 14,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    minHeight: 50,
  },
  activeCategoryItem: {
    backgroundColor: colors.primary,
  },
  categoryName: {
    fontSize: 13,
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    marginLeft: 10,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    bottom: '25%',
    width: 4,
    backgroundColor: colors.white,
  },
  activeIconContainerCollapsed: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  inactiveIconContainerCollapsed: {
    borderWidth: 1,
    borderColor: '#333333',
  },
  activeIconUnderline: {
    width: 12,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: 4,
  },
  categoryItemCollapsed: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
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
    paddingVertical: spacing.lg,
  },
  currentCategoryTitle: {
    color: colors.white,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 20,
  },
  gridContainer: {
    paddingHorizontal: 10,
    paddingBottom: spacing.xl,
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  channelSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  channelSearchInput: {
    flex: 1,
    color: colors.white,
    marginLeft: spacing.sm,
    fontSize: 14,
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
