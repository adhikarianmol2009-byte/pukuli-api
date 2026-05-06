export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const validKeys = ['note_bbg','note_bbb','photos','videos','future','events'];

    if (request.method === 'GET' && url.pathname === '/api/get') {
      const key = url.searchParams.get('key');
      if (!validKeys.includes(key)) return new Response('bad key', { status: 400, headers: cors });
      const value = await env.PUKULI_KV.get(key, { cacheTtl: 1 });
      return new Response(JSON.stringify({ value: value ? JSON.parse(value) : null }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    if (request.method === 'GET' && url.pathname === '/api/all') {
      const out = {};
      for (const key of validKeys) {
        const v = await env.PUKULI_KV.get(key, { cacheTtl: 1 });
        out[key] = v ? JSON.parse(v) : null;
      }
      return new Response(JSON.stringify(out), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    if (request.method === 'POST' && url.pathname === '/api/set') {
      const body = await request.json();
      if (!validKeys.includes(body.key)) return new Response('bad key', { status: 400, headers: cors });
      await env.PUKULI_KV.put(body.key, JSON.stringify(body.value));
      return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    return new Response('not found', { status: 404, headers: cors });
  }
};
