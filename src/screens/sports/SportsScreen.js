import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Modal,
    TouchableOpacity,
    Dimensions,
    ScrollView as RNScrollView,
    Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CategoryModal from '../../components/common/CategoryModal';

const CATEGORIES_API_URL = 'https://fundady.com/api/v1/categories';

const SportsScreen = () => {
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

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

    return (
        <View style={styles.container}>
            <MainHeader variant="home" title="Sports" scrollY={scrollY} />
            {/* <View style={styles.stickyFilterContainer}>
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
            </View> */}

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
            >
                <View style={styles.soonContainer}>
        <AppText style={styles.subtitle}>Coming Soon.</AppText>
      </View>
            </Animated.ScrollView>

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
    scrollContent: {
        paddingTop: spacing.xs,
        paddingHorizontal: spacing.md,
    },
    subtitle: {
        color: colors.textMuted,
    textAlign: 'center',
  },
  soonContainer:{
    marginTop: spacing.xxxl+30,
     paddingHorizontal: spacing.md,
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
    },
    activeFilterTab: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
});

export default SportsScreen;
