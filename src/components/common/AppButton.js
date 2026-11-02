import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import AppText from './AppText';

const AppButton = ({
    title,
    variant = 'primary',
    loading = false,
    style,
    textStyle,
    disabled,
    ...props
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'secondary':
                return styles.secondary;
            case 'outline':
                return styles.outline;
            case 'ghost':
                return styles.ghost;
            default:
                return styles.primary;
        }
    };

    const getTextColor = () => {
        if (variant === 'outline') return colors.primary;
        if (variant === 'ghost') return colors.textPrimary;
        return colors.white;
    };

    return (
        <TouchableOpacity
            style={[styles.button, getButtonStyle(), style, (disabled || loading) && styles.disabled]}
            disabled={disabled || loading}
            activeOpacity={0.7}
            {...props}>
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <AppText variant="bold" color={getTextColor()} style={textStyle}>
                    {title}
                </AppText>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.backgroundCard,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
});

export default AppButton;
