
import './App.css'
import Notfound from './pages/Notfound'
import Home from './pages/Home'
import { Routes,Route } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminPost from './pages/AdminPost'
import AuthRedirectRoute from './routes/AuthRedirectRoute';
import RequireAuth from './routes/RequireAuth';
function App() {
  
  return (
<Routes>
      <Route path='/' element={<Home/>}/>
      {/* 로그인 페이지: 이미 인증이면 /admin/posts로 우회 */}
      <Route path="/admin" element={<AuthRedirectRoute Component={AdminLogin} />} />
      {/* 보호 페이지: 비인증이면 /admin/login으로 */}
      <Route path="/admin/posts" element={<RequireAuth Component={AdminPost} />} />
      <Route path='*' element={<Notfound/>}/>
    </Routes>
  )
}

export default App
