import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/api/v1/users/sessions', {
        email,
        password,
      });

      console.log('Login successful:', response.data);

      // Optionally: Store the token or user data (e.g., in localStorage or context)
      localStorage.setItem('authToken', response.data.token);

      // Redirect to dashboard or homepage
      window.location.href = '/chat';

    } catch (error) {
      console.error('Error:', error.response || error);
      setError(error.response?.data?.message || 'Login failed! Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        Need an account? <Link to="/registration">Registration</Link>
      </p>

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
