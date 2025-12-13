import { useEffect, useState } from 'react';
import { login as loginApi, getProfile } from '../api/auth';


export function useAuth() {
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);


useEffect(() => {
const token = localStorage.getItem('auth_token');
if (!token) {
setLoading(false);
return;
}


getProfile()
.then(setUser)
.finally(() => setLoading(false));
}, []);


async function login(phone, password) {
const res = await loginApi(phone, password);
localStorage.setItem('auth_token', res.token);
localStorage.setItem('role', res.role);
setUser({ username: res.user, role: res.role });
}


function logout() {
localStorage.clear();
window.location.reload();
}


return { user, loading, login, logout };
}