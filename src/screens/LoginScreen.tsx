import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ChevronLeft,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { API_BASE } from "../../config/api";

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get("window");

const googleConfig = Constants.expoConfig?.extra?.google || {};
const GOOGLE_WEB_CLIENT_ID = googleConfig.webClientId || "";
const GOOGLE_ANDROID_CLIENT_ID = googleConfig.androidClientId || "";
const GOOGLE_IOS_CLIENT_ID = googleConfig.iosClientId || "";
const isGoogleClientId = (value) =>
  value.endsWith(".apps.googleusercontent.com") && !value.startsWith("GOCSPX-");
const GOOGLE_CONFIGURED = Boolean(
  isGoogleClientId(GOOGLE_WEB_CLIENT_ID) &&
  isGoogleClientId(GOOGLE_ANDROID_CLIENT_ID) &&
  isGoogleClientId(GOOGLE_IOS_CLIENT_ID),
);

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP states
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [resendingOtp, setResendingOtp] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // ========== Animations ==========
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formOpacity = useRef(new Animated.Value(1)).current;
  const formTranslate = useRef(new Animated.Value(0)).current;
  const otpAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const tabIndicator = useRef(new Animated.Value(0)).current;

  // Card entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  // Tab indicator animation
  useEffect(() => {
    Animated.spring(tabIndicator, {
      toValue: isLogin ? 0 : 1,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  }, [isLogin]);

  // Form switch animation
  const animateFormSwitch = (callback) => {
    Animated.parallel([
      Animated.timing(formOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslate, {
        toValue: isLogin ? -20 : 20,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      formTranslate.setValue(isLogin ? 20 : -20);
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslate, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    });
  };

  // OTP appear animation
  useEffect(() => {
    if (otpRequired) {
      otpAnim.setValue(0);
      Animated.spring(otpAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 70,
        friction: 10,
      }).start();
    }
  }, [otpRequired]);

  // Button press animation
  const onPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  };

  // ========== Device ID ==========
  const getDeviceId = async () => {
    try {
      let deviceId = await AsyncStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId =
          "rn-" +
          Math.random().toString(36).substring(2) +
          Date.now().toString(36);
        await AsyncStorage.setItem("deviceId", deviceId);
      }
      return deviceId;
    } catch {
      return "rn-fallback-" + Date.now();
    }
  };

  // ========== Google Auth ==========
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      handleGoogleSuccess(authentication);
    } else if (response?.type === "error") {
      setGoogleLoading(false);
      Toast.show({
        type: "error",
        text1: "Google Sign-In Failed",
        text2: String(response.error || "Something went wrong"),
      });
    } else if (response?.type === "dismiss" || response?.type === "cancel") {
      setGoogleLoading(false);
    }
  }, [response]);

  // OTP countdown
  useEffect(() => {
    if (!otpRequired || otpCountdown <= 0) return;
    const timer = setTimeout(() => {
      setOtpCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [otpRequired, otpCountdown]);

  const handleGoogleSuccess = async (authentication) => {
    try {
      setGoogleLoading(true);
      let idToken = authentication?.idToken;

      if (!idToken && authentication?.accessToken) {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${authentication.accessToken}` },
          },
        );
        await userInfoRes.json();
        idToken = authentication.accessToken;
      }

      if (!idToken) throw new Error("Google token not received");

      const res = await fetch(`${API_BASE}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: idToken }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Google authentication failed");

      await handleAuthSuccess(data);
    } catch (err) {
      console.error("Google auth error:", err);
      Toast.show({
        type: "error",
        text1: "Google Sign-In Error",
        text2: err.message || "Something went wrong",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError("");
    if (field === "email" || field === "password" || field === "name") {
      setOtpRequired(false);
      setOtp("");
      setOtpCountdown(0);
    }
  };

  const handleAuthSuccess = async (data) => {
    try {
      const token = data?.token || data?.user?.token || data?.accessToken;
      const user = data?.user || {};

      if (!token) {
        throw new Error(
          data?.message || "Authentication response did not include a token",
        );
      }

      await AsyncStorage.setItem("token", String(token));
      await AsyncStorage.setItem("user", JSON.stringify(user));

      Toast.show({
        type: "success",
        text1: "Welcome!",
        text2: "Authentication successful.",
        position: "top",
        visibilityTime: 2500,
      });

      navigation.replace("AdminPanel");
    } catch (e) {
      console.error("Failed to save auth data", e);
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: e?.message || "Session could not be saved.",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GOOGLE_CONFIGURED) {
      Toast.show({
        type: "info",
        text1: "Google Sign-In unavailable",
        text2: "Configure Google OAuth IDs in the local .env file.",
      });
      return;
    }

    try {
      setGoogleLoading(true);
      setError("");
      await promptAsync();
    } catch (err) {
      setGoogleLoading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Could not start Google Sign-In",
      });
    }
  };

  // ========== Email / Password + OTP ==========
  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email and password are required",
      });
      return;
    }
    if (!isLogin && !formData.name) {
      setError("Full name is required");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Full name is required",
      });
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 8 characters",
      });
      return;
    }

    if (otpRequired && !otp) {
      setError("Please enter the 6-digit OTP");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter the OTP sent to your email",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const deviceId = await getDeviceId();
      const endpoint = isLogin ? "/login" : "/register";

      const body = isLogin
        ? {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            deviceId,
            ...(otpRequired ? { otp } : {}),
          }
        : {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            deviceId,
            ...(otpRequired ? { otp } : {}),
          };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "VPN_OR_PROXY_DETECTED") {
          throw new Error(
            "Login/Register not allowed over VPN or Proxy. Please disable it.",
          );
        }
        throw new Error(data.message || "Authentication failed");
      }

      if (data.requiresOtp) {
        setOtpRequired(true);
        setOtp("");
        setOtpCountdown(60);
        setError("");
        Toast.show({
          type: "info",
          text1: "OTP Sent",
          text2: "Check your email for the 6-digit code",
          visibilityTime: 4000,
        });
        return;
      }

      await handleAuthSuccess(data);
    } catch (err) {
      const errorMsg = err.message || "Something went wrong";
      setError(errorMsg);
      Toast.show({ type: "error", text1: "Error", text2: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0 || resendingOtp) return;

    setResendingOtp(true);
    setError("");

    try {
      const deviceId = await getDeviceId();
      const endpoint = isLogin ? "/login" : "/register";

      const body = isLogin
        ? {
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            deviceId,
          }
        : {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            deviceId,
          };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Could not resend OTP");

      if (data.requiresOtp) {
        setOtp("");
        setOtpCountdown(60);
        Toast.show({
          type: "info",
          text1: "New OTP Sent",
          text2: "Please check your email",
        });
      }
    } catch (err) {
      setError(err.message || "Could not resend OTP");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err.message || "Could not resend OTP",
      });
    } finally {
      setResendingOtp(false);
    }
  };

  const toggleMode = () => {
    animateFormSwitch(() => {
      setIsLogin(!isLogin);
      setOtpRequired(false);
      setOtp("");
      setOtpCountdown(0);
      setError("");
      setFormData({ name: "", email: "", password: "" });
    });
  };

  // Tab indicator style
  const indicatorLeft = tabIndicator.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.centerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.card}>
              {/* Header */}
              <View style={styles.header}>
                <Image
                  source={require("../../assets/Bharatplay-Cb3qGLyP-Cb3qGLyP.png")}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <Text style={styles.subtitle}>
                  {isLogin ? "Sign in to continue" : "Create your account"}
                </Text>
              </View>

              {/* Tabs with animated indicator */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => {
                    if (!isLogin) toggleMode();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.tabText, isLogin && styles.activeTabText]}
                  >
                    Login
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tab}
                  onPress={() => {
                    if (isLogin) toggleMode();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.tabText, !isLogin && styles.activeTabText]}
                  >
                    Register
                  </Text>
                </TouchableOpacity>

                {/* Animated underline */}
                <Animated.View
                  style={[styles.tabIndicator, { left: indicatorLeft }]}
                />
              </View>

              <View style={styles.formContainer}>
                {error ? (
                  <Animated.View style={styles.errorBox}>
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                ) : null}

                <Animated.View
                  style={[
                    styles.form,
                    {
                      opacity: formOpacity,
                      transform: [{ translateX: formTranslate }],
                    },
                  ]}
                >
                  {/* Name field */}
                  {!isLogin && !otpRequired && (
                    <View style={styles.inputWrapper}>
                      <User size={20} color="#6b7280" style={styles.icon} />
                      <TextInput
                        placeholder="Full Name"
                        value={formData.name}
                        onChangeText={(text) => handleChange("name", text)}
                        style={styles.input}
                        placeholderTextColor="#6b7280"
                        autoCapitalize="words"
                      />
                    </View>
                  )}

                  {/* Email */}
                  {!otpRequired && (
                    <View style={styles.inputWrapper}>
                      <Mail size={20} color="#6b7280" style={styles.icon} />
                      <TextInput
                        placeholder="Email address"
                        value={formData.email}
                        onChangeText={(text) => handleChange("email", text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={styles.input}
                        placeholderTextColor="#6b7280"
                      />
                    </View>
                  )}

                  {/* Password */}
                  {!otpRequired && (
                    <View style={styles.inputWrapper}>
                      <Lock size={20} color="#6b7280" style={styles.icon} />
                      <TextInput
                        placeholder="Password"
                        value={formData.password}
                        onChangeText={(text) => handleChange("password", text)}
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        placeholderTextColor="#6b7280"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeIcon}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color="#9ca3af" />
                        ) : (
                          <Eye size={20} color="#9ca3af" />
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* ========== OTP Section ========== */}
                  {otpRequired && (
                    <Animated.View
                      style={[
                        styles.otpSection,
                        {
                          opacity: otpAnim,
                          transform: [
                            {
                              translateY: otpAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [25, 0],
                              }),
                            },
                            {
                              scale: otpAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.95, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <Text style={styles.otpTitle}>Enter OTP</Text>
                      <Text style={styles.otpSubtitle}>
                        We sent a 6-digit code to{"\n"}
                        <Text style={{ color: "#ef4444", fontWeight: "600" }}>
                          {formData.email}
                        </Text>
                      </Text>

                      <TextInput
                        style={styles.otpInput}
                        placeholder="••••••"
                        placeholderTextColor="#4b5563"
                        value={otp}
                        onChangeText={(text) =>
                          setOtp(text.replace(/\D/g, "").slice(0, 6))
                        }
                        keyboardType="number-pad"
                        maxLength={6}
                        textAlign="center"
                        autoFocus
                      />

                      <View style={styles.otpRow}>
                        <Text style={styles.otpHint}>
                          {otpCountdown > 0
                            ? `Resend OTP in ${otpCountdown}s`
                            : "Didn't receive the code?"}
                        </Text>
                        <TouchableOpacity
                          onPress={handleResendOtp}
                          disabled={resendingOtp || otpCountdown > 0 || loading}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.resendText,
                              (resendingOtp || otpCountdown > 0 || loading) &&
                                styles.resendDisabled,
                            ]}
                          >
                            {resendingOtp ? "Sending..." : "Resend OTP"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  )}

                  {/* Submit Button */}
                  <Animated.View
                    style={{ transform: [{ scale: buttonScale }] }}
                  >
                    <TouchableOpacity
                      onPress={handleSubmit}
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      disabled={loading || googleLoading}
                      activeOpacity={0.9}
                      style={[
                        styles.button,
                        (loading || googleLoading) && styles.buttonDisabled,
                      ]}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.buttonText}>
                            {otpRequired
                              ? "Verify OTP & Continue"
                              : isLogin
                                ? "Sign In"
                                : "Create Account"}
                          </Text>
                          <ArrowRight size={20} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Back button when OTP is shown */}
                  {otpRequired && (
                    <TouchableOpacity
                      onPress={() => {
                        setOtpRequired(false);
                        setOtp("");
                        setOtpCountdown(0);
                        setError("");
                      }}
                      style={styles.backButton}
                      activeOpacity={0.7}
                    >
                      <ChevronLeft size={18} color="#9ca3af" />
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                  )}

                  {/* Divider + Google */}
                  {!otpRequired && (
                    <>
                      <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.divider} />
                      </View>

                      <TouchableOpacity
                        onPress={handleGoogleSignIn}
                        disabled={
                          !GOOGLE_CONFIGURED ||
                          !request ||
                          loading ||
                          googleLoading
                        }
                        activeOpacity={0.85}
                        style={[
                          styles.googleButton,
                          (loading || googleLoading) && styles.buttonDisabled,
                        ]}
                      >
                        {googleLoading ? (
                          <ActivityIndicator color="#111" size="small" />
                        ) : (
                          <Text style={styles.googleButtonText}>
                            Continue with Google
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </Animated.View>

                {/* Toggle Login/Register */}
                {!otpRequired && (
                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>
                      {isLogin
                        ? "Don't have an account? "
                        : "Already have an account? "}
                      <Text style={styles.toggleLink} onPress={toggleMode}>
                        {isLogin ? "Sign up" : "Sign in"}
                      </Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#141414",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#262626",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    paddingTop: 36,
    paddingBottom: 16,
    alignItems: "center",
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#fff",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "50%",
    height: 3,
    backgroundColor: "#ef4444",
    borderRadius: 3,
  },
  formContainer: {
    padding: 28,
    paddingTop: 24,
  },
  errorBox: {
    backgroundColor: "rgba(127, 29, 29, 0.35)",
    borderWidth: 1,
    borderColor: "#7f1d1d",
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  errorText: {
    color: "#fca5a5",
    textAlign: "center",
    fontSize: 13.5,
    lineHeight: 19,
  },
  form: {
    gap: 16,
  },
  inputWrapper: {
    position: "relative",
  },
  icon: {
    position: "absolute",
    left: 16,
    top: 17,
    zIndex: 1,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "#2e2e2e",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 50,
    color: "#fff",
    fontSize: 15.5,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 17,
  },
  // OTP Styles
  otpSection: {
    gap: 14,
    alignItems: "center",
    marginBottom: 4,
  },
  otpTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  otpSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  otpInput: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1.5,
    borderColor: "#ef4444",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    color: "#fff",
    fontSize: 28,
    letterSpacing: 14,
    width: "100%",
    textAlign: "center",
    fontWeight: "700",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 2,
  },
  otpHint: {
    color: "#9ca3af",
    fontSize: 13,
  },
  resendText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 13,
  },
  resendDisabled: {
    color: "#4b5563",
  },
  button: {
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16.5,
    fontWeight: "700",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
  },
  backButtonText: {
    color: "#9ca3af",
    fontSize: 14.5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#2e2e2e",
  },
  dividerText: {
    color: "#6b7280",
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: "500",
  },
  googleButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  googleButtonText: {
    color: "#111",
    fontSize: 15.5,
    fontWeight: "600",
  },
  toggleContainer: {
    marginTop: 22,
    alignItems: "center",
  },
  toggleText: {
    color: "#9ca3af",
    fontSize: 14.5,
  },
  toggleLink: {
    color: "#ef4444",
    fontWeight: "700",
  },
});
