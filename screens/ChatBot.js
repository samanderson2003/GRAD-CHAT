import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';

const ChatWithAI = () => {
  const [messages, setMessages] = useState([]); // Chat history
  const [userInput, setUserInput] = useState(''); // User's current input
  const [isLoading, setIsLoading] = useState(false);

  const sendMessageToAI = async () => {
    if (!userInput.trim()) return; // Prevent sending empty messages

    const userMessage = {
      role: 'user',
      content: userInput.trim(),
    };

    // Add user message to chat history
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userInput.trim() }]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4', // or 'gpt-4' based on your subscription
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful mentor chatbot designed to bridge the gap between college juniors and seniors. Provide guidance on topics like placement strategies, study tips, event management, and skill development.',
            },
            ...messages.map((msg) => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text,
            })),
            userMessage,
          ],
          max_tokens: 200, // Adjust based on your needs
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer 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`, // Replace with your OpenAI API key
          },
        }
      );

      const aiMessage = response.data.choices[0].message.content;

      // Add AI response to chat history
      setMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: aiMessage }]);
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: 'Sorry, there was an error processing your request. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={userInput}
          onChangeText={setUserInput}
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.disabledButton]}
          onPress={sendMessageToAI}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>{isLoading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  chatContainer: {
    padding: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: '75%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#333333',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A3663',
  },
  messageText: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#2A3663',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatWithAI;