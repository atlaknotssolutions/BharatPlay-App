import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ArrowLeft,
  Wallet,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { API_BASE } from "../../config/api";

// Local:
// const API_BASE = "https://exp://192.168.1.14:8081/api";

export default function WithdrawScreen() {
  const navigation = useNavigation();

  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  // 1 point = $0.01
  const usdBalance = (points * 0.01).toFixed(2);

  const methods = [
    {
      id: "upi",
      name: "UPI (Google Pay / PhonePe)",
      min: 5,
      fee: 0,
      icon: "₹",
    },
    { id: "paypal", name: "Cash", min: 10, fee: 2.9, icon: "$" },
    { id: "bank", name: "Bank Transfer", min: 20, fee: 1.5, icon: "🏦" },
  ];

  // ─── Fetch points from /me ───
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          navigation.replace("Login");
          return;
        }

        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load balance");

        const data = await res.json();
        if (data.success && data.user) {
          const rewardPoints =
            data.user.rewardPoints || data.user.totalEarnings || 0;
          setPoints(Number(rewardPoints));
        }
      } catch (err) {
        console.warn(err);
        Alert.alert("Error", "Could not load balance");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [navigation]);

  const handleCopyUPI = async () => {
    await Clipboard.setStringAsync("aditya@upi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!selectedMethod) {
      setError("Select a withdrawal method");
      return;
    }
    if (withdrawAmount < selectedMethod.min) {
      setError(`Minimum withdrawal is $${selectedMethod.min}`);
      return;
    }
    if (withdrawAmount > parseFloat(usdBalance)) {
      setError("Insufficient balance");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Please login again");

      // Backend call (uncomment jab API ready ho)
      // const res = await fetch(`${API_BASE}/withdraw`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify({
      //     amount: withdrawAmount,
      //     method: selectedMethod.id,
      //   }),
      // });
      // const data = await res.json();
      // if (!res.ok || !data.success) throw new Error(data.message || "Withdraw failed");

      Alert.alert(
        "Request Submitted",
        `$${withdrawAmount.toFixed(2)} via ${selectedMethod.name} request submitted!\nProcessing: 1-3 business days.`,
      );

      setAmount("");
      setSelectedMethod(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff0000" />
        <Text style={styles.loadingText}>Loading balance...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
    >
      {/* Optional Header (back button) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>${usdBalance}</Text>
            </View>
            <Wallet size={48} color="#facc15" style={{ opacity: 0.85 }} />
          </View>
          <Text style={styles.pointsText}>
            ≈ {Number(points).toFixed(2)} Bitzo Points (1 point = $0.01)
          </Text>
        </View>

        {/* Select Method */}
        <Text style={styles.sectionTitle}>Select Withdrawal Method</Text>

        <View style={styles.methodsList}>
          {methods.map((method) => {
            const isSelected = selectedMethod?.id === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  isSelected && styles.methodCardActive,
                ]}
                onPress={() => {
                  setSelectedMethod(method);
                  setError("");
                }}
                activeOpacity={0.8}
              >
                <View style={styles.methodLeft}>
                  <View style={styles.methodIcon}>
                    <Text style={styles.methodIconText}>{method.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodMeta}>
                      Min: ${method.min} • Fee: {method.fee}%
                    </Text>
                  </View>
                </View>
                {isSelected && <Check size={20} color="#3b82f6" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Amount Input */}
        {selectedMethod && (
          <View style={styles.amountSection}>
            <Text style={styles.label}>Amount to Withdraw (USD)</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={(t) => {
                  setAmount(t);
                  setError("");
                }}
                placeholder="0.00"
                placeholderTextColor="#71717a"
                keyboardType="decimal-pad"
              />
            </View>

            {error ? (
              <View style={styles.errorRow}>
                <AlertCircle size={16} color="#f87171" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.feeHint}>
              You will receive ≈ $
              {(
                (parseFloat(amount) || 0) *
                (1 - selectedMethod.fee / 100)
              ).toFixed(2)}{" "}
              after fee
            </Text>
          </View>
        )}

        {/* UPI Specific */}
        {selectedMethod?.id === "upi" && (
          <View style={styles.upiBox}>
            <Text style={styles.upiLabel}>Send to UPI ID:</Text>
            <View style={styles.upiRow}>
              <Text style={styles.upiId}>aditya@upi</Text>
              <TouchableOpacity onPress={handleCopyUPI} style={styles.copyBtn}>
                {copied ? (
                  <Check size={18} color="#22c55e" />
                ) : (
                  <Copy size={18} color="#60a5fa" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.upiHint}>
              Send exact amount and share screenshot in support
            </Text>
          </View>
        )}

        {/* Withdraw Button */}
        <TouchableOpacity
          style={[
            styles.withdrawBtn,
            (!selectedMethod ||
              !amount ||
              parseFloat(amount) <= 0 ||
              submitting) &&
              styles.withdrawBtnDisabled,
          ]}
          onPress={handleWithdraw}
          disabled={
            !selectedMethod || !amount || parseFloat(amount) <= 0 || submitting
          }
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.withdrawBtnText}>Withdraw Now</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Processing time: 1–3 business days • First withdrawal may take longer
          for verification
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  center: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#aaa",
    marginTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#272727",
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 160, // bottom tab ke liye gap
  },

  // Balance Card
  balanceCard: {
    backgroundColor: "#1a1a2e",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  balanceLabel: {
    color: "#a1a1aa",
    fontSize: 14,
  },
  balanceValue: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
    marginTop: 4,
  },
  pointsText: {
    color: "#71717a",
    fontSize: 13,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },

  methodsList: {
    marginBottom: 24,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  methodCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.12)",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#272727",
    justifyContent: "center",
    alignItems: "center",
  },
  methodIconText: {
    fontSize: 18,
  },
  methodName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  methodMeta: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 2,
  },

  amountSection: {
    marginBottom: 20,
  },
  label: {
    color: "#a1a1aa",
    fontSize: 13,
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    color: "#a1a1aa",
    fontSize: 20,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: "#fff",
    fontSize: 20,
    paddingVertical: 14,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  errorText: {
    color: "#f87171",
    fontSize: 13,
  },
  feeHint: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 8,
  },

  upiBox: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#333",
  },
  upiLabel: {
    color: "#a1a1aa",
    fontSize: 13,
    marginBottom: 8,
  },
  upiRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#272727",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  upiId: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  copyBtn: {
    padding: 4,
  },
  upiHint: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 8,
  },

  withdrawBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  withdrawBtnDisabled: {
    backgroundColor: "#3f3f46",
  },
  withdrawBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  footerNote: {
    color: "#71717a",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 40,
    lineHeight: 18,
  },
});
