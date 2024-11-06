import { Routes, Route } from "react-router-dom";
import Customizer from "./pages/Customizer";

function App() {
  return (
    // <BrowserRouter>
    <Routes>
      <Route path="/*" element={<Customizer />} />
    </Routes>
    // </BrowserRouter>
  );
}

export default App;
