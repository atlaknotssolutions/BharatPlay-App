import Constants from "expo-constants";

const getApiOrigin = () => {
  const fromEnv =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    Constants.expoConfig?.extra?.apiBaseUrl;

  if (fromEnv) {
    return String(fromEnv).replace(/\/+$/, "");
  }

  return "http://10.54.131.82:8000";
};

const API_ORIGIN = getApiOrigin();
const API_BASE = `${API_ORIGIN}/api`;
const API_USERVIDEO = `${API_ORIGIN}/api/uservideo`;

export { API_ORIGIN, API_BASE, API_USERVIDEO };
