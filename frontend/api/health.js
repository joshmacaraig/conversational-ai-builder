// 🏥 Health Check Proxy - Vercel API Route
// This proxies requests to Railway backend to bypass CORS issues

const RAILWAY_BACKEND_URL = 'https://conversaai-backend.railway.app';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Proxying health check to Railway backend...');
    
    // Make server-to-server request to Railway (no CORS issues)
    const response = await fetch(`${RAILWAY_BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0'
      }
    });

    const data = await response.json();
    
    console.log('✅ Railway health check successful:', response.status);
    
    // Set CORS headers for frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return Railway's response to frontend
    return res.status(response.status).json({
      ...data,
      proxy: 'vercel',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Health check proxy error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Backend health check failed',
      message: error.message,
      proxy: 'vercel',
      timestamp: new Date().toISOString()
    });
  }
}
