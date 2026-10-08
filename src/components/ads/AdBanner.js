import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Linking,
  useWindowDimensions,
} from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { isTV, moderateScale } from '../../utils/responsive';

const ROTATE_INTERVAL_MS = 5000;
// Used only if the image size can't be read (e.g. network error)
const FALLBACK_ASPECT_RATIO = 16 / 5;
const CARD_MARGIN = spacing.md;
const CARD_RADIUS = moderateScale(20, 0.3);

const openAdLink = async url => {
  if (!url || !/^https?:\/\//i.test(url)) return;
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.warn('[Ads] Unable to open ad link:', url, error);
  }
};

const AdSlide = ({
  ad,
  pageWidth,
  cardWidth,
  cardHeight,
  onLoad,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ width: pageWidth, paddingHorizontal: CARD_MARGIN }}>
      <Pressable
        onPress={() => openAdLink(ad.url)}
        disabled={!ad.url && !isTV}
        focusable={isTV}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        style={styles.card}
      >
        <FastImage
          source={{ uri: ad.image, priority: FastImage.priority.normal }}
          style={{ width: cardWidth, height: cardHeight }}
          resizeMode={FastImage.resizeMode.cover}
          onLoad={onLoad}
        />
        {isTV && isFocused && (
          <View pointerEvents="none" style={styles.focusRing} />
        )}
      </Pressable>
    </View>
  );
};

/**
 * Rounded ad banner card. Height follows each image's own aspect ratio (png/jpg/gif).
 * Multiple ads in a slot can be swiped (or moved with the TV remote) and also auto-rotate.
 */
const AdBanner = ({ ads = [], style, width }) => {
  const { width: windowWidth } = useWindowDimensions();
  // Prefer the stable width passed by the screen (portrait-locked / TV width) so the
  // banner doesn't zoom and realign on the transient dimensions reported while
  // returning from a fullscreen/landscape player.
  const pageWidth = width || windowWidth;
  const cardWidth = pageWidth - CARD_MARGIN * 2;

  const listRef = useRef(null);
  const isDragging = useRef(false);
  const isTVFocused = useRef(false);
  const [index, setIndex] = useState(0);
  // Bumped after every manual swipe so the auto-advance timer restarts even if the slide didn't change
  const [interaction, setInteraction] = useState(0);
  const [aspectRatios, setAspectRatios] = useState({});

  const heightFor = ad =>
    cardWidth / (aspectRatios[ad?.image] || FALLBACK_ASPECT_RATIO);

  useEffect(() => {
    setIndex(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [ads]);

  // Read each image's real size up front so the banner renders at the right height from the start
  useEffect(() => {
    let cancelled = false;
    const setRatio = (image, ratio) => {
      if (cancelled) return;
      setAspectRatios(prev =>
        prev[image] === ratio ? prev : { ...prev, [image]: ratio },
      );
    };
    ads.forEach(ad => {
      Image.getSize(
        ad.image,
        (w, h) => setRatio(ad.image, w > 0 && h > 0 ? w / h : FALLBACK_ASPECT_RATIO),
        error => {
          console.warn('[Ads] Could not read image size:', ad.image, error);
          setRatio(ad.image, FALLBACK_ASPECT_RATIO);
        },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [ads]);

  // Keep the current slide aligned when the screen rotates
  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: index * pageWidth,
      animated: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageWidth]);

  // Restarts on every slide change or swipe, so the user always gets the full interval
  useEffect(() => {
    if (ads.length <= 1) return undefined;
    const timer = setTimeout(() => {
      if (isDragging.current || isTVFocused.current) return;
      const next = (index + 1) % ads.length;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setIndex(next);
    }, ROTATE_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, interaction, ads.length]);

  const handleLoad = useCallback((image, e) => {
    const { width: w, height: h } = e.nativeEvent || {};
    if (w > 0 && h > 0) {
      setAspectRatios(prev =>
        prev[image] === w / h ? prev : { ...prev, [image]: w / h },
      );
    }
  }, []);

  const handleScrollEnd = e => {
    isDragging.current = false;
    const next = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (next !== index && next >= 0 && next < ads.length) setIndex(next);
    setInteraction(n => n + 1);
  };

  if (!ads.length) return null;

  const current = ads[index] || ads[0];

  // Wait for the real size so the banner never shows at a wrong height and then jumps
  if (!aspectRatios[current.image]) return null;

  return (
    <View style={[styles.container, style]}>
      <FlatList
        ref={listRef}
        data={ads}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={ads.length > 1}
        keyExtractor={(ad, i) => `${ad.image}-${i}`}
        style={{ height: heightFor(current) }}
        getItemLayout={(_, i) => ({
          length: pageWidth,
          offset: pageWidth * i,
          index: i,
        })}
        onScrollBeginDrag={() => {
          isDragging.current = true;
        }}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item, index: i }) => (
          <AdSlide
            ad={item}
            pageWidth={pageWidth}
            cardWidth={cardWidth}
            cardHeight={heightFor(item)}
            onLoad={e => handleLoad(item.image, e)}
            onFocus={() => {
              isTVFocused.current = true;
              setIndex(i);
            }}
            onBlur={() => {
              isTVFocused.current = false;
              setInteraction(n => n + 1);
            }}
          />
        )}
      />

      {ads.length > 1 && (
        <View style={styles.dots}>
          {ads.map((ad, i) => (
            <View
              key={`${ad.image}-${i}`}
              style={[styles.dot, i === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  card: {
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: colors.backgroundLight,
  },
  focusRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.primary,
  },
});

export default AdBanner;
