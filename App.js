/**
 * Netflix Type App
 * Professional structure with bottom tab navigation
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

function App() {
    return (
        <>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.background}
            />
            <RootNavigator />
        </>
    );
}

export default App;
