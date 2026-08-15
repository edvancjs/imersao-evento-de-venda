const SLUG_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomSlug(length = 6) {
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return slug;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const { url, password } = body || {};

  if (!env.SHORTENER_SECRET || password !== env.SHORTENER_SECRET) {
    return json({ error: 'Senha incorreta' }, 401);
  }

  if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    return json({ error: 'URL inválida — precisa começar com http:// ou https://' }, 400);
  }

  let slug = '';
  let existing = null;
  let attempts = 0;
  do {
    slug = randomSlug();
    existing = await env.LINKS.get(slug);
    attempts++;
  } while (existing !== null && attempts < 5);

  if (existing !== null) {
    return json({ error: 'Não foi possível gerar um link único, tenta de novo.' }, 500);
  }

  await env.LINKS.put(slug, url);

  const origin = new URL(request.url).origin;
  return json({ slug, shortUrl: `${origin}/${slug}` });
}
