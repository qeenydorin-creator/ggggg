import { apiFetch } from './client';


export function login(phone, password) {
return apiFetch('/api/login', {
method: 'POST',
body: JSON.stringify({ phone, password })
});
}


export function getProfile() {
return apiFetch('/api/user/profile');
}