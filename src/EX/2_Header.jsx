export default function Header() {
    return (
      <header className="header">
        <a href="">
        <img className="react logo img_react_logo" src="src/assets/react.svg" alt="react img" />
        </a>
        <nav>
        <ul className="nav-list">
          <a> <li className="nav-list-item">Home</li>     </a>
          <a> <li className="nav-list-item">About</li> </a>
          <a> <li className="nav-list-item">Contact</li> </a>
        </ul>
        </nav>
      </header>
    );
  }