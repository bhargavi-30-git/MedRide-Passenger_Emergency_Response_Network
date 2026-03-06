import { View, Text, TextInput, Button, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";
import { useState } from "react";

type Role = "ADMIN" | "USER";

export default function LoginScreen({
  onSwitch,
  onLoginSuccess,
}: {
  onSwitch: () => void;
  onLoginSuccess: (role: Role) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 🔹 Fetch user role from DB
      const snapshot = await get(ref(db, `users/${userCred.user.uid}`));

      if (!snapshot.exists()) {
        Alert.alert("Error", "User record not found");
        return;
      }

      const userData = snapshot.val();
      const role: Role = userData.role;

      if (role !== "ADMIN" && role !== "USER" && role !== "HOSPITAL") {
        Alert.alert("Error", "Invalid user role");
        return;
      }

      // 🔹 Manual routing handled by parent
      onLoginSuccess(role);
    } catch (err: any) {
      Alert.alert("Login failed", err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 10 }}
      />

      <Button title="Login" onPress={login} />

      <View style={{ marginTop: 10 }}>
        <Button title="Go to Register" onPress={onSwitch} />
      </View>
    </View>
  );
}
