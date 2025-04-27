import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './index.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Using a relative URL which will be proxied through the React development server
  console.log(process.env.NODE_ENV)
  const API_URL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_API_URL // This works with local proxy
  : process.env.REACT_APP_API_URL;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    console.log("Messages updated:", messages);
  }, [messages]);

  const handleSend = async () => {
    console.log("here")
    if (input.trim() === '') return;
    
    console.log("Send button clicked with input:", input);
    
    const userMessage = {
      text: input,
      sender: 'user'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    console.log("Set loading state to true");
    
    try {
      console.log("Preparing to send API request with query:", input);
      
      // Create the request payload with "query" key
      const requestPayload = {
        query: input
      };
      
      console.log("Request payload:", requestPayload, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
      console.log("Sending request to:", API_URL);
      
      // Simplified axios call using the proxy
      const response = await axios.post(API_URL, requestPayload);
      
      console.log("API response received:", response, response.data);
      
      // Extract the response using "res" as the key
      if (response.data && response.data.res) {
        console.log("Found response with 'res' key:", response.data.res);
        
        const botMessage = {
          text: response.data.res,
          sender: 'bot',
          isFormatted: true
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
        console.log("Bot message added to chat");
      } else {
        console.error("Response doesn't contain expected 'res' key:", response.data);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("API call failed with error:", error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      
      const errorMessage = {
        text: `Sorry, there was an error processing your request. Details: ${error.message}`,
        sender: 'bot',
        isFormatted: false
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      console.log("Error message added to chat");
    } finally {
      setIsLoading(false);
      console.log("Set loading state to false");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log("Enter key pressed");
      handleSend();
    }
  };

  // Render message content based on whether it's formatted or plain text
  const renderMessageContent = (message) => {
    console.log("Rendering message:", message);
    if (message.sender === 'bot' && message.isFormatted) {
      try {
        // Use className through components for ReactMarkdown
        return (
          <div className="markdown-content">
            <ReactMarkdown>
              {message.text}
            </ReactMarkdown>
          </div>
        );
      } catch (error) {
        console.error("Failed to render markdown:", error);
        return message.text;
      }
    }
    return message.text;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Your Friendly Insurance Adviser</h1>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => {
          console.log(`Rendering message ${index}:`, message);
          return (
            <div 
              key={index} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-bubble">
                {renderMessageContent(message)}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="message bot-message">
            <div className="message-bubble loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || input.trim() === ''}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;