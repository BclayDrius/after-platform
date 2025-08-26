import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import styles from './profile.module.scss';

export default function Profile() {
  return (
    <>
      <Sidebar />
      <PageLayout title="Profile">
        <div className={styles.profileContainer}>
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profileAvatar}>
                <span>👤</span>
              </div>
              <div className={styles.profileInfo}>
                <h2>Student Name</h2>
                <p>student@afterlifeacademy.com</p>
                <span className={styles.memberSince}>Member since January 2024</span>
              </div>
            </div>
            
            <div className={styles.profileStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>5</span>
                <span className={styles.statLabel}>Courses Completed</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>120</span>
                <span className={styles.statLabel}>Hours Studied</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>85%</span>
                <span className={styles.statLabel}>Average Score</span>
              </div>
            </div>
          </div>

          <div className={styles.settingsCard}>
            <h3>Account Settings</h3>
            <div className={styles.settingItem}>
              <span>Email Notifications</span>
              <button className={styles.toggleBtn}>Enabled</button>
            </div>
            <div className={styles.settingItem}>
              <span>Course Reminders</span>
              <button className={styles.toggleBtn}>Enabled</button>
            </div>
            <div className={styles.settingItem}>
              <span>Progress Reports</span>
              <button className={styles.toggleBtn}>Weekly</button>
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}