import React, { useState } from "react";
import {
    Text,
    TextInput,
    View,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";

const SeniorRegister = ({ navigation }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [department, setDepartment] = useState("");
    const [password, setPassword] = useState("");
    const [photo, setPhoto] = useState(null);
    const [role, setRole] = useState(""); // 

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "Please grant media library permissions.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri); // Fix: Assign the URI correctly
        }
    };

    const registerSenior = async () => {
        if (!fullName || !email || !phone || !department || !password || !photo) {
            Alert.alert("Error", "All fields are required, including a profile photo!");
            return;
        }

        const emailRegex = /^[a-zA-Z]+\.(\d{1,2})mca@kongu\.edu$/;

        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address in the format: name.24mca@kongu.edu");
            return;
        }

        const match = email.match(emailRegex); // Extract the number
        const number = parseInt(match[1], 10); // Convert captured number to an integer

        if (number >= 24) {
            Alert.alert("Error", "The number in the email should be less than 24.");
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
            // Register user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Store senior details in Firestore
            await addDoc(collection(db, "seniors"), {
                uid: user.uid,
                fullName,
                email,
                phone,
                role,
                department,
                photo, // Store the correct photo URI
                user: user.uid,
            });

            Alert.alert("Success", "Senior registered successfully!");
        } catch (error) {
            console.error("Error registering senior: ", error);
            Alert.alert("Error", error.message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Senior Register</Text>

            <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
                {photo ? (
                    <Image source={{ uri: photo }} style={styles.photo} />
                ) : (
                    <Icon name="camera" size={40} color="#666" />
                )}
            </TouchableOpacity>
            <Text style={styles.photoText}>Upload Profile Photo</Text>

            <View style={styles.inputContainer}>
                <Icon name="account" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={fullName}
                    onChangeText={(text) => setFullName(text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="email" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="phone" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phone}
                    onChangeText={(text) => setPhone(text)}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="school" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Department"
                    value={department}
                    onChangeText={(text) => setDepartment(text)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock" size={24} color="#666" style={styles.icon} />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    secureTextEntry
                />
            </View>

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={role}
                    onValueChange={(itemValue) => setRole(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Select Role" value="" />
                    <Picker.Item label="Placement Coordinator" value="placement_coordinator" />
                    <Picker.Item label="Placed Super Seniors" value="super_senior" />
                    <Picker.Item label="Academic Coordinator" value="academic_coordinator" />
                    <Picker.Item label="Event Coordinator" value="event_coordinator" />
                </Picker>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={registerSenior}>
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
    photoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#EAEAEA",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    photoText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
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
    pickerContainer: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 10,
    },
    picker: {
        height: 200,
        width: "100%",
    },
});

export default SeniorRegister;