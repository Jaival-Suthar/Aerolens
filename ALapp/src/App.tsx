// App.js
import './App.css';
import Navbar from './Appnavbar';
import ClientTable from './ClientComponents/ClientTable';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ClientTable />} />
        <Route path="/clients" element={<ClientTable />} />
        <Route path="/reports" element={<h2>Reports Page</h2>} />
      </Routes>
      {/* "When the URL is /clients, render <ClientTable />". */}
    </BrowserRouter>
  );
}

export default App;
