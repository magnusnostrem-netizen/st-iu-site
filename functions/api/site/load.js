function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
      ...(init.headers || {})
    }
  });
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestGet(context) {
  const auth = context.request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const url = new URL(context.request.url);
  const page = url.searchParams.get("page");

  const map = {
    home: "src/content/site/home.json",
    about: "src/content/site/about.json",
    support: "src/content/site/support.json"
  };

  if (!map[page]) return json({ error: "Invalid page" }, { status: 400 });
  if (!token) return json({ error: "Missing bearer token" }, { status: 401 });

  const apiUrl = "https://api.github.com/repos/magnusnostrem-netizen/st-iu-site/contents/" + map[page];
  const ghResp = await fetch(apiUrl, {
    headers: {
      "Authorization": Bearer ,
      "Accept": "application/vnd.github+json"
    }
  });

  const ghJson = await ghResp.json();
  if (!ghResp.ok) return json({ error: "GitHub API error", details: ghJson }, { status: ghResp.status });

  const content = decodeURIComponent(escape(atob((ghJson.content || "").replace(/\n/g, ""))));
  return json({ ok: true, page, path: map[page], sha: ghJson.sha, data: JSON.parse(content) });
}
