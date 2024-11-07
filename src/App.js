import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Institute from './Institute';
import Register from './Register';
import Verifier from './Verifier';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Institute" element={<Institute />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Verifier" element={<Verifier />} />
      </Routes>
    </Router>
  );
}

export default App;
