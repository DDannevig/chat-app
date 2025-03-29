import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Registration from './Registration';
import Chat from './Chat';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Login Route */}
          <Route path="/login" element={<Login />} /> {/* Login Route */}
          <Route path="/registration" element={<Registration />} /> {/* Registration Route */}
          <Route path="/chat" element={<Chat />} /> {/* Registration Route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
