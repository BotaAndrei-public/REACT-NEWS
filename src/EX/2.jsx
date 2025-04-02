import { createRoot } from "react-dom/client";
import  Header  from "./2_Header";
import MainContent from "./2_MainContent";
import Footer from "./2_Footer";

import "../App.css";
import "../index.css";

const root = createRoot(document.getElementById("root"));

root.render(<App />);

function App() {
  return (
    <>
      <Page/>
    </>
  );
}

function Page() {
  return (
    <>
      <Header></Header>
      <MainContent></MainContent>
      <Footer></Footer>
    </>
  );
}
