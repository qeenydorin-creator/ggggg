const API_BASE = import.meta.env.VITE_API_URL;


export async function apiFetch(url, options = {}) {
const token = localStorage.getItem('auth_token');


const res = await fetch(API_BASE + url, {
...options,
headers: {
'Content-Type': 'application/json',
...(token ? { token } : {}),
...(options.headers || {})
}
});


if (res.status === 401) {
localStorage.clear();
window.location.reload();
throw new Error('登录已过期');
}


return res.json();
}