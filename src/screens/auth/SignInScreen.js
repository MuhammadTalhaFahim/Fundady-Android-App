import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';

const SignInScreen = () => {
    return (
        <View style={styles.container}>
            <AppText variant="bold" size="headingLg">Sign In</AppText>
            <AppText color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                Log in to start watching!
            </AppText>
            {/* Form placeholders */}
            <AppButton title="Sign In" style={{ width: '100%', marginTop: spacing.lg }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
});

export default SignInScreen;
