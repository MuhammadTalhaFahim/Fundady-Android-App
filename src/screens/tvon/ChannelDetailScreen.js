import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import AppText from '../../components/common/AppText';

const ChannelDetailScreen = () => {
    return (
        <View style={styles.container}>
            <AppText variant="bold" size="xl">Channel Details</AppText>
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

export default ChannelDetailScreen;
