import React, { useState } from "react";
import {
    Text,
    TextInput,
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "../firebaseConfig"; // Ensure correct path to your Firebase config file
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

const JuniorRegister = ({ navigation }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const validateAndRegister = async () => {
        if (!fullName || !email || !phone || !password) {
            Alert.alert("Error", "All fields are required!");
            return;
        }

        const emailRegex = /^[a-zA-Z]+\.(24mca)@kongu\.edu$/;

        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address in the format: name.24mca@kongu.edu");
            return;
        }

        if (phone.length !== 10 || isNaN(phone)) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number!");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long!");
            return;
        }

        try {
            // Register user with Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store additional details in Firestore
            await addDoc(collection(db, "juniors"), {
                uid: user.uid,
                fullName: fullName,
                email: email,
                phone: phone,
            });

            Alert.alert("Success", "Registration successful!");
        } catch (error) {
            console.error("Error registering user: ", error);
            Alert.alert("Error", error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Junior Register</Text>

            <View style={styles.inputContainer}>
                <Icon name="account" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={(text) => setFullName(text)}
                    placeholder="Full Name"
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="email" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                    placeholder="Email"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="phone" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={(text) => setPhone(text)}
                    keyboardType="phone-pad"
                    placeholder="Phone Number"
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry
                    placeholder="Password"
                />
            </View>

            <TouchableOpacity
                style={styles.registerButton}
                onPress={validateAndRegister}
            >
                <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F9F9F9",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#2A3663",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
    },
    registerButton: {
        width: "100%",
        backgroundColor: "#2A3663",
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    registerButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default JuniorRegister;
