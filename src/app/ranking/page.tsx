import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import styles from './ranking.module.scss';

export default function Ranking() {
  const leaderboard = [
    { rank: 1, name: 'Alex Johnson', points: 2450, badge: '🥇' },
    { rank: 2, name: 'Sarah Chen', points: 2380, badge: '🥈' },
    { rank: 3, name: 'Mike Rodriguez', points: 2290, badge: '🥉' },
    { rank: 4, name: 'Emma Wilson', points: 2150, badge: '' },
    { rank: 5, name: 'David Kim', points: 2080, badge: '' },
    { rank: 6, name: 'Lisa Thompson', points: 1950, badge: '' },
    { rank: 7, name: 'You', points: 1890, badge: '', isCurrentUser: true },
    { rank: 8, name: 'John Davis', points: 1820, badge: '' },
    { rank: 9, name: 'Maria Garcia', points: 1750, badge: '' },
    { rank: 10, name: 'Tom Anderson', points: 1680, badge: '' },
  ];

  const achievements = [
    { title: 'First Course Completed', icon: '🎓', earned: true },
    { title: 'Week Streak', icon: '🔥', earned: true },
    { title: 'Perfect Score', icon: '💯', earned: true },
    { title: 'Top 10 Ranking', icon: '🏆', earned: false },
    { title: 'Mentor Helper', icon: '🤝', earned: false },
    { title: 'Code Master', icon: '👨‍💻', earned: false },
  ];

  return (
    <>
      <Sidebar />
      <PageLayout title="Ranking">
        <div className={styles.rankingContainer}>
          <div className={styles.userStats}>
            <div className={styles.currentRank}>
              <h3>Your Current Rank</h3>
              <div className={styles.rankDisplay}>
                <span className={styles.rankNumber}>#7</span>
                <span className={styles.rankPoints}>1,890 points</span>
              </div>
            </div>
            
            <div className={styles.achievements}>
              <h3>Achievements</h3>
              <div className={styles.achievementGrid}>
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`${styles.achievement} ${achievement.earned ? styles.earned : styles.locked}`}
                  >
                    <span className={styles.achievementIcon}>{achievement.icon}</span>
                    <span className={styles.achievementTitle}>{achievement.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.leaderboard}>
            <h3>Global Leaderboard</h3>
            <div className={styles.leaderboardList}>
              {leaderboard.map((user, index) => (
                <div 
                  key={index} 
                  className={`${styles.leaderboardItem} ${user.isCurrentUser ? styles.currentUser : ''}`}
                >
                  <div className={styles.userRank}>
                    <span className={styles.rankBadge}>{user.badge}</span>
                    <span className={styles.rankText}>#{user.rank}</span>
                  </div>
                  <span className={styles.userName}>{user.name}</span>
                  <span className={styles.userPoints}>{user.points.toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    </>
  );
}