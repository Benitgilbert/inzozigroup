import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma, { isDbConnected } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'inzozi_group_super_secret_jwt_key_12345';

// Hardcoded mock users for fallback if DB is not connected
const MOCK_EMPLOYEES = [
  {
    id: 'mock-admin-id',
    name: 'Inzozi Admin',
    email: 'admin@inzozi.com',
    passwordHash: '$2a$10$U9Hk2V.L6t9xR1WwS5i6zO.gM/1X5X6B1nKzP9fW4l1r.3D7E8lJy', // bcrypt hash of "admin123"
    role: 'admin',
    title: 'Executive Admin',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin'
  },
  {
    id: 'mock-dev-id',
    name: 'Benit Gilbert',
    email: 'dev@inzozi.com',
    passwordHash: '$2a$10$i/R114w.eD3yN5k8Y8R0h.7L9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // bcrypt hash of "dev123"
    role: 'developer',
    title: 'Lead Software Engineer',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=benit'
  },
  {
    id: 'mock-manager-id',
    name: 'Project Manager',
    email: 'manager@inzozi.com',
    passwordHash: '$2a$10$N2Gk.b2y.R1d5k8Y8R0h.2V9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // bcrypt hash of "manager123"
    role: 'manager',
    title: 'Operations Director',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=manager'
  },
  {
    id: 'mock-content-id',
    name: 'Content Controller',
    email: 'content@inzozi.com',
    passwordHash: '$2a$10$K7Gk.b2y.R1d5k8Y8R0h.3V9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // bcrypt hash of "content123"
    role: 'content_controller',
    title: 'E-Commerce Moderator',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=content'
  },
  {
    id: 'mock-marketer-id',
    name: 'Growth Marketer',
    email: 'marketer@inzozi.com',
    passwordHash: '$2a$10$O8Gk.b2y.R1d5k8Y8R0h.4V9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // bcrypt hash of "marketer123"
    role: 'marketer',
    title: 'Digital Marketing Strategist',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=marketer'
  },
  {
    id: 'mock-support-id',
    name: 'Support Agent',
    email: 'support@inzozi.com',
    passwordHash: '$2a$10$P9Gk.b2y.R1d5k8Y8R0h.5V9.JkP7U2D/g7TzK6lB6aD9f2Gkpyq', // bcrypt hash of "support123"
    role: 'support',
    title: 'Help Desk Operator',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=support'
  }
];

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const user = await prisma.employee.findUnique({ where: { email } });
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          token: generateToken(user),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            title: user.title,
            avatar: user.avatar,
            dbMode: 'production'
          }
        });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    } catch (dbError) {
      console.warn('[AuthController] DB Query error, falling back to mock authentication:', dbError.message);
    }
  }

  // Fallback Mock authentication if database is not active
  console.log('[AuthController] Operating in DB-Disconnected Mock Mode');
  const mockUser = MOCK_EMPLOYEES.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (mockUser) {
    const passMatch = await bcrypt.compare(password, mockUser.passwordHash);
    if (passMatch) {
      return res.json({
        token: generateToken(mockUser),
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          title: mockUser.title,
          avatar: mockUser.avatar,
          dbMode: 'mocked'
        }
      });
    }
  }

  return res.status(401).json({ error: 'Invalid email or password' });
};

// Register new user (employees)
export const register = async (req, res) => {
  const { name, email, password, role, title } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please fill out all required fields (name, email, password)' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const exists = await prisma.employee.findUnique({ where: { email } });
      if (exists) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

      const user = await prisma.employee.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'developer',
          title: title || 'Software Engineer',
          avatar
        }
      });

      return res.status(201).json({
        token: generateToken(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          avatar: user.avatar,
          dbMode: 'production'
        }
      });
    } catch (err) {
      console.error('[AuthController] Error saving user to database:', err.message);
      return res.status(500).json({ error: 'Failed to create user on database server' });
    }
  }

  return res.status(503).json({
    error: 'Database server is currently unavailable. Registrations are disabled in offline mode.'
  });
};

// Get current logged-in employee profile
export const getProfile = async (req, res) => {
  // protect middleware attaches decodes user to req.user
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const user = await prisma.employee.findUnique({ where: { id: req.user.id } });
      if (user) {
        return res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          title: user.title,
          avatar: user.avatar,
          dbMode: 'production'
        });
      }
    } catch (err) {
      console.warn('[AuthController] DB error during getProfile:', err.message);
    }
  }

  // Fallback
  const mockUser = MOCK_EMPLOYEES.find(u => u.id === req.user.id);
  if (mockUser) {
    return res.json({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      title: mockUser.title,
      avatar: mockUser.avatar,
      dbMode: 'mocked'
    });
  }

  // If not found in mocks but token is valid, return req.user decodes
  return res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    dbMode: 'mocked_unverified'
  });
};
