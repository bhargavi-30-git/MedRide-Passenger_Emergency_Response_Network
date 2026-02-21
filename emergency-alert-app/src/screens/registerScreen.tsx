import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase/firebaseConfig";
import { useState } from "react";
import * as Location from "expo-location";

type Role = "USER" | "ADMIN" | "HOSPITAL";

export default function RegisterScreen({
  onSwitch,
}: {
  onSwitch: () => void;
}) {
  const [role, setRole] = useState<Role>("USER");

  const [name, setName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const register = async () => {
    try {
      setLoading(true);

      if (!name || !email || !password) {
        Alert.alert("Error", "Please fill required fields");
        setLoading(false);
        return;
      }

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCred.user.uid;

      let userData: any = {
        role,
        name,
        email,
        createdAt: Date.now(),
      };

      // 👤 USER fields
      if (role === "USER") {
        if (!vehicleNo || !phone) {
          Alert.alert("Error", "Vehicle number and phone required");
          setLoading(false);
          return;
        }

        userData.vehicleNo = vehicleNo;
        userData.phone = phone;
      }

      // 🏥 HOSPITAL fields (auto GPS)
      if (role === "HOSPITAL") {
        if (!phone) {
          Alert.alert("Error", "Phone number required");
          setLoading(false);
          return;
        }

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Location permission is required for hospital registration"
          );
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        userData.phone = phone;
        userData.lat = latitude;
        userData.lng = longitude;
      }

      // 🚨 ADMIN only basic fields (no extras)

      await set(ref(db, `users/${uid}`), userData);

      Alert.alert("Success", "Registration successful");
    } catch (err: any) {
      Alert.alert("Registration failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      {/* ROLE SELECTOR */}
      <View style={styles.roleContainer}>
        {["USER", "ADMIN", "HOSPITAL"].map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.roleButton,
              role === r && styles.selectedRole,
            ]}
            onPress={() => setRole(r as Role)}
          >
            <Text
              style={[
                styles.roleText,
                role === r && styles.selectedRoleText,
              ]}
            >
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* COMMON FIELDS */}
      <TextInput
        placeholder={
          role === "HOSPITAL" ? "Hospital Name" : "Full Name"
        }
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      {/* USER ONLY */}
      {role === "USER" && (
        <>
          <TextInput
            placeholder="Vehicle Number"
            value={vehicleNo}
            onChangeText={setVehicleNo}
            style={styles.input}
          />

          <TextInput
            placeholder="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </>
      )}

      {/* HOSPITAL ONLY */}
      {role === "HOSPITAL" && (
        <TextInput
          placeholder="Hospital Contact Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Register" onPress={register} />
      )}

      <View style={{ marginTop: 10 }}>
        <Button title="Go to Login" onPress={onSwitch} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#1976d2",
    borderColor: "#1976d2",
  },
  roleText: {
    fontWeight: "bold",
  },
  selectedRoleText: {
    color: "white",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 10,
    borderRadius: 6,
  },
});