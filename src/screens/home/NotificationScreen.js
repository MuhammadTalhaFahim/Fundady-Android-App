import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Modal,
  ScrollView,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import Icon from '../../components/common/SvgIcon';
import { apiClient } from '../../services/apiClient';
import { isTV, moderateScale } from '../../utils/responsive';
import {
  MOVIES_POSTER_BASE_URL,
  TV_SHOWS_POSTER_BASE_URL,
  SPORTS_POSTER_BASE_URL,
} from '../../utils/constants';
import Loader from '../../components/common/Loader';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const parseDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  if (dateStr.includes('T')) return new Date(dateStr);
  return new Date(dateStr.replace(' ', 'T'));
};

const getLocalDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNotificationDateStr = (item) => {
  if (item?.created_at?.length >= 10) return item.created_at.substring(0, 10);
  if (item?.date?.length >= 10) return item.date.substring(0, 10);
  if (item?.release_date?.length >= 10) return item.release_date.substring(0, 10);
  return '';
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const formatDisplayDate = (dateStr) => {
  // dateStr: YYYY-MM-DD
  if (!dateStr || dateStr === 'all') return 'All Dates';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  const todayStr = getLocalDateString(today);
  if (dateStr === todayStr) return `Today, ${parseInt(parts[2])} ${MONTH_NAMES[parseInt(parts[1]) - 1]} ${parts[0]}`;
  return `${parseInt(parts[2])} ${MONTH_NAMES_FULL[parseInt(parts[1]) - 1]} ${parts[0]}`;
};

// ─────────────────────────────────────────────
// Timeline Date Box (left column)
// ─────────────────────────────────────────────
const TimelineDate = ({ item }) => {
  const dateStr = getNotificationDateStr(item);
  if (dateStr?.length >= 10) {
    const parts = dateStr.substring(0, 10).split('-');
    if (parts.length === 3) {
      const month = MONTH_NAMES[parseInt(parts[1], 10) - 1];
      const day = parseInt(parts[2], 10);
      return (
        <View style={styles.timelineDateContainer}>
          <AppText variant="bold" style={styles.timelineMonth}>{month}</AppText>
          <AppText variant="bold" style={styles.timelineDay}>{day}</AppText>
        </View>
      );
    }
  }
  return null;
};

// ─────────────────────────────────────────────
// Notification Card
// ─────────────────────────────────────────────
const NotificationItem = ({ item, onPress }) => {
  const [isFocused, setIsFocused] = useState(false);
  let typeLabel = '';
  let badgeColor = colors.textPrimary;
  let posterUrl = '';

  if (item.type === 'tvshow') {
    const showType = String(item.show_type || '').toLowerCase();
    typeLabel = showType.includes('serial') ? 'TV Serial'
      : showType.includes('show') ? 'TV Show'
      : 'Web Series';
    posterUrl = `${TV_SHOWS_POSTER_BASE_URL}${item.poster}`;
  } else if (item.type === 'movie') {
    typeLabel = 'Movie';
    posterUrl = `${MOVIES_POSTER_BASE_URL}${item.poster}`;
  } else if (item.type === 'sports') {
    typeLabel = 'Sports';
    badgeColor = '#00FF7F';
    posterUrl = `${SPORTS_POSTER_BASE_URL}${item.poster}`;
  } else if (item.type === 'music') {
    typeLabel = 'Music';
    badgeColor = '#1DB954';
    posterUrl = `${MOVIES_POSTER_BASE_URL}${item.poster}`;
  } else if (item.type === 'game') {
    typeLabel = 'Game';
    badgeColor = '#7B68EE';
    posterUrl = `${MOVIES_POSTER_BASE_URL}${item.poster}`;
  } else if (item.type === 'video') {
    typeLabel = 'Video';
    badgeColor = '#FF6B6B';
    posterUrl = `${MOVIES_POSTER_BASE_URL}${item.poster}`;
  } else {
    typeLabel = 'Release';
    posterUrl = `${MOVIES_POSTER_BASE_URL}${item.poster}`;
  }

  const genres = item.genre ? item.genre.split(',').slice(0, 2) : [];

  return (
    <View style={styles.rowContainer}>
      {/* Timeline left column */}
      <View style={styles.timelineCol}>
        <View style={styles.timelineLine} />
        <TimelineDate item={item} />
      </View>

      {/* Main card */}
      <Pressable
        focusable={isTV}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPress={onPress}
        style={[styles.itemCard, isFocused && styles.itemCardFocused]}
      >
        <Image
          source={{ uri: posterUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemDetails}>
          <View style={styles.itemHeaderRow}>
            <View style={styles.itemBadgesRow}>
              <AppText variant="bold" style={[styles.itemTypeBadge, { color: badgeColor }]} numberOfLines={1}>
                {typeLabel.toUpperCase()}
              </AppText>
              <View style={styles.fundadyBadgeContainer}>
                <AppText variant="bold" style={styles.fundadyBadgeText}>
                  Fundady
                </AppText>
              </View>
            </View>
            {item.imdb_rating ? (
              <View style={styles.ratingRow}>
                <Icon name="star" size={12} color="#FFD700" />
                <AppText variant="medium" style={styles.ratingText}>
                  {parseFloat(item.imdb_rating).toFixed(1)}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText variant="bold" style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </AppText>

          {genres.length > 0 ? (
            <View style={styles.genresRow}>
              {genres.map((g, i) => (
                <View key={i} style={styles.genrePill}>
                  <AppText variant="medium" style={styles.genrePillText}>{g.trim()}</AppText>
                </View>
              ))}
            </View>
          ) : null}

          {item.description ? (
            <AppText style={styles.itemDescription} numberOfLines={3}>
              {item.description}
            </AppText>
          ) : (
            <AppText style={styles.itemDescriptionMuted}>
              Tap to see details and watch.
            </AppText>
          )}

          <View style={styles.playNowRow}>
            <Icon name="play-circle-outline" size={16} color={colors.primary} />
            <AppText variant="bold" style={styles.playNowText}>Watch Now</AppText>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

// ─────────────────────────────────────────────
// Custom Date Picker Modal (cross-platform)
// ─────────────────────────────────────────────
const DatePickerModal = ({ visible, selectedDate, onSelect, onClose }) => {
  const today = new Date();
  const safeDateStr = (!selectedDate || selectedDate === 'all') ? getLocalDateString(today) : selectedDate;
  const [viewYear, setViewYear] = useState(
    parseInt(safeDateStr.split('-')[0], 10) || today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    ((parseInt(safeDateStr.split('-')[1], 10) || (today.getMonth() + 1)) - 1)
  );

  const [isPrevFocused, setIsPrevFocused] = useState(false);
  const [isNextFocused, setIsNextFocused] = useState(false);
  const [focusedDayIndex, setFocusedDayIndex] = useState(null);
  const [isTodayBtnFocused, setIsTodayBtnFocused] = useState(false);
  const [isAllBtnFocused, setIsAllBtnFocused] = useState(false);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const todayStr = getLocalDateString(today);

  // Calculate if selectedDate is within the currently viewed year and month
  const isSelectedMonth = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return false;
    return parseInt(parts[0], 10) === viewYear && (parseInt(parts[1], 10) - 1) === viewMonth;
  }, [selectedDate, viewYear, viewMonth]);

  const selectedDay = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length !== 3) return null;
    return parseInt(parts[2], 10);
  }, [selectedDate]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayPress = (day) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelect(dateStr);
    onClose();
  };

  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const allCells = [...blanks, ...days];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.pickerOverlay} onPress={onClose}>
        <Pressable style={styles.pickerContainer} onPress={e => e.stopPropagation()}>
          {/* Calendar Header */}
          <View style={styles.pickerHeader}>
            <Pressable
              focusable={isTV}
              onFocus={() => setIsPrevFocused(true)}
              onBlur={() => setIsPrevFocused(false)}
              onPress={prevMonth}
              style={[
                styles.pickerNavBtn,
                isPrevFocused && styles.pickerNavBtnFocused
              ]}
            >
              <Icon name="chevron-left" size={22} color={isPrevFocused ? colors.primary : colors.white} />
            </Pressable>
            <AppText variant="bold" style={styles.pickerMonthYear}>
              {MONTH_NAMES_FULL[viewMonth]} {viewYear}
            </AppText>
            <Pressable
              focusable={isTV}
              onFocus={() => setIsNextFocused(true)}
              onBlur={() => setIsNextFocused(false)}
              onPress={nextMonth}
              style={[
                styles.pickerNavBtn,
                isNextFocused && styles.pickerNavBtnFocused
              ]}
            >
              <Icon name="chevron-right" size={22} color={isNextFocused ? colors.primary : colors.white} />
            </Pressable>
          </View>

          {/* Day names */}
          <View style={styles.pickerWeekRow}>
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <AppText key={d} variant="bold" style={styles.pickerWeekDay}>{d}</AppText>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.pickerGrid}>
            {allCells.map((day, idx) => {
              if (!day) return <View key={`blank-${idx}`} style={styles.pickerDayCell} />;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              return (
                <Pressable
                  key={dateStr}
                  focusable={isTV && !isFuture}
                  hasTVPreferredFocus={isTV && isSelectedMonth && day === selectedDay}
                  onFocus={() => setFocusedDayIndex(idx)}
                  onBlur={() => setFocusedDayIndex(null)}
                  style={styles.pickerDayCell}
                  onPress={() => !isFuture && handleDayPress(day)}
                  disabled={isFuture}
                >
                  <View style={[
                    styles.pickerDayInner,
                    isSelected && styles.pickerDaySelected,
                    isToday && !isSelected && styles.pickerDayToday,
                    focusedDayIndex === idx && styles.pickerDayFocused,
                  ]}>
                    <AppText style={[
                      styles.pickerDayText,
                      isSelected && styles.pickerDayTextSelected,
                      isToday && !isSelected && styles.pickerDayTextToday,
                      isFuture && styles.pickerDayTextFuture,
                    ]}>
                      {day}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Footer buttons */}
          <View style={styles.pickerFooter}>
         
            <Pressable
              focusable={isTV}
              hasTVPreferredFocus={isTV && !isSelectedMonth}
              onFocus={() => setIsTodayBtnFocused(true)}
              onBlur={() => setIsTodayBtnFocused(false)}
              style={[
                styles.pickerFooterBtn,
                styles.pickerFooterBtnPrimary,
                isTodayBtnFocused && styles.pickerFooterBtnFocused
              ]}
              onPress={() => { onSelect(todayStr); onClose(); }}
            >
              <AppText variant="bold" style={[
                styles.pickerFooterBtnTextPrimary,
                isTodayBtnFocused && styles.pickerFooterBtnTextPrimaryFocused
              ]}>Today</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────
const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isGameFocused, setIsGameFocused] = useState(false);
  const [isCloseFocused, setIsCloseFocused] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [isBackFocused, setIsBackFocused] = useState(false);
  const [isDateFocused, setIsDateFocused] = useState(false);
  const [isTodayFocused, setIsTodayFocused] = useState(false);
  const [isChangeDateFocused, setIsChangeDateFocused] = useState(false);

  const todayStr = useMemo(() => getLocalDateString(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const endpoint = selectedDate && selectedDate !== 'all'
        ? `/notifications/${selectedDate}`
        : `/notifications`;
      const res = await apiClient.get(endpoint);
      if (res) {
        const dataObj = res.data || res;
        const list = [];
        if (Array.isArray(dataObj.movies))
          dataObj.movies.forEach(item => list.push({ ...item, type: 'movie' }));
        if (Array.isArray(dataObj.tvshows))
          dataObj.tvshows.forEach(item => list.push({ ...item, type: 'tvshow' }));
        if (Array.isArray(dataObj.sports))
          dataObj.sports.forEach(item => list.push({ ...item, type: 'sports' }));
        if (Array.isArray(dataObj.games))
          dataObj.games.forEach(item => list.push({ ...item, type: 'game' }));
        if (Array.isArray(dataObj.music))
          dataObj.music.forEach(item => list.push({ ...item, type: 'music' }));
        if (Array.isArray(dataObj.videos))
          dataObj.videos.forEach(item => list.push({ ...item, type: 'video' }));

        // Sort newest first
        list.sort((a, b) => {
          const da = getNotificationDateStr(a) || '1970-01-01';
          const db = getNotificationDateStr(b) || '1970-01-01';
          return db.localeCompare(da);
        });
        setNotifications(list);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // API already fetches date-specific data via /notifications/{date}
  // Do NOT filter again by created_at — it causes empty results when created_at
  // is missing, null, or in a different timezone format from the server.
  const filteredNotifications = notifications;

  const handleItemPress = (item) => {
    if (item.type === 'tvshow') {
      let contentType = 'web_series';
      const showType = String(item.show_type || '').toLowerCase();
      if (showType.includes('serial')) contentType = 'tv_serial';
      else if (showType.includes('show')) contentType = 'tv_show';
      navigation.navigate('SeriesDetail', { id: item.id, contentType });
    } else if (item.type === 'movie') {
      navigation.navigate('MovieDetail', { id: item.id || item.movie_id });
    } else if (['sports', 'video', 'music'].includes(item.type)) {
      const streamLink = item.video_link || item.movie_url || item.movie_link;
      if (streamLink) {
        if (streamLink.includes('youtube.com') || streamLink.includes('youtu.be')) {
          Linking.openURL(streamLink).catch(err => console.error("Couldn't open URL", err));
        } else {
          navigation.navigate('VideoPlayer', {
            videoUrl: streamLink,
            movieTitle: item.title,
            isSeries: false,
            posterUrl: `${MOVIES_POSTER_BASE_URL}${item.poster}`,
          });
        }
      } else {
        setSelectedGame(item);
      }
    } else {
      setSelectedGame(item);
    }
  };

  const handleWatchTrailer = (game) => {
    if (game.video_link) {
      Linking.openURL(game.video_link).catch(err =>
        console.error('Failed to open trailer URL', err)
      );
    }
  };

  const renderItem = ({ item }) => (
    <NotificationItem item={item} onPress={() => handleItemPress(item)} />
  );

  return (
    <View style={styles.container}>
      {/* ── Custom Header ── */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          {/* Back button */}
          <Pressable
            focusable={isTV}
            onFocus={() => setIsBackFocused(true)}
            onBlur={() => setIsBackFocused(false)}
            onPress={() => navigation.goBack()}
            style={[
              styles.headerBackBtn,
              isBackFocused && styles.headerBackBtnFocused
            ]}
          >
            <Icon name="arrow-back" size={iconSizes.lg} color={isBackFocused ? colors.primary : colors.white} />
          </Pressable>

          {/* Title */}
          <AppText variant="bold" style={styles.headerTitle}>
            Notifications
          </AppText>

          {/* Date picker trigger */}
          <Pressable
            focusable={isTV}
            onFocus={() => setIsDateFocused(true)}
            onBlur={() => setIsDateFocused(false)}
            onPress={() => setIsPickerVisible(true)}
            style={[
              styles.headerDateBtn,
              isDateFocused && styles.headerDateBtnFocused
            ]}
          >
            <Icon name="calendar-today" size={18} color={isDateFocused ? colors.primary : colors.white} />
            <AppText variant="medium" style={[styles.headerDateText, isDateFocused && { color: colors.primary }]} numberOfLines={1}>
              {formatDisplayDate(selectedDate)}
            </AppText>
            <Icon name="expand-more" size={18} color={isDateFocused ? colors.primary : colors.white} />
          </Pressable>
        </View>

        {/* Selected date indicator bar */}
        <View style={styles.selectedDateBar}>
          <View style={styles.selectedDateDot} />
          <AppText variant="medium" numberOfLines={1} style={styles.selectedDateBarText}>
            {`${filteredNotifications.length} item${filteredNotifications.length !== 1 ? 's' : ''} on ${formatDisplayDate(selectedDate)}`}
          </AppText>
          {selectedDate !== todayStr && (
            <Pressable
              focusable={isTV}
              onFocus={() => setIsTodayFocused(true)}
              onBlur={() => setIsTodayFocused(false)}
              onPress={() => setSelectedDate(todayStr)}
              style={[
                styles.todayResetBtn,
                isTodayFocused && styles.todayResetBtnFocused
              ]}
            >
              <AppText variant="bold" numberOfLines={1} style={[styles.todayResetText, isTodayFocused && { color: colors.white }]}>Today</AppText>
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Date Picker Modal ── */}
      <DatePickerModal
        visible={isPickerVisible}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setIsPickerVisible(false)}
      />

      {/* ── Content ── */}
      {loading && notifications.length === 0 ? (
        <View style={styles.centered}>
         <Loader />
          <AppText style={styles.loadingText}>Loading notifications…</AppText>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.backgroundLight}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="notifications-none" size={80} color="rgba(255,255,255,0.2)" />
              <AppText variant="bold" size="lg" style={styles.emptyTitle}>
                No notifications for this date
              </AppText>
              <AppText color={colors.textSecondary} style={styles.emptyText}>
                Try selecting another date using the calendar.
              </AppText>
              <Pressable
                focusable={isTV}
                onFocus={() => setIsChangeDateFocused(true)}
                onBlur={() => setIsChangeDateFocused(false)}
                onPress={() => setIsPickerVisible(true)}
                style={[
                  styles.changeDateBtn,
                  isChangeDateFocused && styles.changeDateBtnFocused
                ]}
              >
                <Icon name="calendar-today" size={16} color={isChangeDateFocused ? colors.primary : colors.white} />
                <AppText variant="bold" style={[styles.changeDateBtnText, isChangeDateFocused && { color: colors.primary }]}>Change Date</AppText>
              </Pressable>
            </View>
          }
        />
      )}

      {/* ── Detail Modal ── */}
      {selectedGame && (
        <Modal
          visible={!!selectedGame}
          transparent
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setSelectedGame(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{
                    uri: `${selectedGame.type === 'sports' ? SPORTS_POSTER_BASE_URL : MOVIES_POSTER_BASE_URL}${selectedGame.poster}`,
                  }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
                <View style={styles.modalBody}>
                  <AppText variant="bold" size="xl" style={styles.modalTitle}>
                    {selectedGame.title}
                  </AppText>
                  {selectedGame.categories && typeof selectedGame.categories === 'string' && (
                    <View style={styles.genreBadge}>
                      <AppText variant="medium" size="xs" color={colors.textSecondary}>
                        Genre: {selectedGame.categories}
                      </AppText>
                    </View>
                  )}
                  <AppText color={colors.textSecondary} style={styles.modalDescription}>
                    {selectedGame.description || 'No description available.'}
                  </AppText>
                </View>
              </ScrollView>
              <View style={styles.modalButtonRow}>
                {selectedGame.video_link ? (
                  <Pressable
                    focusable={isTV}
                    onFocus={() => setIsGameFocused(true)}
                    onBlur={() => setIsGameFocused(false)}
                    onPress={() => handleWatchTrailer(selectedGame)}
                    style={[styles.modalButton, styles.modalTrailerButton, isGameFocused && styles.modalButtonFocused]}
                  >
                    <Icon name="play-arrow" size={20} color={colors.black} />
                    <AppText variant="bold" color={colors.black} style={styles.modalButtonText}>Watch Trailer</AppText>
                  </Pressable>
                ) : null}
                <Pressable
                  focusable={isTV}
                  onFocus={() => setIsCloseFocused(true)}
                  onBlur={() => setIsCloseFocused(false)}
                  onPress={() => setSelectedGame(null)}
                  style={[styles.modalButton, styles.modalCloseButton, isCloseFocused && styles.modalButtonFocused]}
                >
                  <AppText variant="bold" color={colors.white} style={styles.modalButtonText}>Close</AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header ──
  headerContainer: {
    backgroundColor: colors.black,
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 4,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e1e',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  headerBackBtn: {
    padding: 4,
    marginRight: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 20,
  },
  headerBackBtnFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: colors.primary,
  },
  headerTitle: {
    color: colors.white,
    fontSize: moderateScale(20),
    flex: 1,
    letterSpacing: 0.3,
  },
  headerDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#333',
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 6,
    maxWidth: 200,
  },
  headerDateBtnFocused: {
    borderColor: colors.primary,
    backgroundColor: '#2a2a2a',
  },
  headerDateText: {
    color: colors.white,
    fontSize: moderateScale(11),
    flexShrink: 1,
  },
  selectedDateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: 4,
    gap: 8,
  },
  selectedDateDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  selectedDateBarText: {
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    flex: 1,
    flexShrink: 1,
  },
  todayResetBtn: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(229,9,20,0.4)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: 4,
    flexShrink: 0,
    flexGrow: 0,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayResetBtnFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(229,9,20,0.4)',
  },
  todayResetText: {
    color: colors.primary,
    fontSize: moderateScale(11),
  },

  // ── Date Picker Modal ──
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '88%',
    maxWidth: 360,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  pickerNavBtn: {
    padding: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pickerNavBtnFocused: {
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: 8,
  },
  pickerMonthYear: {
    color: colors.white,
    fontSize: moderateScale(16),
    letterSpacing: 0.5,
  },
  pickerWeekRow: {
    flexDirection: 'row',
    backgroundColor: '#111',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pickerWeekDay: {
    flex: 1,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: moderateScale(11),
    textTransform: 'uppercase',
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    backgroundColor: '#1a1a1a',
  },
  pickerDayCell: {
    width: `${100 / 7}%`,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerDayInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pickerDayFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  pickerDaySelected: {
    backgroundColor: colors.primary,
  },
  pickerDayToday: {
    borderColor: colors.primary,
  },
  pickerDayText: {
    color: colors.white,
    fontSize: moderateScale(13),
  },
  pickerDayTextSelected: {
    color: colors.white,
    fontWeight: 'bold',
  },
  pickerDayTextToday: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  pickerDayTextFuture: {
    color: '#444',
  },
  pickerFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
    gap: spacing.sm,
  },
  pickerFooterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  pickerFooterBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerFooterBtnFocused: {
    backgroundColor: colors.primary,
    borderColor: colors.white,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  pickerFooterBtnTextPrimaryFocused: {
    color: colors.white,
  },
  pickerFooterBtnText: {
    color: colors.textSecondary,
    fontSize: moderateScale(13),
  },
  pickerFooterBtnTextPrimary: {
    color: colors.white,
    fontSize: moderateScale(13),
  },

  // ── List ──
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: moderateScale(13),
    marginTop: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  rowContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  timelineCol: {
    width: 48,
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#222',
    left: 23,
  },
  timelineDateContainer: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    zIndex: 2,
  },
  timelineMonth: {
    fontSize: moderateScale(9),
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineDay: {
    fontSize: moderateScale(20),
    color: colors.white,
  },

  // ── Notification Card ──
  itemCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#222',
    overflow: 'hidden',
    elevation: 3,
  },
  itemCardFocused: {
    borderColor: colors.primary,
    backgroundColor: '#1f1f1f',
    transform: [{ scale: 1.01 }],
  },
  itemImage: {
    width: moderateScale(85),
    height: moderateScale(120),
    backgroundColor: colors.backgroundCard,
  },
  itemDetails: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'space-between',
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 6,
  },
  itemTypeBadge: {
    fontSize: moderateScale(9),
    letterSpacing: 0.5,
  },
  categoryBadgeContainer: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  categoryBadgeText: {
    fontSize: moderateScale(8),
    color: colors.primary,
    textTransform: 'uppercase',
  },
  fundadyBadgeContainer: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 1,
    flexShrink: 0,
    marginLeft: 3
  },
  fundadyBadgeText: {
    fontSize: moderateScale(8),
    color: colors.primary,
    textTransform: 'uppercase',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexShrink: 0,
    marginLeft: 4,
  },
  ratingText: {
    fontSize: moderateScale(9),
    color: '#FFD700',
    marginLeft: 2,
  },
  itemTitle: {
    color: colors.white,
    fontSize: moderateScale(14),
    marginVertical: 1,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 1,
    gap: 4,
  },
  genrePill: {
    backgroundColor: '#222',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genrePillText: {
    fontSize: moderateScale(8),
    color: colors.textSecondary,
  },
  itemDescription: {
    color: colors.textSecondary,
    fontSize: moderateScale(10.5),
    lineHeight: moderateScale(14),
    marginVertical: 1,
  },
  itemDescriptionMuted: {
    color: colors.textMuted,
    fontSize: moderateScale(10.5),
    fontStyle: 'italic',
  },
  playNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs - 2,
  },
  playNowText: {
    fontSize: moderateScale(9),
    color: colors.primary,
    marginLeft: 4,
    textTransform: 'uppercase',
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    marginTop: moderateScale(80),
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.white,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 280,
  },
  changeDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: spacing.sm,
    gap: 8,
  },
  changeDateBtnFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(229,9,20,0.12)',
  },
  changeDateBtnText: {
    color: colors.white,
    fontSize: moderateScale(13),
  },

  // ── Detail Modal ──
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.backgroundCard,
  },
  modalBody: {
    padding: spacing.md,
  },
  modalTitle: {
    color: colors.white,
    marginBottom: spacing.xs,
  },
  genreBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    backgroundColor: '#181818',
    gap: spacing.sm,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm - 2,
    paddingHorizontal: spacing.md,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modalButtonFocused: {
    borderColor: colors.primary,
  },
  modalTrailerButton: {
    backgroundColor: colors.white,
  },
  modalCloseButton: {
    backgroundColor: '#444',
  },
  modalButtonText: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
});

export default NotificationScreen;
