import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LiveTvScreen from '../screens/tvon/LiveTvScreen';
import ChannelDetailScreen from '../screens/tvon/ChannelDetailScreen';

const Stack = createNativeStackNavigator();

const TvOnStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LiveTvMain" component={LiveTvScreen} />
            <Stack.Screen name="ChannelDetail" component={ChannelDetailScreen} />
        </Stack.Navigator>
    );
};

export default TvOnStack;
