import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

export const getDeviceId = async () => {
  try {
    let deviceId = await AsyncStorage.getItem("deviceId");

    if (!deviceId) {
      deviceId = uuidv4();
      await AsyncStorage.setItem("deviceId", deviceId);
    }

    return deviceId;
  } catch (error) {
    console.error("Error getting deviceId:", error);
    // fallback
    return uuidv4();
  }
};