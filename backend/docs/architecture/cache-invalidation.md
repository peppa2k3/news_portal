# Cache and revalidation matrix

| Mutation | Redis keys | Next.js tags/paths |
|---|---|---|
| Article create/edit | `article*`, `homepage*`, `category*`, `tag*`, `author*`, `search*` | article cũ/mới, homepage, category, author, sitemap, RSS |
| Publish/schedule/archive | như trên | article, homepage, category, author, sitemap, RSS |
| Category create/move/hide | `menu`, `homepage*`, `category*` | homepage, category cũ/mới và cha |
| Tag/author change | listing liên quan | tag/author và các article liên quan |
| Comment approve/reject | `article*`, `homepage*` | article/comment count |

TTL mặc định: menu 3600 giây, homepage 60, article 300, listing/search ngắn hoặc không cache. Admin/error/token response không được cache.

Revalidation job có HMAC SHA-256 trên `timestamp.body`, timeout 5 giây, tối đa 8 lần và exponential backoff. Next.js phải từ chối timestamp cũ và tag/path ngoài allowlist để chống replay/revalidate tùy ý.
