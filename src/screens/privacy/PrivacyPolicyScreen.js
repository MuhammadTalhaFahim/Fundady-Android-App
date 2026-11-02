import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Platform,
  RefreshControl,
  Linking,
} from 'react-native';
import AppText from '../../components/common/AppText';
import Loader from '../../components/common/Loader';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import Icon from '../../components/common/SvgIcon';
import { isTV, moderateScale } from '../../utils/responsive';
import { movieService } from '../../services/movieService';

const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

const RenderFormattedText = ({ text, style }) => {
  if (!text) return null;
  const parts = text.split(emailRegex);

  if (parts.length === 1) {
    return <AppText style={style}>{text}</AppText>;
  }

  return (
    <AppText style={style}>
      {parts.map((part, i) => {
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part);
        if (isEmail) {
          return (
            <AppText
              key={i}
              style={[
                style,
                {
                  color: colors.primary || '#E50914',
                  fontWeight: 'bold',
                },
              ]}
              onPress={() => Linking.openURL(`mailto:${part}`)}
            >
              {part}
            </AppText>
          );
        }
        return part;
      })}
    </AppText>
  );
};

const parsePrivacyText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return [];

  const normalized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const initialBlocks = normalized.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  const blocks = [];
  initialBlocks.forEach(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const firstLine = lines[0];
    const isSectionHeaderPattern = /^\d+\.[\s\t]+[A-Z0-9]/;

    if (lines.length > 1 && isSectionHeaderPattern.test(firstLine) && firstLine.length < 80 && !firstLine.endsWith(';') && !firstLine.endsWith(',')) {
      blocks.push(firstLine);
      blocks.push(lines.slice(1).join('\n'));
    } else {
      blocks.push(block);
    }
  });

  const parsedItems = [];

  blocks.forEach((block, index) => {
    // If block matches main heading title
    if (index === 0 && (block.toLowerCase().includes('privacy policy') || block.toLowerCase().includes('notice'))) {
      parsedItems.push({
        id: index + 1,
        type: 'main_header',
        content: block,
      });
      return;
    }

    // Check if block is a section title (e.g. "1. Information We Collect", "5. Contact Us")
    const isSectionHeaderPattern = /^\d+\.[\s\t]+[A-Z0-9]/;
    if (isSectionHeaderPattern.test(block) && block.length < 80 && !block.endsWith(';')) {
      parsedItems.push({
        id: index + 1,
        type: 'section_header',
        content: block,
      });
      return;
    }

    // Check if block is a list item (e.g. "1. A physical...", "6.\tA statement...")
    if (/^\d+\.[\s\t]+/.test(block)) {
      parsedItems.push({
        id: index + 1,
        type: 'bullet',
        content: block,
      });
      return;
    }

    // Check if block is bold callout/prompt
    if (block.toLowerCase().startsWith('if you believe') || block.toLowerCase().startsWith('please note')) {
      parsedItems.push({
        id: index + 1,
        type: 'bold_text',
        content: block,
      });
      return;
    }

    // Check if block contains key-value label (e.g. "Device Identifiers: ...")
    if (block.includes(':') && block.indexOf(':') < 35 && !block.toLowerCase().startsWith('http')) {
      const colonIdx = block.indexOf(':');
      const label = block.substring(0, colonIdx + 1);
      const rest = block.substring(colonIdx + 1);
      parsedItems.push({
        id: index + 1,
        type: 'key_value',
        label: label,
        content: rest,
      });
      return;
    }

    // Default regular paragraph
    parsedItems.push({
      id: index + 1,
      type: 'text',
      content: block,
    });
  });

  return parsedItems;
};

