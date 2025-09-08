import React, { useState } from 'react';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const register = useAuthStore();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      alert('Registration successful!');
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>
     
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
