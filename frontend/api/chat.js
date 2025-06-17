// 💬 Chat Proxy - Vercel API Route
// This proxies chat requests to Railway backend to bypass CORS issues

const RAILWAY_BACKEND_URL = 'https://conversaai-backend.railway.app';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🔄 Proxying chat request to Railway backend...');
    
    // Make server-to-server request to Railway (no CORS issues)
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0'
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    
    console.log('✅ Railway chat request successful:', response.status);
    
    // Set CORS headers for frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Return Railway's response to frontend
    return res.status(response.status).json({
      ...data,
      proxy: 'vercel',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat proxy error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Backend chat request failed',
      message: error.message,
      proxy: 'vercel',
      timestamp: new Date().toISOString()
    });
  }
}
