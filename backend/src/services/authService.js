import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';

export const login = async (username, password) => {
  try {
    // Find user by username
    const [users] = await pool.execute(
      'SELECT id, username, password_hash, email, full_name, role FROM users WHERE username = ? AND is_deleted = 0',
      [username]
    );

    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    // TODO: REQUIRED INFO HERE (fill this in): Ensure JWT_SECRET and JWT_EXPIRES_IN are set in .env
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    };
  } catch (error) {
    throw error;
  }
};

export const register = async (username, password, email, fullName, role) => {
  try {
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await pool.execute(
      'INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, passwordHash, email, fullName, role]
    );

    return {
      id: result.insertId,
      username,
      email,
      fullName,
      role
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('Username already exists');
    }
    throw error;
  }
};

export const getCurrentUser = async (userId) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, full_name, role FROM users WHERE id = ? AND is_deleted = 0',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    };
  } catch (error) {
    throw error;
  }
};
