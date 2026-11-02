import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
<<<<<<< HEAD
=======
import NewAndPopularScreen from '../screens/home/NewAndPopularScreen';
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04

const Stack = createNativeStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
<<<<<<< HEAD
=======
            <Stack.Screen name="NewAndPopular" component={NewAndPopularScreen} />
>>>>>>> 4d1e9e1ca52bb57adfbe55e83256dbf2b3054f04
        </Stack.Navigator>
    );
};

export default HomeStack;
