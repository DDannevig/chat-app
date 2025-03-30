import React, { useState, useEffect } from 'react';

const Chat = () => {
  // State variables
  const [messages, setMessages] = useState([]); // Array to store messages
  const [message, setMessage] = useState(''); // Current message input value
  const [username, setUsername] = useState(''); // Username (optional)
  const [socket, setSocket] = useState(null); // WebSocket instance
  const [isConnected, setIsConnected] = useState(false); // Connection status

  // Establish WebSocket connection when component mounts
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const apiUrl = 'localhost:3001'
    const webSocketUrl = 'ws://' + apiUrl + '/cable?authorization=' + authToken

    // Create a WebSocket connection
    const newSocket = new WebSocket(webSocketUrl);

    newSocket.onopen = () => {
      console.log('Connected to Chat API');
      setIsConnected(true);

      newSocket.send(JSON.stringify(subscribePrivateChannel()));
    };

    newSocket.onclose = () => {
      console.log('Disconnected from Chat API');
      setIsConnected(false);

      window.location.href = '/login';
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    // Listen for incoming messages
    newSocket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);
      console.log(incomingMessage)
      if (incomingMessage['type'] == 'message') {
       setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      }
    };

    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      newSocket.close();
    };
  }, []);

  // Function to send a message
  const sendMessage = (e) => {
    e.preventDefault();

    if (!message) {
      return; // Don't send empty messages
    }

    const newMessage = {
      username,
      content: message,
      timestamp: new Date().toISOString(),
    };

    // Send the message as JSON via WebSocket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(newMessage));
      setMessage(''); // Clear the input field after sending
    } else {
      console.error('WebSocket connection is not open');
    }
  };

  const subscribePrivateChannel = () => {
    return {
      command: 'subscribe',
      identifier: JSON.stringify({
        channel: 'PrivateChannel',
        channel_name: ('user_id_' + localStorage.getItem('userId'))
      })
    };
  };

  return (
    <div className="chat-container">
      <h2>Chat</h2>
      {!isConnected && <p>Connecting to server...</p>}

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span className="username">{msg.username}</span>: <span className="content">{msg.content}</span>
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="chat-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;
