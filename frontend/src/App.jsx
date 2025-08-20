
import './App.css'
import Notfound from './pages/Notfound'
import Home from './pages/Home'
import { Routes,Route } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminPost from './pages/AdminPost'
function App() {
  
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/admin' element={<AdminLogin/>}/>
      <Route path='/admin/posts' element={<AdminPost/>}/>
      <Route path='*' element={<Notfound/>}/>
    </Routes>
  )
}

export default App
