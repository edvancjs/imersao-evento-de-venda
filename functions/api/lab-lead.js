// Recebe o cadastro da landing /laboratorio e registra no Never Lose Sales (formulário nativo
// "LAB | Cadastro Laboratório de Vendas" → tag + pipeline "Laboratório de Vendas | Out/26", etapa Cadastrou).
// Roda no servidor porque a API do Never Lose não libera CORS para o navegador.
const ORG = '1bbd9301-f824-41c7-8964-cd4d41a0cfa9';
const SLUG = 'lab-cadastro-laboratorio-de-vendas';
const BASE = `https://serviconeverlose.space/api/public/forms/${ORG}/${SLUG}`;
const Q = {
  nome: 'd8994f0a-61b4-4154-b0e9-577ca903f8c5',
  email: 'da659f2c-b2eb-4696-86ed-8fb1384af682',
  wpp: 'bd5331a4-6f72-4b6d-bae5-567e9eab6553',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

async function nls(path, body) {
  const r = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`NLS ${path} ${r.status}`);
  return r.json();
}

export async function onRequestPost({ request }) {
  try {
    const d = await request.json();
    const nome = String(d.nome || '').trim().slice(0, 120);
    const email = String(d.email || '').trim().slice(0, 160);
    let tel = String(d.telefone || '').replace(/\D/g, '');
    if (nome.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || tel.length < 10) {
      return json({ ok: false, erro: 'dados inválidos' }, 400);
    }
    if (!(tel.startsWith('55') && tel.length >= 12)) tel = '55' + tel;
    const utm = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
      if (d[k]) utm[k] = String(d[k]).slice(0, 120);
    }
    const sub = await nls('/start', { metadata: { origem: 'landing-laboratorio', ...utm } });
    await nls(`/submissions/${sub.id}/answers`, {
      answers: [
        { questionId: Q.nome, value: nome },
        { questionId: Q.email, value: email },
        { questionId: Q.wpp, value: tel },
      ],
    });
    await nls(`/submissions/${sub.id}/complete`, {});
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, erro: String(e.message || e) }, 502);
  }
}
