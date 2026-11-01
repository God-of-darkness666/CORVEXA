import { createRoot } from 'react-dom/client'
import '@fontsource-variable/sora'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/tokens.css'
import './styles/layout.css'
import './styles/sections.css'
import './styles/modules.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
