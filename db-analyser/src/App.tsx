import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import Charts from "./pages/Charts";
import Validation from "./pages/Validation";
import Reports from "./pages/Reports";

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Upload />} />

      {/* Dashboard Pages */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/validation" element={<Validation />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;