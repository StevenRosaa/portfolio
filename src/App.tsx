import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Home from './Pages/Home.tsx'
import { SignIn } from './Pages/SignIn.tsx'
import { Works } from './Pages/Works/Works.tsx'
import { useGitHubSync } from './hooks/useGithubSync.ts'

function App() {
  const { startAutoSync, syncRepositories } = useGitHubSync()
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Assicurati che il sync venga eseguito solo una volta
    if (!hasInitialized.current) {
      hasInitialized.current = true
      
      // Esegui il primo sync immediatamente
      syncRepositories()
        .then(() => {
          console.log('Initial GitHub sync completed')
        })
        .catch((error) => {
          console.error('Initial GitHub sync failed:', error)
        })

      // Avvia il sync automatico ogni 60 minuti (opzionale)
      // Rimuovi questa riga se vuoi solo il sync iniziale
      startAutoSync(60)
    }
  }, [syncRepositories, startAutoSync])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/signin" element={<SignIn/>} />
        <Route path="/works" element={<Works/>} />
      </Routes>
    </Router>
  )
}

export default App