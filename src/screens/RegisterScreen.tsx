import React from "react";
import { View, Text, Alert } from "react-native";
import CustomInput from "../components/CustomInput";
import CustomButton from "../components/CustomButton";
import styles from "../styles/globalStyles";
import { API_BASE } from "../../config/api";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        Alert.alert("Registration Successful");
        navigation.replace("Login");
      } else {
        Alert.alert(data.message || "Registration Failed");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <CustomInput placeholder="Email" value={email} onChangeText={setEmail} />

      <CustomInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <CustomButton
        title={loading ? "Registering..." : "Register"}
        onPress={handleRegister}
      />

      <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
        Already have an account? Login
      </Text>
    </View>
  );
}
