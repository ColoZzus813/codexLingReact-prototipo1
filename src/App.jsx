import { useState } from "react";
import Header from "./assets/components/Header";
import MobileMenu from "./assets/components/MobileMenu";
import Marquee from "./assets/components/Marquee";
import CourseCard from "./assets/components/CourseCard";
import Home from "./assets/pages/Home";
import Html from "./assets/pages/Html";
import Python from "./assets/pages/Python";
import PythonCourse from "./assets/pages/PythonCourse";
import Java from "./assets/pages/Java";
import Php from "./assets/pages/Php";
import Admin from "./assets/pages/Admin";
import Forum from "./assets/pages/Forum";
import backgroundLogo from "./assets/img/logocodex.png";
import "./styles/Global.css";

function SimplePage({ title, description }) {
  return (
    <section className="simple-page">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  

  const renderPage = () => {
    switch (page) {
      case "html":
        return <Html setPage={setPage} />;
      case "html-course":
        return <PythonCourse setPage={setPage} courseType="html" courseTitle="HTML" backPage="html" />;
      case "python":
        return <Python setPage={setPage} />;
      case "python-course":
        return <PythonCourse setPage={setPage} courseType="python" courseTitle="Python" backPage="python" />;
      case "java": return <Java setPage={setPage} />;
      case "java-course":
        return <PythonCourse setPage={setPage} courseType="java" courseTitle="Java" backPage="java" />;
      case "php": return <Php setPage={setPage} />;
      case "php-course":
        return <PythonCourse setPage={setPage} courseType="php" courseTitle="PHP" backPage="php" />;
      case "admin": return <Admin />;
      case "ranking":
        return (
          <SimplePage
            title="Ranking"
            description="Aqui se mostraran los estudiantes con mejor avance en los cursos."
          />
        );
      case "foro":
        return <Forum setPage={setPage} />;
      case "configuraciones":
        return (
          <SimplePage
            title="Configuraciones"
            description="Aqui podras ajustar las preferencias de tu experiencia en CodexLing."
          />
        );
      default: return <Home setPage={setPage} search={search} />;
    }
  };

  return (
    <>
      <div className="bg-pattern" aria-hidden="true"></div>
      <div className="grid-overlay" aria-hidden="true"></div>
      <div className="code-sky" aria-hidden="true">
        <img src={backgroundLogo} alt="CodexLing logo" className="background-logo" />
      </div>
      <Header 
        setPage={setPage}
        toggleMenu={() => setMenuOpen(!menuOpen)}
        search={search}
        setSearch={setSearch}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
    />
      <MobileMenu
        setPage={setPage}
        setSearch={setSearch}
        setShowSearch={setShowSearch}
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen(false)}
      />
      <Marquee />
      <main>{renderPage()}</main>
    </>
  );
}

export default App;
