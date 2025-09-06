import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import styles from "./grades.module.scss";

export default function Grades() {
  const grades = [
    {
      course: "JavaScript Fundamentals",
      grade: "A",
      score: 92,
      date: "2024-01-15",
    },
    { course: "React Development", grade: "B+", score: 87, date: "2024-01-20" },
    { course: "Node.js Backend", grade: "A-", score: 89, date: "2024-01-25" },
    { course: "Database Design", grade: "B", score: 83, date: "2024-01-30" },
    { course: "API Development", grade: "A", score: 94, date: "2024-02-05" },
  ];

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title="Grades">
        <div className={styles.gradesContainer}>
          <div className={styles.summaryCard}>
            <h3>Grade Summary</h3>
            <div className={styles.summaryStats}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Overall GPA</span>
                <span className={styles.summaryValue}>3.7</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Completed Courses</span>
                <span className={styles.summaryValue}>5</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Average Score</span>
                <span className={styles.summaryValue}>89%</span>
              </div>
            </div>
          </div>

          <div className={styles.gradesTable}>
            <h3>Course Grades</h3>
            <div className={styles.tableHeader}>
              <span>Course</span>
              <span>Grade</span>
              <span>Score</span>
              <span>Date</span>
            </div>
            {grades.map((grade, index) => {
              const gradeClass =
                "grade" +
                grade.grade.replace("+", "Plus").replace("-", "Minus");
              return (
                <div key={index} className={styles.tableRow}>
                  <span className={styles.courseName}>{grade.course}</span>
                  <span className={`${styles.grade} ${styles[gradeClass]}`}>
                    {grade.grade}
                  </span>
                  <span className={styles.score}>{grade.score}%</span>
                  <span className={styles.date}>{grade.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
