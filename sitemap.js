const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://www.meriadock.org.mx';
const PAGES_DIR = path.join(__dirname, 'pages');
const OUT_DIR = path.join(__dirname, 'public');
const OUT_FILE = path.join(OUT_DIR, 'sitemap.xml');

function isValidPage(file) {
  // No queremos archivos de API, _app, _document, _error, archivos a escala (estilos), o rutas internas
  const invalid = [
    '_app',
    '_document',
    '_error',
    'api',
    'styles',
    '.DS_Store'
  ];
  if (!file) return false;
  if (file.startsWith('_')) return false;
  if (file.startsWith('.')) return false;
  for (const inv of invalid) if (file === inv) return false;
  return true;
}

function walkPages(dir, baseRoute = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let routes = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    // ignorar carpetas y archivos ocultos / no-js/tsx que no son rutas
    if (entry.isDirectory()) {
      // omitimos api/ y carpetas de componentes si están en pages/
      if (entry.name === 'api' || entry.name === 'styles') continue;
      const nested = walkPages(entryPath, path.join(baseRoute, entry.name));
      routes = routes.concat(nested);
      continue;
    }

    // solo archivos .js, .jsx, .ts, .tsx
    if (!/\.(js|jsx|ts|tsx|md|mdx)$/.test(entry.name)) continue;

    const name = entry.name.replace(/\.(js|jsx|ts|tsx|md|mdx)$/, '');

    // ignorar archivos no válidos
    if (!isValidPage(name)) continue;

    // index -> ruta base de la carpeta
    let route;
    if (name === 'index') {
      route = baseRoute === '' ? '/' : `/${baseRoute}`;
    } else {
      route = `/${path.join(baseRoute, name)}`.replace(/\\/g, '/');
    }

    // obtener fecha de última modificación del archivo
    let stats;
    try {
      stats = fs.statSync(entryPath);
    } catch (e) {
      stats = null;
    }
    const lastmod = stats ? stats.mtime.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    routes.push({ route, lastmod });
  }

  return routes;
}

function generateSitemap() {
  // asegurar que existe public/
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  // Recopilar rutas desde pages/
  let pages = [];
  if (fs.existsSync(PAGES_DIR)) {
    pages = walkPages(PAGES_DIR);
  } else {
    // si no existe carpeta pages (raro), añade rutas manuales aquí
    pages = [{ route: '/', lastmod: new Date().toISOString().split('T')[0] }];
  }

  // Añadir rutas adicionales que no están en pages/, si deseas
  const extra = [
    { route: '/home', lastmod: new Date().toISOString().split('T')[0] },
    // { route: '/aviso-privacidad', lastmod: '2025-12-21' }, // ejemplo manual
  ];

  // Merge y dedupe
  const map = new Map();
  pages.concat(extra).forEach(p => map.set(p.route, p.lastmod));
  const routes = Array.from(map.entries()).map(([route, lastmod]) => ({ route, lastmod }));

  // Construir xml
  const xmlUrls = routes
    .map((p) => {
      const loc = `${SITE_URL}${p.route === '/' ? '' : p.route}`;
      const lastmod = p.lastmod;
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlUrls}\n</urlset>`;

  fs.writeFileSync(OUT_FILE, sitemap, 'utf8');
  console.log(`✅ Sitemap creado en: ${OUT_FILE}`);
  console.log(`📄 ${routes.length} rutas incluidas.`);
}

generateSitemap();