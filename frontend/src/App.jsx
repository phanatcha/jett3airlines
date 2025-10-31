import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Flights from './pages/Flights'
import Admin from './pages/Admin'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Info from './pages/Info'
import Book from './pages/Book'
import Experience from './pages/Experience'
import Contact from './pages/Contact'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/info" element={<Info />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/book" element={<Book />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="*" element={<h2>404 Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
