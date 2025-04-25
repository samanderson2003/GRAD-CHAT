import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import {where, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const EventCoordinator = ({ navigation }) => {
    const [seniors, setSeniors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch seniors data from Firestore
    useEffect(() => {
        const fetchSeniors = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'seniors'));
                // Include document ID along with the data

                const seniorsQuery = query(collection(db, 'seniors'), where('role', '==', 'event_coordinator'));
                const ss = await getDocs(seniorsQuery);
                const seniorsList = ss.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setSeniors(seniorsList);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching seniors data: ", error);
                setLoading(false);
            }
        };

        fetchSeniors();
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    // Render each senior item
    const renderItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => navigation.navigate("PlacementUserDetail", { uid: item.id })} // Pass the document ID
        >
            <View style={styles.card}>
                <Image 
                    source={{ uri: item.photo || 'https://via.placeholder.com/150' }} // Fallback image
                    style={styles.image} 
                />
                <Text style={styles.name}>{item.fullName || "No Name Available"}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={seniors}
                renderItem={renderItem}
                keyExtractor={(item) => item.id} // Use the document ID as a unique key
                numColumns={2} // Grid layout with 2 columns
                contentContainerStyle={styles.grid}
            />
        </View>
    );
};

const { width } = Dimensions.get('window');
const itemWidth = width / 2 - 20;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    grid: {
        justifyContent: 'space-between',
    },
    card: {
        width: itemWidth,
        marginBottom: 15,
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        padding: 10,
        margin: 5
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 100,
        marginBottom: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default EventCoordinator;