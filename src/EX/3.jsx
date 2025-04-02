import { createRoot } from "react-dom/client";
import "../EX/3_index.css";
import "../EX/3_App.css";
import Header from "./3_Header";
import MainContent from "./3_MainContent";

const root = createRoot(document.getElementById("root"));

root.render(<App />);

function App() {
  return (
    <div>
      <Header />
      <MainContent />
    </div>
  );
}
