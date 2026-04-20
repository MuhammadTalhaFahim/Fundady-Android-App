import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from './AppText';

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
                <ScrollView contentContainerStyle={styles.modalContent}>
                    <TouchableOpacity
                        style={styles.categoryItem}
                        onPress={() => {
                            onSelectCategory(null);
                            onClose();
                        }}
                    >
                        <AppText
                            variant="medium"
                            size="lg"
                            style={[
                                styles.categoryText,
                                !selectedCategory && styles.activeCategoryText
                            ]}
                        >
                            All Categories
                        </AppText>
                    </TouchableOpacity>

                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.categoryItem}
                            onPress={() => {
                                onSelectCategory(cat.name);
                                onClose();
                            }}
                        >
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
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <View style={styles.closeButtonInner}>
                        <Icon name="close" size={30} color={colors.black} />
                    </View>
                </TouchableOpacity>
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
