import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import AccountType from './pages/AccountType'
import Subscription from './pages/Subscription'
import UserProfile from './pages/UserProfile'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/account-type" element={<AccountType />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/user/:username" element={<UserProfile />} />
      </Routes>
    </Router>
  )
}

export default App