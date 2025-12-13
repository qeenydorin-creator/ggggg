import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchOrders } from '../api/orders';
import AdminGuard from '../guards/AdminGuard';


export default function App() {
const { user, loading, login, logout } = useAuth();
const [orders, setOrders] = useState([]);
const [page, setPage] = useState('home');


if (loading) return null;


if (!user) {
return (
<div className="login">
{/* 原来的登录 UI 不动 */}
<button onClick={() => login('19956618186', 'password')}>登录</button>
</div>
);
}


return (
<div>
{/* 原来的 header / nav / layout 不动 */}
<header>
<span>{user.username}</span>
<button onClick={logout}>退出</button>
</header>


<button onClick={() => {
setPage('orders');
fetchOrders().then(setOrders);
}}>订单</button>


<AdminGuard>
<button onClick={() => setPage('admin')}>管理后台</button>
</AdminGuard>


{page === 'orders' && orders.map(o => (
<div key={o.id}>{o.total_amount}</div>
))}


<AdminGuard>
{page === 'admin' && <div>管理员页面</div>}
</AdminGuard>
</div>
);
}