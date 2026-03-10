export async function onRequestGet(context) {
  const { params, env } = context;

  const object = await env.MEDIA_BUCKET.get(params.key);

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}
