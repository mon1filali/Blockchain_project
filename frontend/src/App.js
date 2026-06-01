import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Exercice1 from "./Pages/Exercice1";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exercice1" element={<Exercice1 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;