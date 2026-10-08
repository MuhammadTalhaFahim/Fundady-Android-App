/**
 * Netflix Type App
 * Professional structure with bottom tab navigation
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { getOrInitializeInstallId, sendInstallIdToBackend } from './src/utils/installTracker';
import Toast from './src/components/common/Toast';

function App() {
    useEffect(() => {
        const initializeTracking = async () => {
            const { id, isNew } = await getOrInitializeInstallId();
            if (id) {
                await sendInstallIdToBackend(id, isNew);
            }
        };
        initializeTracking();
    }, []);

    return (
        <SafeAreaProvider>
            <StatusBar
                barStyle="light-content"
                backgroundColor={colors.background}
            />
            <RootNavigator />
            <Toast />
        </SafeAreaProvider>
    );
}

export default App;
