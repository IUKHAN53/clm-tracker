import * as Location from 'expo-location';
import { Alert } from 'react-native';

export async function captureGPS(): Promise<string | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to capture GPS coordinates. Please enable it in Settings.'
      );
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
  } catch {
    Alert.alert('GPS Error', 'Unable to get current location. Please try again.');
    return null;
  }
}
