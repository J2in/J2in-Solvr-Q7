import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './routes/HomePage'
import Dashboard from './components/Dashboard'
import UsersPage from './routes/UsersPage'
import UserDetailPage from './routes/UserDetailPage'
import CreateUserPage from './routes/CreateUserPage'
import EditUserPage from './routes/EditUserPage'
import NotFoundPage from './routes/NotFoundPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users">
          <Route index element={<UsersPage />} />
          <Route path="new" element={<CreateUserPage />} />
          <Route path=":id" element={<UserDetailPage />} />
          <Route path=":id/edit" element={<EditUserPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App

// client/src/App.tsx
//import React from 'react'
//import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
//import HomePage from './routes/HomePage'
//import Dashboard from './components/Dashboard'

//function App() {
//  return (
//    <BrowserRouter>
//      <nav style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
//        <Link to="/">Home</Link> | <Link to="/dashboard">🚀 릴리즈 대시보드</Link>
//      </nav>
//      <Routes>
//        <Route path="/" element={<HomePage />} />
//        <Route path="/dashboard" element={<Dashboard />} />
//      </Routes>
//    </BrowserRouter>
//  )
//}

//export default App

// src/App.tsx
//import React from 'react'
//import { Routes, Route } from 'react-router-dom'
//import HomePage from './routes/HomePage'
//import Dashboard from './components/Dashboard'
//import NotFoundPage from './routes/NotFoundPage'

//export default function App() {
//  return (
//    <Routes>
//      <Route path="/" element={<HomePage />} />
//      <Route path="/dashboard" element={<Dashboard />} />
//      <Route path="*" element={<NotFoundPage />} />
//    </Routes>
//  )
//}