const PrivacyPolicyScreen = ({ navigation }) => {
  const [isBackFocused, setIsBackFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parsedItems, setParsedItems] = useState([]);
  const [error, setError] = useState(null);

  const fetchPrivacyPolicy = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await movieService.getPrivacyPolicy();
      const rawText = typeof response === 'string'
        ? response
        : (response?.text || response?.data || response?.privacy_policy || '');

      if (rawText) {
        const items = parsePrivacyText(rawText);
        setParsedItems(items);
      } else {
        throw new Error('Invalid privacy policy data received');
      }
    } catch (err) {
      console.error('Error fetching privacy policy:', err);
      setError('Failed to load privacy policy. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, [fetchPrivacyPolicy]);

  const onRefresh = useCallback(() => {
    fetchPrivacyPolicy(true);
  }, [fetchPrivacyPolicy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.black} />

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Pressable
            focusable={isTV}
            hasTVPreferredFocus={isTV}
            onFocus={() => setIsBackFocused(true)}
            onBlur={() => setIsBackFocused(false)}
            onPress={() => navigation.goBack()}
            style={[
              styles.headerBackBtn,
              isBackFocused && styles.headerBackBtnFocused,
            ]}
          >
            <Icon
              name="arrow-back"
              size={iconSizes.lg}
              color={isBackFocused ? colors.primary : colors.white}
            />
          </Pressable>
          <AppText variant="bold" style={styles.headerTitle}>
            Privacy Policy
          </AppText>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <Loader />
          <AppText style={styles.loadingText}>Loading Privacy Policy...</AppText>
        </View>
      ) : error && parsedItems.length === 0 ? (
        <View style={styles.centered}>
          <AppText style={styles.errorText}>{error}</AppText>
          <Pressable
            focusable={isTV}
            onPress={() => fetchPrivacyPolicy()}
            style={styles.retryBtn}
          >
            <AppText variant="bold" style={styles.retryBtnText}>
              Retry
            </AppText>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.backgroundLight || '#1a1a1a'}
            />
          }
        >
          <View style={styles.section}>
            {parsedItems.map((item, index) => {
              const isFocused = focusedIndex === index;
              return (
                <Pressable
                  key={item.id || index}
                  focusable={isTV}
                  onFocus={() => setFocusedIndex(index)}
                  style={[
                    styles.paragraphItem,
                    isTV && isFocused && styles.paragraphFocused,
                  ]}
                >
                  {item.type === 'main_header' && (
                    <View style={styles.mainHeaderCard}>
                      <RenderFormattedText
                        text={item.content}
                        style={styles.mainHeaderTitle}
                      />
                    </View>
                  )}
                  {item.type === 'section_header' && (
                    <View style={styles.sectionHeaderContainer}>
                      <RenderFormattedText
                        text={item.content}
                        style={styles.sectionTitle}
                      />
                    </View>
                  )}
                  {item.type === 'text' && (
                    <RenderFormattedText
                      text={item.content}
                      style={styles.bodyText}
                    />
                  )}
                  {item.type === 'key_value' && (
                    <AppText style={styles.bodyText}>
                      <AppText style={styles.boldPrefix}>{item.label}</AppText>
                      <RenderFormattedText text={item.content} style={styles.bodyText} />
                    </AppText>
                  )}
                  {item.type === 'bold_text' && (
                    <RenderFormattedText
                      text={item.content}
                      style={styles.boldBodyText}
                    />
                  )}
                  {item.type === 'bullet' && (
                    <RenderFormattedText
                      text={item.content}
                      style={styles.bulletItem}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footerMargin} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary || '#C0C0C0',
    fontSize: 16,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.primary || '#E50914',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    backgroundColor: colors.primary || '#E50914',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 16,
  },
  section: {
    backgroundColor: colors.surface || 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  mainHeaderCard: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  mainHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary || '#E50914',
    letterSpacing: 0.5,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary || '#FFFFFF',
    marginBottom: 4,
  },
  paragraphItem: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paragraphFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: colors.primary,
  },
  bodyText: {
    fontSize: 17,
    color: colors.textSecondary || '#C0C0C0',
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  boldPrefix: {
    fontWeight: 'bold',
    color: colors.white || '#FFFFFF',
  },
  boldBodyText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.white || '#FFFFFF',
    lineHeight: 26,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  bulletItem: {
    fontSize: 16.5,
    color: colors.textSecondary || '#B5B5B5',
    lineHeight: 26,
    marginTop: 4,
    paddingLeft: spacing.xs,
  },
  footerMargin: {
    height: 40,
  },
});

export default PrivacyPolicyScreen;
