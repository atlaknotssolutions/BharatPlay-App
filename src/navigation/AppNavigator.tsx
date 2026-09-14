// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";

// import LoginScreen from "../screens/LoginScreen";
// import RegisterScreen from "../screens/RegisterScreen";
// import DashboardScreen from "../screens/DashboardScreen";

// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="Login" component={LoginScreen} />
//         <Stack.Screen name="Register" component={RegisterScreen} />
//         <Stack.Screen name="Dashboard" component={DashboardScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React, { useEffect, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AdminTabNavigator from "./AdminTabNavigator";
import VideoDetailScreen from "../admin/VideoDetailScreen";
import CopyrightClaimPage from "../admin/CopyrightClaimPage";
import CopyrightScreen from "../screens/CopyrightClaimScreen";
import { API_ORIGIN } from "../../config/api";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setHasSession(false);
          return;
        }

        const response = await fetch(`${API_ORIGIN}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        const user = data?.user;

        if (!response.ok || !data?.success || !user) {
          await AsyncStorage.multiRemove(["token", "user"]);
          setHasSession(false);
          return;
        }

        await AsyncStorage.setItem("user", JSON.stringify(user));
        setHasSession(true);
      } catch {
        await AsyncStorage.multiRemove(["token", "user"]);
        setHasSession(false);
      } finally {
        setSessionLoading(false);
      }
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;

      AsyncStorage.getItem("token")
        .then((token) => setHasSession(Boolean(token)))
        .catch(() => setHasSession(false));
    });

    return () => subscription.remove();
  }, []);

  if (sessionLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        key={hasSession ? "authenticated" : "guest"}
        id="RootStack"
        initialRouteName={hasSession ? "AdminPanel" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AdminPanel" component={AdminTabNavigator} />
        <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />

        <Stack.Screen name="Copyright" component={CopyrightScreen} />
        <Stack.Screen name="CopyrightClaim" component={CopyrightClaimPage} />

        {/* <Stack.Screen name="SubscribedChannels" component={SubscribedChannels} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
