import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DynamicCrudPage from './pages/DynamicCrudPage'
import FormDesigner from './pages/FormDesigner'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/designer" element={<FormDesigner />} />
        <Route path="/designer/:formCode" element={<FormDesigner />} />
        <Route path="/dynamic/:formCode" element={<DynamicCrudPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
