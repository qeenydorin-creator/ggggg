import { apiFetch } from './client';


export function fetchOrders() {
return apiFetch('/api/orders');
}