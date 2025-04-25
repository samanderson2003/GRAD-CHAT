import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Linking
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../firebaseConfig";
import { query, where, getDocs, collection, addDoc, onSnapshot } from "firebase/firestore";

const SeniorDash = () => {
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [newPost, setNewPost] = useState({ image: "", title: "", body: "" });
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "" });

  useEffect(() => {
    const fetchProfileData = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, "seniors"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            setProfileData({ ...doc.data(), id: doc.id });
          });
        }
      }
    };

    const fetchPosts = async () => {
      const postsCollection = collection(db, "posts");
      const postsQuery = query(postsCollection, where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(postsQuery);
      const postsArray = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ ...doc.data(), id: doc.id });
      });
      setPosts(postsArray);
    };

    const subscribeToEvents = () => {
      const eventsCollection = collection(db, "events");
      const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
        const eventsArray = [];
        snapshot.forEach((doc) => {
          eventsArray.push({ ...doc.data(), id: doc.id });
        });
        setEvents(eventsArray);
      });
      return unsubscribe;
    };

    fetchProfileData();
    fetchPosts();
    const unsubscribeEvents = subscribeToEvents();

    return () => unsubscribeEvents();
  }, []);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setNewPost((prevPost) => ({ ...prevPost, image: result.assets[0].uri }));
    }
  };

  const handleCreatePost = async () => {
    if (newPost.image && newPost.title && newPost.body) {
      const postToAdd = {
        ...newPost,
        uid: auth.currentUser.uid,
        createdAt: new Date(),
      };
      try {
        await addDoc(collection(db, "posts"), postToAdd);
        setPosts((prevPosts) => [postToAdd, ...prevPosts]);
        setNewPost({ image: "", title: "", body: "" });
        setPostModalVisible(false);
      } catch (error) {
        console.error("Error adding post:", error);
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

  const handleCreateEvent = async () => {
    if (newEvent.title && newEvent.description && newEvent.date) {
      const eventToAdd = {
        ...newEvent,
        uid: auth.currentUser.uid,
        createdAt: new Date(),
      };
      try {
        await addDoc(collection(db, "events"), eventToAdd);
        setNewEvent({ title: "", description: "", date: "" });
        setEventModalVisible(false);
      } catch (error) {
        console.error("Error adding event:", error);
      }
    } else {
      alert("Please fill out all fields.");
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      {/* {item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.cardImage}
        />
      ) : (
        <Text>No image available</Text>
      )} */}
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

  if (!profileData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={{ uri: profileData.photo }} style={styles.profileImage} />
          <View style={styles.headerDetails}>
            <Text style={styles.name}>{profileData.fullName}</Text>
            <Text style={styles.role}>{profileData.role}</Text>
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

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setPostModalVisible(true)}
          >
            <Icon name="plus" size={20} color="#FFF" />
            <Text style={styles.actionText}>Create Post</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setEventModalVisible(true)}
          >
            <Icon name="calendar" size={20} color="#FFF" />
            <Text style={styles.actionText}>Add Event</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Your Posts</Text>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.postsContainer}
          scrollEnabled={false}
          nestedScrollEnabled={false}
        />

        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEvent}
          contentContainerStyle={styles.postsContainer}
          scrollEnabled={false}
          nestedScrollEnabled={false}
        />

        <Modal
          visible={postModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setPostModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Post</Text>
              {newPost.image ? (
                <Image source={{ uri: newPost.image }} style={styles.previewImage} />
              ) : (
                <TouchableOpacity
                  style={styles.button}
                  onPress={pickImage}
                >
                  <Text style={styles.buttonText}>Pick Image</Text>
                </TouchableOpacity>
              )}
              <TextInput
                placeholder="Title"
                style={styles.input}
                value={newPost.title}
                onChangeText={(text) => setNewPost({ ...newPost, title: text })}
              />
              <TextInput
                placeholder="Body"
                style={styles.input}
                multiline
                value={newPost.body}
                onChangeText={(text) => setNewPost({ ...newPost, body: text })}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreatePost}
              >
                <Text style={styles.buttonText}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setPostModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={eventModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEventModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Event</Text>
              <TextInput
                placeholder="Event Title"
                style={styles.input}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              />
              <TextInput
                placeholder="Event Description"
                style={styles.input}
                multiline
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
              />
              <TextInput
                placeholder="Event Date (YYYY-MM-DD)"
                style={styles.input}
                value={newEvent.date}
                onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateEvent}
              >
                <Text style={styles.buttonText}>Add Event</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEventModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F9F9",
  },
  previewImage: {
    width: "100%",
    height: 150,
    marginBottom: 10,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#2A3663",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  headerDetails: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  role: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A3663",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionText: {
    color: "#FFF",
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  postsContainer: {
    alignItems: "center",
    width: "100%",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    margin: 10,
    width: "100%",
  },
  cardImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  cardBody: {
    fontSize: 14,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SeniorDash;