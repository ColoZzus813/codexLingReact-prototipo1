import { useCallback, useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import { courses as fallbackCourses } from "../components/Courses";
import { API_URL, subscribeToRealtime } from "../../api/realtime";

function Home({ setPage, search }) {
  const [courses, setCourses] = useState(fallbackCourses);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/courses`);
      const result = await response.json();

      if (response.ok) {
        setCourses(result.data || []);
      }
    } catch (error) {
      console.error("No se pudieron cargar los cursos:", error);
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/courses`)
      .then((response) => response.json())
      .then((result) => {
        setCourses(result.data || fallbackCourses);
      })
      .catch((error) => {
        console.error("No se pudieron cargar los cursos:", error);
      });
  }, []);

  useEffect(() => subscribeToRealtime(["courses:updated"], fetchCourses), [fetchCourses]);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="courses-container">
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
          No se encontraron cursos
        </p>
      )}
    </div>
  );
}

export default Home;
