import { View, Text, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";
import { useState } from "react";

type Role = "ADMIN" | "USER";

export default function RegisterScreen({ onSwitch }: { onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("USER"); // default USER

  const register = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await set(ref(db, `users/${userCred.user.uid}`), {
        email,
        role, // ADMIN or USER
        createdAt: Date.now(),
      });

      Alert.alert("Success", `Registered as ${role}`);
    } catch (err: any) {
      Alert.alert("Registration failed", err.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Register</Text>

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

      {/* ROLE SELECTION */}
      <Text style={{ fontSize: 16, marginBottom: 10 }}>Register as:</Text>

      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => setRole("USER")}
          style={{
            flex: 1,
            padding: 10,
            marginRight: 5,
            backgroundColor: role === "USER" ? "#4CAF50" : "#ccc",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>USER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRole("ADMIN")}
          style={{
            flex: 1,
            padding: 10,
            marginLeft: 5,
            backgroundColor: role === "ADMIN" ? "#F44336" : "#ccc",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>ADMIN</Text>
        </TouchableOpacity>
      </View>

      <Button title="Register" onPress={register} />

      <View style={{ marginTop: 10 }}>
        <Button title="Go to Login" onPress={onSwitch} />
      </View>
    </View>
  );
}
