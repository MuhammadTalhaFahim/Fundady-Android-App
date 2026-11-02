import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

const AppText = ({
    variant = 'regular',
    size = 'md',
    color = colors.textPrimary,
    style,
    children,
    ...props
}) => {
    return (
        <Text
            style={[
                styles.text,
                {
                    color,
                    fontSize: typography.fontSize[size],
                    fontWeight: typography.fontWeight[variant],
                },
                style,
            ]}
            {...props}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: typography.fontFamily.regular,
    },
});

export default AppText;
