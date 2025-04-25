import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, FlatList, TouchableOpacity, Linking } from 'react-native';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useRoute } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


const PlacementUserDetail = () => {
  const [senior, setSenior] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const route = useRoute();
  const { uid, userId } = route.params;

    const openLink = (url) => {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL: ", err)
      );
    };


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch senior profile
        const seniorDoc = doc(db, 'seniors', userId);
        const seniorSnapshot = await getDoc(seniorDoc);
        
        if (seniorSnapshot.exists()) {
          const seniorData = seniorSnapshot.data();
          console.log("Senior data found:", seniorData);
          setSenior(seniorData);
        } else {
          console.log("No senior document found for UID:", uid);
        }

        // Fetch posts with modified query
        const postsQuery = query(
          collection(db, 'posts'),
          where('uid', '==', uid)
        );
        console.log("Fetching posts...");
        const postsSnapshot = await getDocs(postsQuery);
        console.log("Posts snapshot size:", postsSnapshot.size);
        
        const postsData = [];
        postsSnapshot.forEach((doc) => {
          console.log("Post document:", doc.id, doc.data());
          postsData.push({ ...doc.data(), id: doc.id });
        });
        console.log("Final posts data:", postsData);
        setPosts(postsData);

        // Fetch events with modified query
        const eventsQuery = query(
          collection(db, 'events'),
          where('uid', '==', uid)
        );
        console.log("Fetching events...");
        const eventsSnapshot = await getDocs(eventsQuery);
        console.log("Events snapshot size:", eventsSnapshot.size);
        
        const eventsData = [];
        eventsSnapshot.forEach((doc) => {
          console.log("Event document:", doc.id, doc.data());
          eventsData.push({ ...doc.data(), id: doc.id });
        });
        console.log("Final events data:", eventsData);
        setEvents(eventsData);

      } catch (error) {
        console.error('Error fetching data: ', error);
        // Log more detailed error information
        if (error.code) {
          console.error('Error code:', error.code);
        }
        if (error.message) {
          console.error('Error message:', error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  // Rest of the component code remains the same...

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      {/* <Image source={{ uri: item.image }} style={styles.cardImage} /> */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardBody}>{item.body}</Text>
      </View>
    </View>
  );

  const renderEvent = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardBody}>{item.description}</Text>
        <Text style={styles.cardBody}>Date: {item.date}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: senior?.photo || 'https://via.placeholder.com/120' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{senior?.fullName || 'Name not available'}</Text>
        <Text style={styles.department}>Department: {senior?.department || 'N/A'}</Text>
          <View style={styles.linksContainer}>
          {senior.email && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => openLink(`mailto:${senior.email}`)}
            >
              <Icon name="email" size={30} color="#2A3663" />
            </TouchableOpacity>
          )}

          {senior.whatsapp && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() =>
                openLink(`https://wa.me/${senior?.whatsapp}`)
              }
            >
              <Icon name="whatsapp" size={30} color="#25D366" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{posts.length}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Posts</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />

      <Text style={styles.sectionTitle}>Events</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F9',
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  department: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A3663',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
    width: "100%"
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
});

export default PlacementUserDetail;