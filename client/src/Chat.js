import { useState, useEffect } from 'react';
import { webSocketUrl } from './ApiClient';
import wsClient from './wsClient';
import './styles/chat.css';


const Chat = () => {
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [publicChannels, setPublicChannels] = useState([]);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [messagesByChannel, setMessagesByChannel] = useState({});
  const [currentChannel, setCurrentChannel] = useState('');

  useEffect(() => {
    console.log('Starting connection');
    const tokenUrl = webSocketUrl + localStorage.getItem('authToken');
    wsClient.init(tokenUrl);

    const handleOpen = () => {
      console.log('Connected to Chat API');
      setIsConnected(true);

      console.log('Subscribing to Private Channel');
      try { wsClient.send(JSON.stringify(subscribePrivateChannel())); } catch (e) {}
      console.log('Retrieving Public Channels');
      try { wsClient.send(JSON.stringify(retrievePublicChannels())); } catch (e) {}
    };

    const handleClose = () => {
      console.log('Disconnected from Chat API');
      setIsConnected(false);
      window.location.href = '/login';
    };

    const handleError = (error) => {
      console.error('WebSocket Error:', error);
    };

    const handleMessage = (event) => {
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
        case 'confirm_subscription': {
          const identifier = JSON.parse(incomingMessage['identifier'] || '{}');
          if (identifier['channel'] === 'PublicChannel') {
            const channelKey = identifier['channel_name'];
            setSubscribedChannels((prev) => (prev.includes(channelKey) ? prev : [...prev, channelKey]));
            setMessagesByChannel((prev) => (prev[channelKey] ? prev : { ...prev, [channelKey]: [] }));
            setCurrentChannel((prev) => prev || channelKey);
          }
          break;
        }
        case 'public_channels': {
          const channels = incomingMessage['public_channels'] || [];
          setPublicChannels(channels);
          setMessagesByChannel((prev) => {
            const next = { ...prev };
            channels.forEach((channel) => {
              if (!next[channel.key]) {
                next[channel.key] = [];
              }
            });
            return next;
          });
          break;
        }
        default:
          const identifier = JSON.parse(incomingMessage['identifier'] || '{}');
          switch(identifier['channel']){
            case 'PrivateChannel':
              break;
            case 'PublicChannel': {
              const messagePayload = incomingMessage['message'] || {};
              if (messagePayload['type'] === 'message') {
                const channelKey = identifier['channel_name'];
                setMessagesByChannel((prev) => {
                  const next = { ...prev };
                  next[channelKey] = [...(next[channelKey] || []), messagePayload];
                  return next;
                });
              }
              break;
            }
          }
          break;
      }
    };

    wsClient.addListener('open', handleOpen);
    wsClient.addListener('close', handleClose);
    wsClient.addListener('error', handleError);
    wsClient.addListener('message', handleMessage);

    if (wsClient.readyState() === WebSocket.OPEN) handleOpen();

    return () => {
      wsClient.removeListener('open', handleOpen);
      wsClient.removeListener('close', handleClose);
      wsClient.removeListener('error', handleError);
      wsClient.removeListener('message', handleMessage);
    };
  }, []);

  // Function to send a message
  const sendMessage = (e) => {
    e.preventDefault();

    if (!message) {
      return; // Don't send empty messages
    }

    if (!currentChannel) {
      return;
    }

    const newMessage = {
      action: 'send_public_message',
      key: currentChannel,
      message,
    };

    if (wsClient.readyState && wsClient.readyState() === WebSocket.OPEN) {
      wsClient.send(JSON.stringify(newMessage));
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

  const subscribeChannel = (channelKey) => {
    if (wsClient.readyState && wsClient.readyState() === WebSocket.OPEN) {
      wsClient.send(JSON.stringify(subscribePublicChannel(channelKey)));
    } else {
      console.error('WebSocket not open yet');
    }

    setSubscribedChannels((prev) => (prev.includes(channelKey) ? prev : [...prev, channelKey]));
    setMessagesByChannel((prev) => (prev[channelKey] ? prev : { ...prev, [channelKey]: [] }));
    setCurrentChannel((prev) => prev || channelKey);
  };

  const handleChannelCheckboxChange = (channelKey, checked) => {
    if (checked) {
      subscribeChannel(channelKey);
      setCurrentChannel(channelKey);
      return;
    }

    setSubscribedChannels((prev) => {
      const next = prev.filter((key) => key !== channelKey);
      setCurrentChannel((current) => {
        if (current !== channelKey) {
          return current;
        }
        return next[0] || '';
      });
      return next;
    });
  };

  const handleDisconnect = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    try { wsClient.close(); } catch (e) {}
    window.location.href = '/login';
  };


  return (
    <div className="chat-overview"> 
      <div className="channel-finder">
        <ul className="dropdown-menu">
          {publicChannels.map((channel) => (
            <li key={channel.key} className="dropdown-item">
              <label>
                <input
                  type="checkbox"
                  checked={subscribedChannels.includes(channel.key)}
                  onChange={(e) => handleChannelCheckboxChange(channel.key, e.target.checked)}
                />
                {channel.key}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-container">
        <div className="chat-header">
          <h2>Chat</h2>
          <button className="disconnect-button" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
        {!isConnected && <p>Connecting to server...</p>}

        <div className="tabs">
          {subscribedChannels.map((channelKey) => (
            <button
              key={channelKey}
              className={`tab-button ${currentChannel === channelKey ? 'active' : ''}`}
              onClick={() => setCurrentChannel(channelKey)}
            >
              {channelKey}
            </button>
          ))}
        </div>

        <div className="messages">
          {(messagesByChannel[currentChannel] || []).map((msg, index) => (
            <div key={index} className="message">
              <span className="username">{msg['user']}</span>: <span className="content">{msg['message']}</span>
              <span className="timestamp">{msg['created_at'] ? new Date(msg['created_at']).toLocaleTimeString() : ''}</span>
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
