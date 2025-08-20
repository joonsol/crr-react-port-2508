
import './App.css'
import Notfound from './pages/Notfound'
import Home from './pages/Home'
import { Routes,Route } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
function App() {
  
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/admin' element={<AdminLogin/>}/>
      <Route path='*' element={<Notfound/>}/>
    </Routes>
  )
}

export default App
