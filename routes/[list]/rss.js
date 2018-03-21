import fetch from 'node-fetch';

const render = (list, items) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
	<title>Svelte HN (${list})</title>
	<link>https://hn.svelte.technology/${list}/1</link>
	<description>Links from the orange site</description>
	<image>
		<url>https://hn.svelte.technology/favicon.png</url>
		<title>Svelte HN (${list})</title>
		<link>https://hn.svelte.technology/${list}/1</link>
	</image>
	${items.map(item => `
		<item>
			<title>${item.title}${item.domain ? `(${item.domain})` : ''}</title>
			<link>https://hn.svelte.technology/item/${item.id}</link>
			<description><![CDATA[${
				item.url ? `<a href="${item.url}">link</a> / ` : ''
				}<a href="https://hn.svelte.technology/item/${item.id}">comments</a>
			]]></description>
			<pubDate>${new Date(item.time).toUTCString()}</pubDate>
		</item>
	`).join('\n')}
</channel>
</rss>`;

export function get(req, res) {
	const list = (
		req.params.list === 'top' ? 'news' :
		req.params.list === 'new' ? 'newest' :
		req.params.list
	);

	res.set({
		'Cache-Control': `max-age=${30 * 60 * 1e3}`,
		'Content-Type': 'application/rss+xml'
	});

	fetch(`https://api.hnpwa.com/v0/${list}/1.json`)
		.then(r => r.json())
		.then(items => {
			const feed = render(list, items);
			res.end(feed);
		});
}
