import Sidebar from '@/components/Sidebar';
import PageLayout from '@/components/PageLayout';
import styles from './tools.module.scss';

export default function Tools() {
  const tools = [
    {
      name: 'Code Editor',
      description: 'Online IDE for practicing coding exercises',
      icon: '💻',
      status: 'Available'
    },
    {
      name: 'Project Builder',
      description: 'Create and manage your coding projects',
      icon: '🏗️',
      status: 'Available'
    },
    {
      name: 'Code Reviewer',
      description: 'Get feedback on your code submissions',
      icon: '🔍',
      status: 'Available'
    },
    {
      name: 'Performance Tracker',
      description: 'Monitor your learning progress and metrics',
      icon: '📈',
      status: 'Coming Soon'
    },
    {
      name: 'Collaboration Hub',
      description: 'Work together with other students on projects',
      icon: '👥',
      status: 'Coming Soon'
    },
    {
      name: 'Resource Library',
      description: 'Access documentation and learning materials',
      icon: '📚',
      status: 'Available'
    },
  ];

  return (
    <>
      <Sidebar />
      <PageLayout title="Tools">
        <div className={styles.toolsContainer}>
          <div className={styles.toolsHeader}>
            <h2>Learning Tools</h2>
            <p>Enhance your learning experience with our development tools</p>
          </div>

          <div className={styles.toolsGrid}>
            {tools.map((tool, index) => (
              <div key={index} className={styles.toolCard}>
                <div className={styles.toolIcon}>
                  <span>{tool.icon}</span>
                </div>
                <div className={styles.toolContent}>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <span className={`${styles.toolStatus} ${styles[tool.status.replace(' ', '').toLowerCase()]}`}>
                    {tool.status}
                  </span>
                </div>
                <button 
                  className={styles.toolBtn}
                  disabled={tool.status === 'Coming Soon'}
                >
                  {tool.status === 'Coming Soon' ? 'Coming Soon' : 'Launch Tool'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    </>
  );
}