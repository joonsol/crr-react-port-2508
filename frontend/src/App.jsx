
import './App.css'
import Notfound from './pages/Notfound'
import Home from './pages/Home'
import { Routes,Route } from 'react-router-dom'
import AdminJoin from './pages/AdminJoin'
function App() {
  
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/admin/join' element={<AdminJoin/>}/>
      <Route path='*' element={<Notfound/>}/>
    </Routes>
  )
}

export default App
