import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import IELTSReadingPage from './componets/Reading'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <IELTSReadingPage/>
    </>
  )
}

export default App
