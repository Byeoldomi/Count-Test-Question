export default async function handler(req, res) {
  // CORS 설정 (프론트엔드에서 API 호출 허용)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Notion-Version'
  );

  // OPTIONS(Preflight) 요청에 대한 빠른 응답
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { dbId, nextCursor } = req.body;
  const apiKey = req.headers.authorization;

  if (!apiKey || !dbId) {
    return res.status(400).json({ error: 'Missing API Key or Database ID' });
  }

  try {
    const body = nextCursor ? { start_cursor: nextCursor } : {};
    
    // Vercel 서버에서 Notion API로 직접 요청 (CORS 제약 없음)
    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
