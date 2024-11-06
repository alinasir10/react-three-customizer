import { Routes, Route } from "react-router-dom";
import Customizer from "./pages/Customizer";

function App() {
  return (
    <Routes>
      <Route path="/*" element={<Customizer />} />
    </Routes>
  );
}

export default App;
