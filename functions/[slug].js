export async function onRequestGet(context) {
  const { params, env } = context;
  const slug = params.slug;

  const target = await env.LINKS.get(slug);

  if (target) {
    return Response.redirect(target, 302);
  }

  // não é um link curto conhecido — deixa passar pro arquivo estático
  // correspondente (ou pro 404 padrão do site, se não existir nada)
  return context.next();
}
