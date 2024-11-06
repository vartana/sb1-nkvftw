import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client/edge';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = join(__dirname, '../uploads');
    fs.mkdir(path, { recursive: true }).then(() => cb(null, path));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// User routes
app.get('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { email, name, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Purchase Order routes
app.get('/api/purchase-orders', authenticateToken, async (req, res) => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        files: true,
      },
    });
    res.json(purchaseOrders);
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/purchase-orders', authenticateToken, async (req, res) => {
  const { recipientEmail } = req.body;

  try {
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        recipientEmail,
        uniqueLink: crypto.randomUUID(),
      },
    });
    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/purchase-orders/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
    });
    res.json(purchaseOrder);
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post(
  '/api/purchase-orders/:id/files',
  upload.fields([
    { name: 'ato', maxCount: 1 },
    { name: 'tpt', maxCount: 1 },
    { name: 'w9', maxCount: 1 },
    { name: 'form5000a', maxCount: 1 },
  ]),
  async (req, res) => {
    const { id } = req.params;
    const files = req.files;

    try {
      const filePromises = Object.entries(files).map(([type, [file]]) =>
        prisma.file.create({
          data: {
            type,
            filename: file.originalname,
            path: file.path,
            purchaseOrderId: id,
          },
        })
      );

      await Promise.all(filePromises);
      res.status(201).json({ message: 'Files uploaded successfully' });
    } catch (error) {
      console.error('Upload files error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Initialize database and start server
async function startServer() {
  try {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();