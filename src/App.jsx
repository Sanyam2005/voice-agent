// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VoiceAgent from './components/VoiceAgent';
import Navbar from './components/Navbar';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<VoiceAgent />} />
            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
// import VoiceAgent from './components/VoiceAgent';

// function App() {
//   return (
//     <div className="App">
//       <VoiceAgent />
//     </div>
//   );
// }
// export default App;