
import './App.css'
import Notfound from './pages/Notfound'
import Home from './pages/Home'
import { Routes,Route } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminPost from './pages/AdminPost'
// src/App.jsx
import "./styles/main.scss";
import { useTheme } from "./hooks/useTheme";

function App() {
    const { theme, toggle } = useTheme();
  return (
    <div>
      <h1>현재 테마 : {theme}</h1>
      <button onClick={toggle}>{theme}</button>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/admin' element={<AdminLogin/>}/>
      <Route path='/admin/posts' element={<AdminPost/>}/>
      <Route path='*' element={<Notfound/>}/>
    </Routes>
    </div>
  )
}

export default App
