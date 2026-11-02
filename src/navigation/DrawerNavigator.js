import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TabNavigator from './TabNavigator';
import PrivacyPolicyScreen from '../screens/privacy/PrivacyPolicyScreen';
import CustomDrawerContent from '../components/navigation/CustomDrawerContent';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled:false,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: colors.background || '#0D0F12',
          width: 280,
        },
        overlayColor: 'rgba(0, 0, 0, 0.7)',
        sceneContainerStyle: {
          backgroundColor: colors.background || '#0D0F12',
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
      <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
