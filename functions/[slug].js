export async function onRequestGet(context) {
  const { params, env } = context;
  const slug = params.slug;

  const target = await env.LINKS.get(slug);
  if (!target) {
    return new Response('Link não encontrado.', { status: 404 });
  }

  return Response.redirect(target, 302);
}
