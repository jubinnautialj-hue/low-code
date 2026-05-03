import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DynamicCrudPage from './pages/DynamicCrudPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dynamic/user_form" replace />} />
        <Route path="/dynamic/:formCode" element={<DynamicCrudPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
