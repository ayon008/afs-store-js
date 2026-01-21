/**
 * Sitemap HTML View
 * 
 * Displays the sitemap in a readable HTML format with CSS styling
 */

import sitemap from '../sitemap';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function SitemapView() {
  const urls = await sitemap();
  
  // Group URLs by type
  const staticPages = urls.filter(url => 
    !url.url.includes('/product/') && 
    !url.url.includes('/produit/') && 
    !url.url.includes('/product-category/') && 
    !url.url.includes('/categorie-produit/') && 
    !url.url.includes('/blog/')
  );
  
  const products = urls.filter(url => 
    url.url.includes('/product/') || url.url.includes('/produit/')
  );
  
  const categories = urls.filter(url => 
    url.url.includes('/product-category/') || url.url.includes('/categorie-produit/')
  );
  
  const blogPosts = urls.filter(url => 
    url.url.includes('/blog/') && !url.url.endsWith('/blog')
  );

  const styles = `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 40px;
          }
          
          h1 {
            color: #111;
            font-size: 2.5rem;
            margin-bottom: 10px;
            border-bottom: 3px solid #1d98ff;
            padding-bottom: 15px;
          }
          
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          
          .stat-card {
            background: linear-gradient(135deg, #1d98ff 0%, #0d7ae6 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
          }
          
          .stat-card h3 {
            font-size: 2rem;
            margin-bottom: 5px;
          }
          
          .stat-card p {
            font-size: 0.9rem;
            opacity: 0.9;
          }
          
          .section {
            margin: 40px 0;
          }
          
          .section h2 {
            color: #111;
            font-size: 1.8rem;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e6e6e6;
          }
          
          .url-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 15px;
          }
          
          .url-item {
            background: #f9f9f9;
            border: 1px solid #e6e6e6;
            border-radius: 6px;
            padding: 15px;
            transition: all 0.2s;
          }
          
          .url-item:hover {
            background: #f0f0f0;
            border-color: #1d98ff;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          
          .url-item a {
            color: #1d98ff;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            display: block;
            margin-bottom: 8px;
            word-break: break-all;
          }
          
          .url-item a:hover {
            text-decoration: underline;
          }
          
          .url-meta {
            display: flex;
            gap: 15px;
            font-size: 0.85rem;
            color: #666;
            flex-wrap: wrap;
          }
          
          .url-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .badge-en {
            background: #e3f2fd;
            color: #1976d2;
          }
          
          .badge-fr {
            background: #fff3e0;
            color: #e65100;
          }
          
          .priority {
            background: #f3e5f5;
            color: #7b1fa2;
          }
          
          .lastmod {
            color: #999;
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e6e6e6;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
          }
          
          .footer a {
            color: #1d98ff;
            text-decoration: none;
          }
          
          .footer a:hover {
            text-decoration: underline;
          }
          
          @media (max-width: 768px) {
            .container {
              padding: 20px;
            }
            
            h1 {
              font-size: 2rem;
            }
            
            .url-list {
              grid-template-columns: 1fr;
            }
            
            .stats {
              grid-template-columns: 1fr;
            }
          }
        `;

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Sitemap - AFS Foiling</title>
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <div className="container">
          <h1>🗺️ Sitemap AFS Foiling</h1>
          
          <div className="stats">
            <div className="stat-card">
              <h3>{staticPages.length}</h3>
              <p>Pages Statiques</p>
            </div>
            <div className="stat-card">
              <h3>{products.length}</h3>
              <p>Produits</p>
            </div>
            <div className="stat-card">
              <h3>{categories.length}</h3>
              <p>Catégories</p>
            </div>
            <div className="stat-card">
              <h3>{blogPosts.length}</h3>
              <p>Articles de Blog</p>
            </div>
            <div className="stat-card">
              <h3>{urls.length}</h3>
              <p>Total URLs</p>
            </div>
          </div>
          
          <div className="section">
            <h2>📄 Pages Statiques</h2>
            <div className="url-list">
              {staticPages.map((item, index) => (
                <div key={index} className="url-item">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                  <div className="url-meta">
                    {item.alternates?.languages?.en && (
                      <span><span className="badge badge-en">EN</span></span>
                    )}
                    {item.alternates?.languages?.fr && (
                      <span><span className="badge badge-fr">FR</span></span>
                    )}
                    {item.priority && (
                      <span><span className="badge priority">Priority: {item.priority}</span></span>
                    )}
                    {item.lastModified && (
                      <span className="lastmod">
                        Modifié: {new Date(item.lastModified).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="section">
            <h2>🛍️ Produits ({products.length})</h2>
            <div className="url-list">
              {products.slice(0, 100).map((item, index) => (
                <div key={index} className="url-item">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                  <div className="url-meta">
                    {item.alternates?.languages?.en && (
                      <span><span className="badge badge-en">EN</span></span>
                    )}
                    {item.alternates?.languages?.fr && (
                      <span><span className="badge badge-fr">FR</span></span>
                    )}
                    {item.lastModified && (
                      <span className="lastmod">
                        {new Date(item.lastModified).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {products.length > 100 && (
                <div className="url-item" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                  ... et {products.length - 100} autres produits
                </div>
              )}
            </div>
          </div>
          
          <div className="section">
            <h2>📁 Catégories ({categories.length})</h2>
            <div className="url-list">
              {categories.map((item, index) => (
                <div key={index} className="url-item">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                  <div className="url-meta">
                    {item.alternates?.languages?.en && (
                      <span><span className="badge badge-en">EN</span></span>
                    )}
                    {item.alternates?.languages?.fr && (
                      <span><span className="badge badge-fr">FR</span></span>
                    )}
                    {item.lastModified && (
                      <span className="lastmod">
                        {new Date(item.lastModified).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="section">
            <h2>📝 Articles de Blog ({blogPosts.length})</h2>
            <div className="url-list">
              {blogPosts.slice(0, 50).map((item, index) => (
                <div key={index} className="url-item">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.url}
                  </a>
                  <div className="url-meta">
                    {item.alternates?.languages?.en && (
                      <span><span className="badge badge-en">EN</span></span>
                    )}
                    {item.alternates?.languages?.fr && (
                      <span><span className="badge badge-fr">FR</span></span>
                    )}
                    {item.lastModified && (
                      <span className="lastmod">
                        {new Date(item.lastModified).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {blogPosts.length > 50 && (
                <div className="url-item" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                  ... et {blogPosts.length - 50} autres articles
                </div>
              )}
            </div>
          </div>
          
          <div className="footer">
            <p>
              Sitemap généré le {new Date().toLocaleString('fr-FR')} | 
              <a href="/sitemap.xml"> Voir le sitemap XML</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
