import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5001/api/users/login', {
        username,
        password,
      });

      const userData = response.data?.user;
      const token = response.data?.token;

      if (userData && token) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);

        // Log the username to the console
        console.log('Logged in user:', userData.username);

        navigate('/home');
      } else {
        setErrorMessage('No user data received');
      }
    } catch (error) {
      setErrorMessage(error.response?.data.message || 'An error occurred.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Login</h2>
      {errorMessage && <div style={styles.error}>{errorMessage}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
      <div style={styles.registerContainer}>
        <p style={styles.registerText}>
          Don't have an account? <a href="/register" style={styles.registerLink}>Register here</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '400px', margin: 'auto', padding: '20px', backgroundColor: '#F9FAFB', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' },
  header: { color: '#1F2937', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column' },
  input: { marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #E5E7EB', fontSize: '16px', color: '#1F2937' },
  button: { padding: '12px', backgroundColor: '#4F46E5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' },
  error: { color: '#F97316', textAlign: 'center', marginBottom: '10px' },
  registerContainer: { textAlign: 'center', marginTop: '10px' },
  registerText: { color: '#6B7280', fontSize: '14px' },
  registerLink: { color: '#4F46E5', textDecoration: 'none' },
};

export default Login;
