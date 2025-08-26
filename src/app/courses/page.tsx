import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import styles from './courses.module.scss';

export default function Courses() {
  const courses = [
    { 
      title: 'JavaScript Fundamentals', 
      progress: 100, 
      status: 'Completed',
      duration: '40 hours',
      level: 'Beginner'
    },
    { 
      title: 'React Development', 
      progress: 75, 
      status: 'In Progress',
      duration: '60 hours',
      level: 'Intermediate'
    },
    { 
      title: 'Node.js Backend', 
      progress: 45, 
      status: 'In Progress',
      duration: '50 hours',
      level: 'Intermediate'
    },
    { 
      title: 'Database Design', 
      progress: 0, 
      status: 'Not Started',
      duration: '35 hours',
      level: 'Beginner'
    },
  ];

  return (
    <>
      <Sidebar />
      <PageLayout title="Courses">
        <div className={styles.coursesContainer}>
          <div className={styles.coursesHeader}>
            <h2>My Learning Path</h2>
            <p>Track your progress across all enrolled courses</p>
          </div>

          <div className={styles.coursesGrid}>
            {courses.map((course, index) => (
              <div key={index} className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <h3>{course.title}</h3>
                  <span className={`${styles.status} ${styles[course.status.replace(' ', '').toLowerCase()]}`}>
                    {course.status}
                  </span>
                </div>
                
                <div className={styles.courseProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className={styles.progressText}>{course.progress}%</span>
                </div>

                <div className={styles.courseDetails}>
                  <div className={styles.detail}>
                    <span className={styles.detailIcon}>⏱️</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailIcon}>📊</span>
                    <span>{course.level}</span>
                  </div>
                </div>

                <button className={styles.continueBtn}>
                  {course.progress === 0 ? 'Start Course' : 
                   course.progress === 100 ? 'Review' : 'Continue'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    </>
  );
}