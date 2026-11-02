<<<<<<< HEAD
import React, { useEffect } from 'react';
=======
import React from 'react';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import {
    View,
    StyleSheet,
    Modal,
<<<<<<< HEAD
    TouchableHighlight,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import Icon from './SvgIcon';
=======
    Pressable,
    Dimensions,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from './AppText';
import { isTV } from '../../utils/responsive';

<<<<<<< HEAD
=======
const { width } = Dimensions.get('window');

>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
const CategoryModal = ({
    isVisible,
    onClose,
    categories,
    selectedCategory,
    onSelectCategory,
    onShow,
<<<<<<< HEAD
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

=======
}) => {
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onShow={onShow}
            onRequestClose={onClose}
        >
<<<<<<< HEAD
            {content}
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    },
    categoryText: {
        color: colors.white,
        fontSize: 18,
    },
<<<<<<< HEAD
=======
    categoryTextFocused: {
        color: colors.primary,
        fontWeight: 'bold',
    },
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    activeCategoryText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        bottom: 50,
<<<<<<< HEAD
        borderRadius: 30,
=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    },
    closeButtonInner: {
        backgroundColor: colors.white,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
<<<<<<< HEAD
=======
        borderWidth: 2,
        borderColor: 'transparent',
    },
    closeButtonInnerFocused: {
        borderColor: colors.primary,
        backgroundColor: colors.white,
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
    },
});

export default CategoryModal;
<<<<<<< HEAD

=======
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
