import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Flights from './pages/Flights'
import Admin from './pages/Admin'

const App = () => {
  return (
    <Router>
      <div>
        <h1 className="text-3xl font-bold text-blue-500 text-center mt-10">
          Jett3Airlines ✈️
        </h1>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<h2>404 Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
