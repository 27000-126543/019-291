import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Timeline from "@/pages/Timeline";
import Actions from "@/pages/Actions";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/actions" element={<Actions />} />
        </Route>
      </Routes>
    </Router>
  );
}
