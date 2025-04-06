import React, { useState, useEffect } from 'react';
import { webSocketUrl } from './ApiClient';

const Chat = () => {
  // State variables
  const [publicMessages, setPublicMessages] = useState([]); // Array to store messages
  const [privateMessages, setPrivateMessages] = useState([]); // Array to store messages
  const [message, setMessage] = useState(''); // Current message input value
  const [username, setUsername] = useState(''); // Username
  const [isConnected, setIsConnected] = useState(false); // Connection status
  const [isPublicChannelsOpen, setPublicChannelsOpen] = useState(false);
  const [publicChannels, setPublicChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState('');
  const [webSocket, _setWebSocket] = useState(new WebSocket(webSocketUrl + localStorage.getItem('authToken')));

  const togglePublicChannelsDropdown = () => {
    setPublicChannelsOpen(!isPublicChannelsOpen);
  };

  useEffect(() => { 
    webSocket.onopen = () => {
      console.log('Connected to Chat API');
      setIsConnected(true);

      console.log("Subscribing to Private Channel")
      webSocket.send(JSON.stringify(subscribePrivateChannel()));
      console.log("Retrieving Public Channels")
      webSocket.send(JSON.stringify(retrievePublicChannels()));
    };

    webSocket.onclose = () => {
      console.log('Disconnected from Chat API');
      setIsConnected(false);

      window.location.href = '/login';
    };

    webSocket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    // Listen for incoming messages
    webSocket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);
    // Deberia meter un switch case
    // Si se reciben los grupos publicos -> actualizarlo en el store (solo nombre y id)
    // Si se recibe un mensaje -> se lo suma en el store
    // Si recibe los usuarios del canal -> Mostrarlos en una ventanita nueva. OJO que no estoy tan seguro de esto
      switch(incomingMessage['type']) {
        case 'ping':
          break;
        case 'welcome':
          break;
        case 'confirm_subscription':
          const channelKey = JSON.parse(incomingMessage['identifier'])['channel_name']
          console.log("Current Channel: ", channelKey)
          setCurrentChannel(channelKey);
          break;
        case 'public_channels':
          setPublicChannels(incomingMessage['public_channels'] || []);
          break;
        default:
          const identifier = JSON.parse(incomingMessage['identifier'])
          console.log("DEFAULT")
          console.log("incomingMessage: ", incomingMessage['message'])
          switch(identifier['channel']){
            case 'PrivateChannel':
              console.log("PrivateChannelPrivateChannelPrivateChannel")
              console.log("Code how to recieve private messages please")
              break;
            case 'PublicChannel':
              console.log("Got here")
              console.log("message: ", incomingMessage['message'])
              switch(incomingMessage['message']['type']) {
                case 'welcome':
                  break;
                case 'message':
                  setPublicMessages((publicMessages) => [...publicMessages, incomingMessage['message']]);
                  break;
              }
          }
          break;
      }
    };

    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      webSocket.close();
    };
  }, []);

  // Function to send a message
  const sendMessage = (e) => {
    e.preventDefault();

    if (!message) {
      return; // Don't send empty messages
    }

    const newMessage = {
      action: 'send_public_message',
      key: currentChannel,
      message,
    };

    if (webSocket && webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(newMessage));
      setMessage('');
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

  const subscribePublicChannel = (channel_key) => {
    return {
      command: 'subscribe',
      identifier: JSON.stringify({
        channel: 'PublicChannel',
        channel_name: channel_key
      })
    };
  };

  const retrievePublicChannels = () => {
    return { action: 'retrieve_public_channels' };
  };

  const subscribeChannel = (channel_key) => {
    console.log(channel_key)
    webSocket.send(JSON.stringify(subscribePublicChannel(channel_key)));

    alert(`You selected the ${channel_key} channel!`);
  };


  return (
    <div className="chat-overview"> 
      <div className="channel-finder">
        <button onClick={togglePublicChannelsDropdown} className="dropdown-button">
          Select Option
        </button>
        {isPublicChannelsOpen && (
          <ul className="dropdown-menu">
            {publicChannels.map((channel) => (
            <li key={channel.key} className="dropdown-item">
              <span>{channel.key}</span>
              <button
                className="channel-button"
                onClick={() => subscribeChannel(channel.key)}
              >
                Join
              </button>
            </li>
          ))}
          </ul>
        )}
      </div>
      <div className="chat-container">
        <h2>Chat</h2>
        {!isConnected && <p>Connecting to server...</p>}

        <div className="messages">
          {publicMessages.map((msg, index) => (
            <div key={index} className="message">
              <span className="username">{msg['user']}</span>: <span className="content">{msg['message']}</span>
              <span className="timestamp">{new Date(msg['created_at']).toLocaleTimeString()}</span>
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
    </div>
  );
};

export default Chat;
