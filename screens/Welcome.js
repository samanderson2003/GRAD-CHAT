import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ImageBackground,
    Dimensions,
    Animated,
} from "react-native";

const Welcome = ({ navigation }) => {
    const { width, height } = Dimensions.get("window"); // Get the full window size
    const images = [
        require("../assets/Images/loginimg1.png"),
        require("../assets/Images/loginimg2.png"),
        require("../assets/Images/loginimg3.png"),
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;
    const translateXNext = useRef(new Animated.Value(width)).current;

    const startImageSlider = () => {
        // Slide the current image out
        Animated.timing(translateX, {
            toValue: -width, // Slide the image to the left
            duration: 800, // Slide duration for current image
            useNativeDriver: true,
        }).start();

        // Slide the next image in
        Animated.timing(translateXNext, {
            toValue: 0, // Slide the next image to the center
            duration: 800, // Slide duration for the next image
            useNativeDriver: true,
        }).start();

        // Change the current image index after animation completes
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            translateX.setValue(width); // Reset position for the current image
            translateXNext.setValue(0); // Reset position for the next image
        }, 800); // Match the duration of the transition
    };

    useEffect(() => {
        const interval = setInterval(() => {
            startImageSlider();
        }, 4000); // Overall interval duration
        return () => clearInterval(interval);
    }, []);

    const navLoginPage = () => {
        navigation.navigate("Login");
    };
    const navSeniorPage = () => {
        navigation.navigate("SeniorRegister");
    };
    const navJuniorPage = () => {
        navigation.navigate("JuniorRegister");
    };

    useEffect(() => {
        StatusBar.setHidden(true);
        return () => {
            StatusBar.setHidden(false);
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.backgroundContainer}>
                <Animated.View
                    style={[
                        styles.backgroundImageWrapper,
                        { transform: [{ translateX }] },
                    ]}
                >
                    <ImageBackground
                        source={images[currentIndex]}
                        style={[styles.backgroundImage, { width, height }]} // Apply dynamic width and height
                    />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.backgroundImageWrapper,
                        { transform: [{ translateX: translateXNext }] },
                    ]}
                >
                    <ImageBackground
                        source={images[(currentIndex + 1) % images.length]}
                        style={[styles.backgroundImage, { width, height }]} // Apply dynamic width and height
                    />
                </Animated.View>
            

            <View style={styles.overlay}>
                <View style={styles.loginButtonWrapper}>
                    <TouchableOpacity style={styles.loginButton} onPress={navLoginPage}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>Grad Chat</Text>
                    <Text style={styles.subtitle}>Bridge your college journey</Text>
                </View>

                <View style={styles.registrationButtonsContainer}>
                    <TouchableOpacity style={styles.registerButton} onPress={navSeniorPage}>
                        <Text style={styles.registerButtonText}>Register as Senior</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.registerButton} onPress={navJuniorPage}>
                        <Text style={styles.registerButtonText}>Register as Junior</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundContainer: {
        flex: 1,
        width: "100%",
        height: "100%",
    },
    backgroundImageWrapper: {
        position: "absolute",
        width: "100%",
        height: "100%",
    },
    backgroundImage: {
        flex: 1,
        resizeMode: "cover",
        width: "100%", // Ensure it always stretches to the full width
        height: "100%", // Ensure it always stretches to the full height
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)", // Dim overlay effect
    },
    loginButtonWrapper: {
        position: "absolute",
        top: 40,
        right: 20,
    },
    loginButton: {
        backgroundColor: "#2A3663",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 5,
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        color: "#FFFFFF",
        marginTop: 10,
        textAlign: "center",
    },
    registrationButtonsContainer: {
        paddingBottom: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    registerButton: {
        backgroundColor: "#2A3663",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginVertical: 10,
        width: "80%",
        alignItems: "center",
        elevation: 5,
    },
    registerButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default Welcome;
