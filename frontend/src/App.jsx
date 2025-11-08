import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Flights from './pages/Flights'
import Admin from './pages/Admin'
import EditFlight from './pages/EditFlight'
import EditBooking from './pages/EditBooking'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Info from './pages/Info'
import Book from './pages/Book'
import Experience from './pages/Experience'
import Contact from './pages/Contact'
import Departure from './pages/Departure'
import Return from './pages/Return'
import Fare from './pages/Fare'
import PassengerInfo from './pages/PassengerInfo'
import Seat from './pages/Seat'
import Payment from './pages/Payment'
import Confirmation from './pages/Confirmation'

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/info" element={<Info />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/edit-flight" element={<EditFlight />} />
          <Route path="/admin/edit-booking" element={<EditBooking />} />
          <Route path="/book" element={<Book />} />
          <Route path="/experience" element={<Experience />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/flights" element={<Flights />} />
          <Route path="/flights/departure" element={<Departure />} />
          <Route path="/flights/return" element={<Return />} />

          <Route path="/fare" element={<Fare />} />
          <Route path="/passengerinfo" element={<PassengerInfo />} />
          <Route path="/seat" element={<Seat />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />

          <Route path="/experience/first-class" element={<h2 className="flex items-center justify-center pt-10">Coming Soon!</h2>} />
          <Route path="/experience/diner" element={<h2 className="flex items-center justify-center pt-10">Coming Soon!</h2>} />
          <Route path="/experience/services" element={<h2 className="flex items-center justify-center pt-10">Coming Soon!</h2>} />

          <Route path="*" element={<h2>404 Page Not Found</h2>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
