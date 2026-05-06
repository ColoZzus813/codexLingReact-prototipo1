function CourseCard({ title, icon, description, onClick, type }) {
  return (
    <div className={`course-card ${type}-card`} onClick={onClick}>
      
      <div className="course-icon">
        <i className={icon}></i>
      </div>

      <div className="course-info">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

    </div>
  );
}

export default CourseCard;