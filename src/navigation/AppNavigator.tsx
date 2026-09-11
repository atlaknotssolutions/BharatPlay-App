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
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AdminTabNavigator from "./AdminTabNavigator";
import VideoDetailScreen from "../admin/VideoDetailScreen";
import CopyrightScreen from "../screens/CopyrightClaimScreen";
import CopyrightClaimScreen from "../screens/CopyrightClaimScreen";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setHasSession(Boolean(token));
      } catch {
        setHasSession(false);
      } finally {
        setSessionLoading(false);
      }
    };

    restoreSession();
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
        id="RootStack"
        initialRouteName={hasSession ? "AdminPanel" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="AdminPanel" component={AdminTabNavigator} />
        <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />

        <Stack.Screen name="Copyright" component={CopyrightScreen} />
        <Stack.Screen name="CopyrightClaim" component={CopyrightClaimScreen} />

        {/* <Stack.Screen name="SubscribedChannels" component={SubscribedChannels} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
