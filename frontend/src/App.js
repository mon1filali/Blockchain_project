import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Exercice1 from "./Pages/Exercice1";
import Exercice2 from "./Pages/Exercice2";
import Exercice3 from "./Pages/Exercice3";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exercice1" element={<Exercice1 />} />
        <Route path="/exercice2" element={<Exercice2 />} />
        <Route path="/exercice3" element={<Exercice3 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;