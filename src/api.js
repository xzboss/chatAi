const config = {}
function post ({ key, url, body }) {
	return fetch(url, {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${key}`,
			"HTTP-Referer": `demo`,
			"X-Title": `demo`,
			"Content-Type": "application/json"
		},
		body
	})
}
export function send (key, msgArr, model = 'mistralai/mistral-7b-instruct:free') {
	return post({
		key,
		url: 'https://openrouter.ai/api/v1/chat/completions',
		body: JSON.stringify({
			"model": model,
			"messages": msgArr,
			"stream": true
		})
	})
}