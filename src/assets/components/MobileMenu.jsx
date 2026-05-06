function MobileMenu({ menuOpen, toggleMenu, setPage, setSearch, setShowSearch }) {
  const goToPage = (page) => {
    setPage(page);
    setSearch("");
    setShowSearch(false);
    toggleMenu();
  };

  return (
    <>
      <div className={`overlay ${menuOpen ? "active" : ""}`} onClick={toggleMenu}></div>

      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <div className="close-menu" onClick={toggleMenu}>X</div>

        <button className="menu-main-link" type="button" onClick={() => goToPage("home")}>
          Lenguajes
        </button>
        <button className="menu-sub-link" type="button" onClick={() => goToPage("html")}>HTML</button>
        <button className="menu-sub-link" type="button" onClick={() => goToPage("python")}>Python</button>
        <button className="menu-sub-link" type="button" onClick={() => goToPage("java")}>Java</button>
        <button className="menu-sub-link" type="button" onClick={() => goToPage("php")}>PHP</button>

        <button className="menu-main-link" type="button" onClick={() => goToPage("ranking")}>
          Ranking
        </button>
        <button className="menu-main-link" type="button" onClick={() => goToPage("foro")}>
          Foro
        </button>
        <button className="menu-main-link" type="button" onClick={() => goToPage("configuraciones")}>
          Configuraciones
        </button>
      </div>
    </>
  );
}

export default MobileMenu;
