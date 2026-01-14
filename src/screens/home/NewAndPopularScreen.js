import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';

const NewAndPopularScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <AppText variant="bold" size="headingLg">New & Popular</AppText>
                <AppText color={colors.textSecondary} style={{ marginTop: spacing.md }}>
                    Everything that's trending and coming soon!
                </AppText>
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
});

export default NewAndPopularScreen;
