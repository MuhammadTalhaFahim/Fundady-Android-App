import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import MainHeader from '../../components/headers/MainHeader';

const NewAndPopularScreen = () => {
    return (
        <View style={styles.container}>
            <MainHeader variant="inner" />
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    <AppText variant="bold" size="headingLg">New & Popular</AppText>
                    <AppText color={colors.textSecondary} style={{ marginTop: spacing.md }}>
                        Everything that's trending and coming soon!
                    </AppText>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xxl + 40, // Offset for header
    },
});

export default NewAndPopularScreen;
