export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&ime=transliteration_en_mr&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=jsapi`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`);
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Transliteration proxy error:', error);
    return res.status(500).json({ error: 'Failed to transliterate text' });
  }
}
