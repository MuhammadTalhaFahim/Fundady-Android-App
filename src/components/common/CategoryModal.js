import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableHighlight,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import Icon from './SvgIcon';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from './AppText';
import { isTV } from '../../utils/responsive';

const CategoryModal = ({
    isVisible,
    onClose,
    categories,
    selectedCategory,
    onSelectCategory,
    onShow,
    title = 'All Categories',
}) => {
    const { width } = useWindowDimensions();

    useEffect(() => {
        if (isTV && isVisible && onShow) {
            // Slight delay to allow render before clearing loading state
            setTimeout(() => onShow(), 100);
        }
    }, [isVisible]);

    if (isTV && !isVisible) return null;

    const content = (
        <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={[styles.modalContent, { width }]}>
                <TouchableHighlight
                    focusable={true}
                    hasTVPreferredFocus={!selectedCategory}
                    underlayColor={colors.primary}
                    style={[
                        styles.categoryItem,
                        !selectedCategory && styles.activeCategoryItem
                    ]}
                    onPress={() => {
                        onSelectCategory(null);
                        onClose();
                    }}
                >
                    <View style={styles.categoryItemInner}>
                        <AppText
                            variant="medium"
                            size="lg"
                            style={[
                                styles.categoryText,
                                !selectedCategory && styles.activeCategoryText
                            ]}
                        >
                            {title}
                        </AppText>
                    </View>
                </TouchableHighlight>

                {categories.map((cat) => (
                    <TouchableHighlight
                        key={cat.id}
                        focusable={true}
                        hasTVPreferredFocus={selectedCategory === cat.name}
                        underlayColor={colors.primary}
                        style={[
                            styles.categoryItem,
                            selectedCategory === cat.name && styles.activeCategoryItem
                        ]}
                        onPress={() => {
                            onSelectCategory(cat.name);
                            onClose();
                        }}
                    >
                        <View style={styles.categoryItemInner}>
                            <AppText
                                variant="medium"
                                size="lg"
                                style={[
                                    styles.categoryText,
                                    selectedCategory === cat.name && styles.activeCategoryText
                                ]}
                            >
                                {cat.name}
                            </AppText>
                        </View>
                    </TouchableHighlight>
                ))}
            </ScrollView>
            <TouchableHighlight
                focusable={true}
                underlayColor={colors.primary}
                style={styles.closeButton}
                onPress={onClose}
            >
                <View style={styles.closeButtonInner}>
                    <Icon name="close" size={30} color={colors.black} />
                </View>
            </TouchableHighlight>
        </View>
    );

    if (isTV) {
        return (
            <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 9999 }]}>
                {content}
            </View>
        );
    }

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onShow={onShow}
            onRequestClose={onClose}
        >
            {content}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        paddingTop: 50,
        paddingBottom: 100,
        alignItems: 'center',
    },
    categoryItem: {
        width: '60%',
        alignItems: 'center',
        marginVertical: 4,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeCategoryItem: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    categoryItemInner: {
        paddingVertical: spacing.md,
        width: '100%',
        alignItems: 'center',
    },
    categoryText: {
        color: colors.white,
        fontSize: 18,
    },
    activeCategoryText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        bottom: 50,
        borderRadius: 30,
    },
    closeButtonInner: {
        backgroundColor: colors.white,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategoryModal;

