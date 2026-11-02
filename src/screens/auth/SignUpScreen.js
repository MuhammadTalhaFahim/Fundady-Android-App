import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';

const SignUpScreen = () => {
    return (
        <View style={styles.container}>
            <AppText variant="bold" size="headingLg">Create Account</AppText>
            <AppText color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
<<<<<<< HEAD
                Join Fundady to watch your favorites!
=======
                Join Netflix to watch your favorites!
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
            </AppText>
            <AppButton title="Sign Up" style={{ width: '100%', marginTop: spacing.lg }} />
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

export default SignUpScreen;
