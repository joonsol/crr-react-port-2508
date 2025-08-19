
import './App.css'
import Admin from './pages/Admin'
import Notfound from './pages/Notfound'
import Home from './pages/Home'
import { Routes,Route } from 'react-router-dom'
function App() {
  
  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/admin' element={<Admin/>}/>
      <Route path='*' element={<Notfound/>}/>
    </Routes>
  )
}

export default App
