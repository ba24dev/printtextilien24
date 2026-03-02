export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const paths = [
    "/",
    "/products",
    "/collections/tsv",
    "/collections/allgemein",
    "/contact",
    "/privacy",
    "/imprint",
  ];

  const urls = paths
    .map((p) => {
      return `  <url>\n    <loc>${origin}${p}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
