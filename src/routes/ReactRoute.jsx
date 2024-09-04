import React from 'react'
import { Route, Routes } from 'react-router-dom'
import TaskHistory from '../pages/taskHistory'
import SignupPage from '../pages/SignupPage'
import LoginPage from '../pages/LoginPage'

function ReactRoute() {
  return (
    <div>
      <Routes>
       
        <Route path="/" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/main" element={<TaskHistory />} />
      </Routes>
    </div>
  )
}

export default ReactRoute
