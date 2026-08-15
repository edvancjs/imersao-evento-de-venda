export async function onRequestGet(context) {
  const { params, env } = context;
  const slug = params.slug;

  console.log('DEBUG slug:', JSON.stringify(slug), 'hasLINKS:', !!env.LINKS);
  const target = await env.LINKS.get(slug);
  console.log('DEBUG target:', JSON.stringify(target));

  if (target) {
    return Response.redirect(target, 302);
  }

  // não é um link curto conhecido — deixa passar pro arquivo estático
  // correspondente (ou pro 404 padrão do site, se não existir nada)
  return context.next();
}
