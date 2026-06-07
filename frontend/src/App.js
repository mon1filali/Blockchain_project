import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Exercice1 from "./Pages/Exercice1";
import Exercice2 from "./Pages/Exercice2";
import Exercice3 from "./Pages/Exercice3";
import Exercice4 from "./Pages/Exercice4";
import Exercice5 from "./Pages/Exercice5";
import Exercice6 from "./Pages/Exercice6";
import Exercice7 from "./Pages/Exercice7";
import Exercice8 from "./Pages/Exercice8";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/exercice1" element={<Exercice1 />} />
        <Route path="/exercice2" element={<Exercice2 />} />
        <Route path="/exercice3" element={<Exercice3 />} />
        <Route path="/exercice4" element={<Exercice4 />} />
        <Route path="/exercice5" element={<Exercice5 />} />
        <Route path="/exercice6" element={<Exercice6 />} />
        <Route path="/exercice7" element={<Exercice7 />} />
        <Route path="/exercice8" element={<Exercice8 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;