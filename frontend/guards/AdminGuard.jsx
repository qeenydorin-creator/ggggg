export default function AdminGuard({ children }) {
const role = localStorage.getItem('role');
if (role !== 'admin') return null;
return children;
}