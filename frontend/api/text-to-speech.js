// 🎵 Text-to-Speech Proxy - Vercel API Route
// This proxies TTS requests to Railway backend to bypass CORS issues

const RAILWAY_BACKEND_URL = 'https://conversaai-backend.railway.app';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('🔄 Proxying TTS request to Railway backend...');
    
    // Make server-to-server request to Railway (no CORS issues)
    const response = await fetch(`${RAILWAY_BACKEND_URL}/api/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Proxy/1.0'
      },
      body: JSON.stringify({ text })
    });

    // TTS returns audio binary data, not JSON
    if (response.ok) {
      const audioBuffer = await response.arrayBuffer();
      
      console.log('✅ Railway TTS request successful:', response.status);
      
      // Set CORS headers for frontend
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Length', audioBuffer.byteLength);
      
      // Return audio data to frontend
      return res.status(200).send(Buffer.from(audioBuffer));
      
    } else {
      // Handle error response
      const errorData = await response.json();
      console.error('❌ Railway TTS error:', errorData);
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(response.status).json({
        ...errorData,
        proxy: 'vercel',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ TTS proxy error:', error);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Backend TTS request failed',
      message: error.message,
      proxy: 'vercel',
      timestamp: new Date().toISOString()
    });
  }
}
