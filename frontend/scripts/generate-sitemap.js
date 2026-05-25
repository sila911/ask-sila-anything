import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// You can set these in your environment or a .env file
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const BASE_URL = 'https://asksila.vercel.app'; // Update this to your production URL

async function generateSitemap() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in the environment.');
    process.exit(1);
  }

  console.log('Fetching questions from Supabase...');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/questions?select=id,createdAt`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const questions = await response.json();
    console.log(`Found ${questions.length} questions.`);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    questions.forEach(q => {
      const date = new Date(q.createdAt).toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${BASE_URL}/q/${q.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>';

    const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml);
    console.log(`Sitemap generated successfully at ${sitemapPath}`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
