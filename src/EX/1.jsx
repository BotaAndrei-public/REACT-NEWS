import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
const root = createRoot(document.getElementById("root"));
import "../index.css";
import "../App.css";

root.render(
    <main>
        <TemporaryName>
           
        </TemporaryName>
        <Page></Page>
    </main>
);

function TemporaryName() {
  return (
    <main>
      <h1>This is React</h1>
      <h1>This is React</h1>
      <h1>This is React</h1>
      <h1>This is React</h1>
    </main>
  );
}

function Page() {
    return(
        <ol>
            <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate atque adipisci in deserunt animi quae odit, sapiente nemo eaque a labore exercitationem incidunt nisi quos. Labore iste odio facere optio!</li>
            <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Repudiandae reiciendis, magnam facilis minima commodi hic quam, animi, accusantium voluptate vel voluptates veniam! Deleniti, nihil molestiae non corrupti aliquid quaerat optio!</li>
        </ol>
    );
}