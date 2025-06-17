// 🚀 Conversational AI Builder - Backend Server
// Professional Express.js server with OpenAI integration

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Now import other modules that depend on environment variables
import express from 'express';
import cors from 'cors';
import chatRoutes from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 🛡️ Security & CORS Middleware - Production ready with debugging
const allowedOrigins = [
  'https://my-conversaai.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Debug CORS setup
console.log('🔧 CORS Debug Info:');
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL from env:', process.env.FRONTEND_URL);
console.log('Allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    console.log('🌐 CORS Request from origin:', origin);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow all origins for now - we'll restrict later
    console.log('✅ Allowing origin:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Force CORS headers manually (Railway override fix)
app.use((req, res, next) => {
  // Set CORS headers manually to override any Railway defaults
  res.header('Access-Control-Allow-Origin', 'https://my-conversaai.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, X-Requested-With, Accept');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('📨 Handling preflight request for:', req.path);
    return res.status(200).end();
  }
  
  console.log('📤 Manual CORS headers set for:', req.path);
  next();
});

// 📦 Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📊 Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  next();
});

// 🏥 Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Conversational AI Builder API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 🔍 Simple debug endpoint
app.get('/debug', (req, res) => {
  res.json({ 
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    frontendUrl: process.env.FRONTEND_URL,
    hasApiKey: !!process.env.OPENAI_API_KEY
  });
});

// 🔗 API routes
app.use('/api', chatRoutes);

// 🚨 Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: isDevelopment ? error.message : 'Something went wrong',
    ...(isDevelopment && { stack: error.stack })
  });
});

// 🔍 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    suggestion: 'Check the API documentation for available endpoints'
  });
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`
🎉 Conversational AI Builder Backend Started!
📡 Server: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health
🎯 Frontend CORS: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
🕒 Started: ${new Date().toISOString()}
  `);
  
  // Verify critical environment variables
  if (process.env.OPENAI_API_KEY) {
    console.log('✅ OpenAI API key loaded');
  } else {
    console.log('⚠️  Warning: OPENAI_API_KEY not found! Please add it to .env file');
  }
});

export default app;