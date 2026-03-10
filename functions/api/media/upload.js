export async function onRequestPost(context) {
  const { request, env } = context;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400
    });
  }

  const filename = Date.now() + "-" + file.name;

  await env.MEDIA_BUCKET.put(filename, file.stream(), {
    httpMetadata: {
      contentType: file.type
    }
  });

  const url = `/media/${filename}`;

  return new Response(JSON.stringify({
    success: true,
    url
  }), {
    headers: { "Content-Type": "application/json" }
  });
}