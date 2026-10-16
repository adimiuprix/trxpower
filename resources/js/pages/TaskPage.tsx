import AppLayout from '@/layouts/AppLayout';
import { useState } from 'react';
import { CheckCircle, ExternalLink, Gift, Users, MessageCircle, Share2, Award, Zap } from 'lucide-react';

interface Task {
    id: string;
    category: 'daily' | 'social' | 'referral' | 'special';
    title: string;
    description: string;
    reward: number;
    icon: any;
    link?: string;
    completed: boolean;
    claimed: boolean;
    progress?: {
        current: number;
        target: number;
    };
}

export default function TaskPage() {
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            category: 'daily',
            title: 'Daily Login Bonus',
            description: 'Login to the app today',
            reward: 50,
            icon: Gift,
            completed: true,
            claimed: false,
        },
        {
            id: '2',
            category: 'social',
            title: 'Join Telegram Channel',
            description: 'Subscribe to our official channel',
            reward: 500,
            icon: MessageCircle,
            link: 'https://t.me/trxpower',
            completed: false,
            claimed: false,
        },
        {
            id: '3',
            category: 'social',
            title: 'Follow Twitter Account',
            description: 'Follow @TRXPower on Twitter',
            reward: 300,
            icon: Share2,
            link: 'https://twitter.com/trxpower',
            completed: false,
            claimed: false,
        },
        {
            id: '4',
            category: 'referral',
            title: 'Invite 5 Friends',
            description: 'Share your referral link',
            reward: 1000,
            icon: Users,
            completed: false,
            claimed: false,
            progress: {
                current: 2,
                target: 5,
            },
        },
        {
            id: '5',
            category: 'special',
            title: 'First Deposit Bonus',
            description: 'Make your first deposit',
            reward: 2000,
            icon: Zap,
            completed: false,
            claimed: false,
        },
        {
            id: '6',
            category: 'daily',
            title: 'Complete 3 Mining Sessions',
            description: 'Mine TRX 3 times today',
            reward: 100,
            icon: Award,
            completed: false,
            claimed: false,
            progress: {
                current: 1,
                target: 3,
            },
        },
    ]);

    const handleCheckTask = (taskId: string, link?: string) => {
        if (link) {
            window.open(link, '_blank');
        }
        
        // Simulate task completion check
        setTimeout(() => {
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, completed: true } : task
                )
            );
        }, 1000);
    };

    const handleClaimReward = (taskId: string) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, claimed: true } : task
            )
        );
    };

    const totalRewards = tasks.reduce((sum, task) => sum + (task.completed && !task.claimed ? task.reward : 0), 0);
    const completedCount = tasks.filter(task => task.completed).length;

    return (
        <AppLayout>
            <section className="view-container" style={{ display: 'flex' }}>
                
                {/* Tasks Header Card */}
                <div className="tasks-header-card">
                    <h2>Complete Tasks & Earn TRX</h2>
                    <p>Finish missions to unlock rewards and boost your mining power</p>
                </div>

                {/* Stats Bar */}
                <div className="tasks-stats-row">
                    <div className="tasks-stat-box">
                        <span className="tasks-stat-label">Completed</span>
                        <span className="tasks-stat-value">{completedCount}/{tasks.length}</span>
                    </div>
                    <div className="tasks-stat-divider"></div>
                    <div className="tasks-stat-box">
                        <span className="tasks-stat-label">Available</span>
                        <span className="tasks-stat-value tasks-stat-highlight">{totalRewards} TRX</span>
                    </div>
                </div>

                {/* Daily Tasks Section */}
                <div className="task-section">
                    <div className="task-section-header">
                        <h3 className="task-section-title">Daily Tasks</h3>
                        <span className="task-section-badge">
                            {tasks.filter(t => t.category === 'daily' && t.completed).length}/
                            {tasks.filter(t => t.category === 'daily').length}
                        </span>
                    </div>
                    
                    <div className="task-list">
                        {tasks.filter(task => task.category === 'daily').map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onCheck={handleCheckTask}
                                onClaim={handleClaimReward}
                            />
                        ))}
                    </div>
                </div>

                {/* Social Tasks Section */}
                <div className="task-section">
                    <div className="task-section-header">
                        <h3 className="task-section-title">Social Tasks</h3>
                        <span className="task-section-badge">
                            {tasks.filter(t => t.category === 'social' && t.completed).length}/
                            {tasks.filter(t => t.category === 'social').length}
                        </span>
                    </div>
                    
                    <div className="task-list">
                        {tasks.filter(task => task.category === 'social').map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onCheck={handleCheckTask}
                                onClaim={handleClaimReward}
                            />
                        ))}
                    </div>
                </div>

                {/* Referral Tasks Section */}
                <div className="task-section">
                    <div className="task-section-header">
                        <h3 className="task-section-title">Referral Tasks</h3>
                        <span className="task-section-badge">
                            {tasks.filter(t => t.category === 'referral' && t.completed).length}/
                            {tasks.filter(t => t.category === 'referral').length}
                        </span>
                    </div>
                    
                    <div className="task-list">
                        {tasks.filter(task => task.category === 'referral').map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onCheck={handleCheckTask}
                                onClaim={handleClaimReward}
                            />
                        ))}
                    </div>
                </div>

                {/* Special Tasks Section */}
                <div className="task-section">
                    <div className="task-section-header">
                        <h3 className="task-section-title">Special Tasks</h3>
                        <span className="task-section-badge task-badge-special">Limited</span>
                    </div>
                    
                    <div className="task-list">
                        {tasks.filter(task => task.category === 'special').map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onCheck={handleCheckTask}
                                onClaim={handleClaimReward}
                            />
                        ))}
                    </div>
                </div>

            </section>
        </AppLayout>
    );
}

interface TaskCardProps {
    task: Task;
    onCheck: (taskId: string, link?: string) => void;
    onClaim: (taskId: string) => void;
}

function TaskCard({ task, onCheck, onClaim }: TaskCardProps) {
    const Icon = task.icon;
    
    return (
        <div className={`task-card ${task.completed ? 'task-completed' : ''} ${task.claimed ? 'task-claimed' : ''}`}>
            <div className="task-card-left">
                <div className={`task-icon-circle task-icon-${task.category}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>
                
                <div className="task-info">
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    
                    {task.progress && (
                        <div className="task-progress-row">
                            <div className="task-progress-bar">
                                <div 
                                    className="task-progress-fill" 
                                    style={{ width: `${(task.progress.current / task.progress.target) * 100}%` }}
                                ></div>
                            </div>
                            <span className="task-progress-text">
                                {task.progress.current}/{task.progress.target}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="task-card-right">
                <div className="task-reward-box">
                    <span className="task-reward-label">Reward</span>
                    <span className="task-reward-amount">+{task.reward} TRX</span>
                </div>
                
                {task.claimed ? (
                    <button className="task-btn task-btn-claimed" disabled>
                        <CheckCircle size={16} strokeWidth={2.5} />
                        Claimed
                    </button>
                ) : task.completed ? (
                    <button 
                        className="task-btn task-btn-claim"
                        onClick={() => onClaim(task.id)}
                    >
                        <Gift size={16} strokeWidth={2.5} />
                        Claim
                    </button>
                ) : (
                    <button 
                        className="task-btn task-btn-check"
                        onClick={() => onCheck(task.id, task.link)}
                    >
                        {task.link ? (
                            <>
                                <ExternalLink size={16} strokeWidth={2.5} />
                                Go
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} strokeWidth={2.5} />
                                Check
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}