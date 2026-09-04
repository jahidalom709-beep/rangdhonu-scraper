export default async function handler(req, res) {
  // ইউআরএল থেকে পাথ নেওয়া
  const path = req.url.replace('/api/stream', '');
  const targetUrl = 'http://103.151.60.188:12345' + path;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'X-Local-IP': '192.168.1.WEB_nn4i',
        'Referer': 'http://103.151.60.188:12345/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10)'
      }
    });

    const data = await response.arrayBuffer();
    
    // CORS এবং সঠিক হেডার সেটিং
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/x-mpegURL');
    
    res.status(response.status).send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
