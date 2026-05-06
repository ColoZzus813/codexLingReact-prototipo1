import CourseCard from "../components/CourseCard";
import { courses } from "../components/Courses";

function Home({ setPage, search }) {
  // Filtrar cursos según lo que escribe el usuario
  const filteredCourses = courses.filter((course) =>
  course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="courses-container">

        {/* 🔁 Renderizado con map */}
        {filteredCourses.length > 0 ? (
        filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            icon={course.icon}
            description={course.description}
            onClick={() => setPage(course.page)}
            type={course.type}
          />
        ))
      ) : (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          No se encontraron cursos 😢
        </p>
      )}

    </div>
  );
}

export default Home;
