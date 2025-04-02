function Header() {
  return (
    <header className="header">
      <a href="" className="nav-list-item">
        <img
          src={import.meta.env.BASE_URL + "react.svg"}
          alt="react logo"
          className="header-logo"
        />
        <span className="header-title">REACT NEWS</span>
      </a>
    </header>
  );
}

export default Header;
