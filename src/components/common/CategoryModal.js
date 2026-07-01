import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
    Pressable,
    Dimensions,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from './AppText';
import { isTV } from '../../utils/responsive';

const { width } = Dimensions.get('window');

const CategoryModal = ({
    isVisible,
    onClose,
    categories,
    selectedCategory,
    onSelectCategory,
    onShow,
}) => {
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onShow={onShow}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
                    <Pressable
                        focusable={true}
                        hasTVPreferredFocus={isTV && !selectedCategory}
                        style={({ focused }) => [
                            styles.categoryItem,
                            focused && styles.categoryItemFocused
                        ]}
                        onPress={() => {
                            onSelectCategory(null);
                            onClose();
                        }}
                    >
                        {({ focused }) => (
                            <AppText
                                variant="medium"
                                size="lg"
                                style={[
                                    styles.categoryText,
                                    !selectedCategory && styles.activeCategoryText,
                                    focused && styles.categoryTextFocused
                                ]}
                            >
                                All Categories
                            </AppText>
                        )}
                    </Pressable>

                    {categories.map((cat) => (
                        <Pressable
                            key={cat.id}
                            focusable={true}
                            hasTVPreferredFocus={isTV && selectedCategory === cat.name}
                            style={({ focused }) => [
                                styles.categoryItem,
                                focused && styles.categoryItemFocused
                            ]}
                            onPress={() => {
                                onSelectCategory(cat.name);
                                onClose();
                            }}
                        >
                            {({ focused }) => (
                                <AppText
                                    variant="medium"
                                    size="lg"
                                    style={[
                                        styles.categoryText,
                                        selectedCategory === cat.name && styles.activeCategoryText,
                                        focused && styles.categoryTextFocused
                                    ]}
                                >
                                    {cat.name}
                                </AppText>
                            )}
                        </Pressable>
                    ))}
                </ScrollView>
                <Pressable
                    focusable={true}
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    {({ focused }) => (
                        <View style={[
                            styles.closeButtonInner,
                            focused && styles.closeButtonInnerFocused
                        ]}>
                            <Icon name="close" size={30} color={focused ? colors.primary : colors.black} />
                        </View>
                    )}
                </Pressable>
            </View>
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
        width: width,
    },
    categoryItem: {
        paddingVertical: spacing.md,
        width: '90%',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'transparent',
        marginVertical: 2,
    },
    categoryItemFocused: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: colors.primary,
        borderRadius: 8,
    },
    categoryText: {
        color: colors.white,
        fontSize: 18,
    },
    categoryTextFocused: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    activeCategoryText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        bottom: 50,
    },
    closeButtonInner: {
        backgroundColor: colors.white,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    closeButtonInnerFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
    },
});

export default CategoryModal;
