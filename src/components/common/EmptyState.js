import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from './SvgIcon';
import { colors } from '../../theme/colors';
import { spacing, iconSizes } from '../../theme/spacing';
import AppText from './AppText';

const EmptyState = ({
    title = 'No Data Found',
    message = 'Try searching for something else.',
    icon = 'info-outline'
}) => {
    return (
        <View style={styles.container}>
            <Icon name={icon} size={iconSizes.xxl || 64} color={colors.textMuted} />
            <AppText variant="bold" size="xl" style={styles.title}>
                {title}
            </AppText>
            <AppText color={colors.textMuted} style={styles.message}>
                {message}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.background,
    },
    title: {
        marginTop: spacing.lg,
        textAlign: 'center',
    },
    message: {
        marginTop: spacing.sm,
        textAlign: 'center',
    },
});

export default EmptyState;
