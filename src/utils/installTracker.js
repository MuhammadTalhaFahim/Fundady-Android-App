import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import packageJson from '../../package.json';
import appJson from '../../app.json';
import { API_BASE_URL } from './constants';

const DEVICE_ID_KEY = '@device_install_id';

/**
 * Generates a unique UUID v4 string.
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Checks AsyncStorage for an existing install ID.
 * If not found, generates a new UUID v4 and stores it.
 * Returns an object with the install ID and whether it's a new installation.
 */
export async function getOrInitializeInstallId() {
  try {
    const storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);

    if (storedId !== null) {
      // ID already exists (app opened before, or updated)
      return { id: storedId, isNew: false };
    } else {
      // First launch (no ID stored yet)
      const newId = generateUUID();
      await AsyncStorage.setItem(DEVICE_ID_KEY, newId);

      return { id: newId, isNew: true };
    }
  } catch (error) {
    console.error('[InstallTracker] Error reading/saving ID:', error);
    return { id: null, isNew: false };
  }
}

/**
 * Sends the unique install ID to the backend on every app open.
 * Backend receives both new and existing device IDs.
 * The is_new_install flag tells backend if this is a fresh install or a returning device.
 */
export async function sendInstallIdToBackend(id, isNew) {
  const API_URL = `${API_BASE_URL}/device/store`; // TODO: Replace with your actual backend API URL


  try {
    const deviceModel = DeviceInfo.getModel();
    const manufacturer = await DeviceInfo.getManufacturer();
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device_id: id,
        app_version: packageJson.version || '1.3.0',
        app_name: appJson.displayName || appJson.name || 'Fundady',
        device_model: deviceModel,
        manufacturer: manufacturer,
      }),
    });

    if (response.ok) {
      console.log('[InstallTracker] Successfully sent install ID to backend.');
    } else {
      console.warn(`[InstallTracker] Backend returned status code: ${response.status}`);
    }
  } catch (error) {
    // We catch the error so it doesn't crash the app if the backend is down or there's no internet
    console.error('[InstallTracker] Failed to send install ID to backend:', error);
  }
}
