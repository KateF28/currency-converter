// Core
import React from 'react'
import { ToastContainer } from 'react-toastify'
// Components
import { Header } from './components/Header'
import { Converter } from './components/Converter'
// Styles
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <>
      <ToastContainer />
      <Header />
      <Converter />
    </>
  )
}

export default App
