import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Use the smaller dimension as width for scaling calculations
const [shortDimension, longDimension] = width < height ? [width, height] : [height, width];

// Guideline sizes are based on standard ~5" screen mobile device (Portrait)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scales the size based on the device's screen width.
 */
export const scale = (size) => (shortDimension / guidelineBaseWidth) * size;

/**
 * Scales the size based on the device's screen height.
 */
export const verticalScale = (size) => (longDimension / guidelineBaseHeight) * size;

/**
 * Scales the size with a factor to prevent extreme scaling on tablets/TVs.
 */
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Device Type detection
export const isTV = Platform.isTV || (Platform.OS === 'android' && width > height && shortDimension >= 500 && shortDimension < 600 && (longDimension / shortDimension) <= 1.8);
export const isTablet = !isTV && shortDimension >= 600;
export const isPhone = !isTV && !isTablet;

// Helper to get screen dimensions
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export default {
    scale,
    verticalScale,
    moderateScale,
    isTV,
    isTablet,
    isPhone,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
};
