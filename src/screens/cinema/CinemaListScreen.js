import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import AppText from '../../components/common/AppText';

const CinemaListScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <AppText variant="bold" size="headingLg" style={styles.title}>Cinema</AppText>
                <AppText size="lg" color={colors.textSecondary}>Latest Movies in Theaters</AppText>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
    },
    title: {
        marginBottom: spacing.sm,
    },
});

export default CinemaListScreen;
