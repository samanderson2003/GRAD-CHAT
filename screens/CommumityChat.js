import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import {
    collection,
    getDoc,
    addDoc,
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    query,
    orderBy,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { format, isToday } from "date-fns";
import * as ImageManipulator from "expo-image-manipulator";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebaseConfig";
import { Ionicons } from "@expo/vector-icons";


const CommunityChat = () => {

    const [chat, setChat] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    

    const user = auth.currentUser;

    useEffect(() => {
        const chatQuery = query(
            collection(db, "CommunityChat"),
            orderBy("timestamp", "desc")
        );
        const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
            const messages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                likes: doc.data().likes || 0,
                replies: doc.data().replies || [],
            }));
            setChat(messages);
        });
        return unsubscribe;
    }, []);

    const handleSendMessage = async () => {
        if (!message.trim() && !imagePreview) {
            Alert.alert("Error", "Message or image cannot be empty.");
            return;
        }
    
        setUploading(true);
    
        try {
            if (!user) {
                Alert.alert("Error", "User not authenticated.");
                setUploading(false);
                return;
            }
    
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            const userName = userDoc.exists()
                ? userDoc.data().name || "Anonymous"
                : "Anonymous";
    
            const replyData = {
                id: Date.now().toString(), // Unique ID for the reply
                userName,
                message,
                imageUrl: null,
                timestamp: new Date(),
            };
    
            if (imagePreview) {
                const compressedImage = await ImageManipulator.manipulateAsync(
                    imagePreview,
                    [{ resize: { width: 800 } }],
                    { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
                );
                const imageName = `images/${Date.now()}_${user.uid}.jpg`;
                const imageRef = ref(storage, imageName);
                const imgResponse = await fetch(compressedImage.uri);
                const imgBlob = await imgResponse.blob();
    
                await uploadBytes(imageRef, imgBlob);
                const downloadUrl = await getDownloadURL(imageRef);
                replyData.imageUrl = downloadUrl;
            }
    
            if (replyingTo) {
                // Add to parent message's replies array
                const parentDocRef = doc(db, "CommunityChat", replyingTo.id);
                const parentDoc = await getDoc(parentDocRef);
    
                if (parentDoc.exists()) {
                    const currentReplies = parentDoc.data().replies || [];
                    await updateDoc(parentDocRef, {
                        replies: [...currentReplies, replyData],
                    });
                }
            } else {
                // Create a new message in CommunityChat
                const messageData = {
                    message,
                    userId: user.uid,
                    userName,
                    timestamp: serverTimestamp(),
                    likes: 0,
                    replies: [],
                };
    
                if (replyData.imageUrl) {
                    messageData.imageUrl = replyData.imageUrl;
                }
    
                await addDoc(collection(db, "CommunityChat"), messageData);
            }
    
            setMessage("");
            setImagePreview(null);
            setReplyingTo(null);
            setModalVisible(false);
            Keyboard.dismiss();
        } catch (error) {
            console.error("Error sending message:", error);
            Alert.alert("Error", `Failed to send message: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleLike = async (messageId) => {
        try {
            // Ensure user is authenticated
            if (!user) {
                Alert.alert("Error", "You must be logged in to like a message.");
                return;
            }
    
            const messageRef = doc(db, "CommunityChat", messageId);
            const messageDoc = await getDoc(messageRef);
    
            // Check if the message exists
            if (!messageDoc.exists()) {
                Alert.alert("Error", "Message not found.");
                return;
            }
    
            const messageData = messageDoc.data();
            const currentLikes = messageData.likes || 0;
            const likedUsers = messageData.likedUsers || [];
    
            // Check if user has already liked the message
            if (likedUsers.includes(user.uid)) {
                Alert.alert("Oops", "You have already liked this message.");
                return;
            }
    
            // Update the document with new like count and liked users
            await updateDoc(messageRef, {
                likes: currentLikes + 1,
                likedUsers: [...likedUsers, user.uid]
            });
    
        } catch (error) {
            console.error("Error liking message:", error);
            Alert.alert("Error", "Failed to like the message. Please try again.");
        }
    };

    const handleImageUpload = async () => {
        try {
            const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!granted) {
                Alert.alert(
                    "Permission Denied",
                    "You need to grant permissions to access the library."
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 0.2,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setImagePreview(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Image Picker Error:", error);
            Alert.alert("Error", "Failed to open image picker.");
        }
    };

    const renderMessage = ({ item }) => (
        <View style={styles.messageContainer}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.timestamp}>
                {item.timestamp
                    ? isToday(new Date(item.timestamp?.toMillis()))
                        ? `Today at ${format(
                              new Date(item.timestamp.toMillis()),
                              "h:mm a"
                          )}`
                        : format(
                              new Date(item.timestamp.toMillis()),
                              "MMM d, yyyy 'at' h:mm a"
                          )
                    : "Just now"}
            </Text>
            {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
            )}
            {item.message && <Text style={styles.message}>{item.message}</Text>}

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={styles.likeButton}
                    onPress={() => handleLike(item.id)}
                >
                    <Ionicons name="heart-outline" size={20} color="#2A3663" />
                    <Text style={styles.likeCount}>{item.likes || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => {
                        setReplyingTo(item);
                        setModalVisible(true);
                    }}
                >
                    <Ionicons name="chatbubble-outline" size={20} color="#2A3663" />
                    <Text style={styles.replyCount}>
                        {item.replies ? item.replies.length : 0}
                    </Text>
                </TouchableOpacity>
            </View>

            {item.replies &&
                item.replies.map((reply, index) => (
                    <View key={index} style={styles.replyContainer}>
                        <Text style={styles.replyUserName}>{reply.userName}</Text>
                        <Text style={styles.replyMessage}>{reply.message}</Text>
                        {reply.imageUrl && (
                            <Image
                                source={{ uri: reply.imageUrl }}
                                style={styles.replyImage}
                            />
                        )}
                    </View>
                ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* <Text style={styles.sectionTitle}>Commumity Chat</Text> */}
            <FlatList
                data={chat}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
            />

            <TouchableOpacity 
                style={styles.fabButton}
                onPress={() => {
                    setReplyingTo(null);
                    setModalVisible(true);
                }}
            >
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    setImagePreview(null);
                }}
            >
            <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.modalContainer}>
                    {replyingTo && (
                        <View style={styles.replyHeader}>
                            <Text style={styles.replyHeaderText}>
                                Replying to {replyingTo.userName}
                            </Text>
                            <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                <Ionicons name="close" size={24} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                <TouchableOpacity 
                style={styles.closeModalButton}
                onPress={() => {
                    setModalVisible(false);
                    setImagePreview(null);
                    setMessage("");
                }}
                >
                <Text style={styles.closeModalButtonText}>Cancel</Text>
                </TouchableOpacity>
                    <TextInput
                        style={styles.messageInput}
                        placeholder="Type your message..."
                        placeholderTextColor="#cccccc"
                        multiline
                        value={message}
                        onChangeText={setMessage}
                        editable={!uploading}
                    />
                        {imagePreview && (
                            <View style={styles.previewContainer}>
                                <Image 
                                    source={{ uri: imagePreview }} 
                                    style={styles.imagePreview} 
                                />
                                <TouchableOpacity 
                                    style={styles.removeImageButton}
                                    onPress={() => setImagePreview(null)}
                                >
                                    <Ionicons name="close" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={styles.imagePickerButton}
                                onPress={handleImageUpload}
                                disabled={uploading}
                            >
                                <Ionicons name="image-outline" size={24} color="#2A3663" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    (uploading || (!message.trim() && !imagePreview)) && styles.disabledButton
                                ]}
                                onPress={handleSendMessage}
                                disabled={uploading || (!message.trim() && !imagePreview)}
                            >
                                <Ionicons name="send" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    </TouchableWithoutFeedback>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6f7',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginTop: 60,
        marginBottom: 8,
        marginHorizontal: 10,
    },
    messageContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    userName: {
        fontWeight: 'bold',
    },
    timestamp: {
        color: '#888',
        fontSize: 12,
    },
    message: {
        marginVertical: 5,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 5,
        marginVertical: 5,
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    likeCount: {
        marginLeft: 5,
        color: '#2A3663',
    },
    replyButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    replyCount: {
        marginLeft: 5,
        color: '#2A3663',
    },
    replyContainer: {
        marginLeft: 20,
        marginTop: 5,
        padding: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    replyUserName: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    replyMessage: {
        fontSize: 12,
    },
    replyImage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginTop: 5,
    },
    fabButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2A3663',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        width: "100%", 
        height: "100%"
    },
    modalContainer: {
        backgroundColor: '#f5f6f7',
        paddingTop: 60,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        flex: 1,
    },
    replyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    replyHeaderText: {
        fontWeight: 'bold',
        color: '#2A3663',
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        minHeight: 100,
        maxHeight: 200,
        textAlignVertical: 'top',
    },
    previewContainer: {
        position: 'relative',
        marginTop: 10,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    imagePickerButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 25,
    },
    sendButton: {
        backgroundColor: '#2A3663',
        padding: 10,
        borderRadius: 25,
    },
    disabledButton: {
        opacity: 0.5,
    },
    closeModalButtonText: {
        textAlign: "right",
        color: '#2A3663',
        fontWeight: 'bold',
        marginBottom: 30, 
        marginHorizontal: 10
    },
});

export default CommunityChat;