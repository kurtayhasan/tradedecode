import rss from '@astrojs/rss';
import fs from 'fs';

export function GET(context) {
  const postsDir = 'src/content/posts';
  
  if (!fs.existsSync(postsDir)) {
    return rss({
      title: 'TradeDecode',
      description: 'AI-Powered Trading & Crypto Insights',
      site: context.site,
      items: [],
    });
  }
  
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  const posts = files.map(file => {
    const raw = fs.readFileSync(`${postsDir}/${file}`, 'utf8');
    const title = raw.match(/title: "(.*)"/)?.[1] || 'Untitled';
    const description = raw.match(/description: "(.*)"/)?.[1] || '';
    const date = raw.match(/date: "(.*)"/)?.[1] || '';
    const slug = raw.match(/slug: "(.*)"/)?.[1] || '';
    
    return {
      title,
      description,
      pubDate: new Date(date),
      link: `/posts/${slug}/`,
    };
  }).sort((a, b) => b.pubDate - a.pubDate);

  return rss({
    title: 'TradeDecode',
    description: 'AI-Powered Trading & Crypto Insights - Automated content about cryptocurrency, forex, and trading strategies',
    site: context.site,
    items: posts,
    customData: `<language>en-us</language>`,
  });
}
