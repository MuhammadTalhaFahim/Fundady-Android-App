import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import AppText from '../../components/common/AppText';

const CinemaDetailScreen = () => {
    return (
        <View style={styles.container}>
            <AppText variant="bold" size="xl">Cinema Details</AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CinemaDetailScreen;
