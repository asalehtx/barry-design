// Runs only for /video/* (see run_worker_first in wrangler.jsonc). Cloudflare's static assets
// ignore Range headers and always answer 200 with the whole file, but Safari, on iPhone above
// all, will only play a video whose server returns 206 partial responses. The hero videos are
// small (under 1.5 MB), so slicing the asset in memory is cheap.

// Parse a single `bytes=` range against a file of `size` bytes.
// Returns [start, end] (inclusive), null when unsatisfiable (416), or undefined when the
// header isn't a single byte range we serve, in which case the whole file goes out (RFC 9110).
export const parseRange = (header, size) => {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match || (match[1] === "" && match[2] === "")) return undefined;
  const [, first, last] = match;

  if (first === "") {
    const suffix = Number(last);
    return suffix === 0 ? null : [Math.max(size - suffix, 0), size - 1];
  }
  const start = Number(first);
  const end = last === "" ? size - 1 : Math.min(Number(last), size - 1);
  return start >= size || start > end ? null : [start, end];
};

export const withRange = async (request, response) => {
  if (response.status !== 200) return response;

  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  const header = request.headers.get("Range");
  // HEAD has no body to slice; its headers already describe the whole file.
  if (!header || request.method === "HEAD") return new Response(response.body, { status: 200, headers });

  const body = await response.arrayBuffer();
  const range = parseRange(header, body.byteLength);
  if (range === undefined) return new Response(body, { status: 200, headers });
  if (range === null) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${body.byteLength}`, "Accept-Ranges": "bytes" },
    });
  }

  const [start, end] = range;
  headers.set("Content-Range", `bytes ${start}-${end}/${body.byteLength}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(body.slice(start, end + 1), { status: 206, headers });
};

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    // A missing video falls through to the SPA's index.html; a video URL should 404 instead.
    if (response.headers.get("Content-Type")?.startsWith("text/html")) {
      return new Response("Not found", { status: 404 });
    }
    return withRange(request, response);
  },
};
