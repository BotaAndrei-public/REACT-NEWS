import { createRoot } from "react-dom/client";
import { useState } from "react";
const root = createRoot(document.getElementById("root"));
import "../App.css";
import "../index.css";

root.render(<App />);

function App() {
  const [value, setValue] = useState(1);
  return (
    <main>
      <InputHeaderMultiplayer value={value} setValue={setValue} />
      <Header n={value} />
      <Page />
    </main>
  );
}

function InputHeaderMultiplayer({ value, setValue }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        setValue(Number(e.target.value));
      }}
    ></input>
  );
}

function Header({ n }) {
  return (
    <>
      {Array(n)
        .fill()
        .map((_, i) => (
          <h1 key={i}>REACT</h1>
        ))}
    </>
  );
}

function Page() {
  return (
    <ol>
      <li>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
        eveniet praesentium veritatis ratione incidunt, dignissimos cupiditate.
        Ullam eveniet fugit itaque ea incidunt voluptas ipsa officiis?
        Reiciendis sed atque laboriosam sit.
      </li>
      <li>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Aliquam libero
        delectus a repellendus perferendis repellat officia nostrum, itaque ex
        voluptates commodi dolorem harum, nam iusto unde! Expedita rerum
        obcaecati totam.
      </li>
    </ol>
  );
}
