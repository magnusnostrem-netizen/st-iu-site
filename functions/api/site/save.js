function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
      ...(init.headers || {})
    }
  });
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  try {
    const auth = context.request.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return json({ error: "Missing bearer token" }, { status: 401 });

    const body = await context.request.json();
    const page = body.page;
    const data = body.data;

    const map = {
      home: "src/content/site/home.json",
      about: "src/content/site/about.json",
      support: "src/content/site/support.json"
    };

    if (!map[page]) return json({ error: "Invalid page" }, { status: 400 });

    const path = map[page];
    const getUrl = "https://api.github.com/repos/magnusnostrem-netizen/st-iu-site/contents/" + path;

    const getResp = await fetch(getUrl, {
      headers: {
        "Authorization": Bearer ,
        "Accept": "application/vnd.github+json"
      }
    });

    const getJson = await getResp.json();
    if (!getResp.ok) return json({ error: "GitHub read error", details: getJson }, { status: getResp.status });

    const text = JSON.stringify(data, null, 2) + "\n";
    const encoded = btoa(unescape(encodeURIComponent(text)));

    const putResp = await fetch(getUrl, {
      method: "PUT",
      headers: {
        "Authorization": Bearer ,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: Update site content: ,
        content: encoded,
        sha: getJson.sha,
        branch: "master"
      })
    });

    const putJson = await putResp.json();
    if (!putResp.ok) return json({ error: "GitHub write error", details: putJson }, { status: putResp.status });

    return json({ ok: true, page, path });
  } catch (err) {
    return json({ error: String(err) }, { status: 500 });
  }
}
