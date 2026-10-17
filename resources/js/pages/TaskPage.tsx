import AppLayout from '@/layouts/AppLayout';
import { createToaster } from "@codenhub/toaster";
import React, { useState, useEffect } from 'react';
import { CheckCircle, ExternalLink, Gift, Users, MessageCircle, Share2, Award, Zap, Clock } from 'lucide-react';
import { useTelegramContext } from '@/providers/TelegramProvider';

const toaster = createToaster({
    position: "top-center",
    duration: 3000,
});

interface Task {
    id: string;
    category: 'daily' | 'social' | 'referral' | 'special';
    title: string;
    description: string;
    reward: number;
    icon: string;
    link?: string | null;
    completed: boolean;
    claimed: boolean;
    can_reset?: boolean;        // Apakah task ini bisa di-reset (daily task)
    next_reset?: number | null; // Unix timestamp kapan bisa claim lagi
    progress?: {
        current: number;
        target: number;
    } | null;
}

interface TaskPageProps {
    tasks: Task[];
}

// Icon mapping
const iconMap: Record<string, any> = {
    Gift,
    MessageCircle,
    Share2,
    Users,
    Zap,
    Award,
};

export default function TaskPage({ tasks: initialTasks }: TaskPageProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [loading, setLoading] = useState<string | null>(null);
    const { refreshDbUser } = useTelegramContext();

    // Fetch task status saat component mount
    const fetchTaskStatus = async () => {
        try {
            const token = localStorage.getItem('telegram_auth_token');
            
            if (!token) {
                console.log('No token found');
                return;
            }
            
            const response = await fetch('/api/telegram/tasks/status', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            console.log('Task status response:', data); // Debug log

            if (data.success) {
                // Update tasks dengan status dari backend
                setTasks(prevTasks =>
                    prevTasks.map(task => {
                        const status = data.data.task_status[task.id];
                        const progress = data.data.task_progress[task.id];
                        
                        console.log(`Task ${task.id} status:`, status); // Debug per task
                        
                        return {
                            ...task,
                            completed: status?.completed || false,
                            claimed: status?.claimed || false,
                            progress: progress || task.progress,
                        };
                    })
                );
            } else {
                console.error('Failed to fetch task status:', data);
            }
        } catch (error) {
            console.error('Error fetching task status:', error);
        }
    };

    // Fetch task status saat component mount
    React.useEffect(() => {
        fetchTaskStatus();
        
        // Auto-refresh setiap 1 menit untuk check reset
        const interval = setInterval(() => {
            fetchTaskStatus();
        }, 60000); // 60 seconds
        
        return () => clearInterval(interval);
    }, []);

    const handleCheckTask = async (taskId: string, link?: string | null) => {
        // Jika ada link (social task), buka channel dan langsung verify
        if (link) {
            window.open(link, '_blank');
            toaster.semantic.info('Opening channel... We will verify your membership shortly.');
        }
        
        // Submit task ke backend untuk verification (baik dengan atau tanpa link)
        try {
            setLoading(taskId);
            
            // Take token from telegramAuthService
            const token = localStorage.getItem('telegram_auth_token');
            
            if (!token) {
                toaster.semantic.error('Please login first');
                return;
            }
            
            // Submit task ke backend
            const response = await fetch(`/api/telegram/tasks/${taskId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();
            
            console.log('Submit response:', data); // Debug log

            if (data.success) {
                // Update task status ke completed (approved)
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, completed: true } : task
                    )
                );
                
                toaster.semantic.success(data.message || 'Task completed successfully!');
            } else {
                toaster.semantic.error(data.message || 'Failed to submit task');
            }
        } catch (error) {
            console.error('Error submitting task:', error);
            toaster.semantic.error('Failed to submit task. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    const handleClaimReward = async (taskId: string) => {
        try {
            setLoading(taskId);
            
            // Take token from telegramAuthService
            const token = localStorage.getItem('telegram_auth_token');
            
            if (!token) {
                toaster.semantic.error('Please login first');
                return;
            }
            
            // Claim reward dari backend
            const response = await fetch(`/api/telegram/tasks/${taskId}/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                // Update task status ke claimed
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskId ? { ...task, claimed: true } : task
                    )
                );
                
                toaster.semantic.success(`Reward claimed! +${data.data.reward} TRX. Wallet balance: ${data.data.new_wallet_balance} TRX`);
                
                // Refresh dbUser untuk update wallet_balance di context
                await refreshDbUser();
            } else {
                toaster.semantic.error(data.message || 'Failed to claim reward');
            }
        } catch (error) {
            console.error('Error claiming reward:', error);
            toaster.semantic.error('Failed to claim reward. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    return (
        <AppLayout>
            <section className="view-container" style={{ display: 'flex' }}>
                
                {/* Tasks Header Card */}
                <div className="tasks-header-card">
                    <h2>Complete Tasks & Earn TRX</h2>
                    <p>Finish missions to unlock rewards and boost your mining power</p>
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
                                loading={loading === task.id}
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
                                loading={loading === task.id}
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
                                loading={loading === task.id}
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
                                loading={loading === task.id}
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
    onCheck: (taskId: string, link?: string | null) => void;
    onClaim: (taskId: string) => void;
    loading?: boolean;
}

function TaskCard({ task, onCheck, onClaim, loading }: TaskCardProps) {
    const Icon = iconMap[task.icon] || Gift;
    const [timeUntilReset, setTimeUntilReset] = useState<string>('');
    
    // Countdown timer untuk daily tasks
    useEffect(() => {
        if (!task.next_reset || !task.claimed) return;
        
        const updateTimer = () => {
            const now = Math.floor(Date.now() / 1000); // Current unix timestamp
            const diff = task.next_reset! - now;
            
            if (diff <= 0) {
                setTimeUntilReset('Ready!');
                return;
            }
            
            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            
            if (hours > 0) {
                setTimeUntilReset(`${hours}h ${minutes}m`);
            } else if (minutes > 0) {
                setTimeUntilReset(`${minutes}m ${seconds}s`);
            } else {
                setTimeUntilReset(`${seconds}s`);
            }
        };
        
        updateTimer(); // Initial update
        const interval = setInterval(updateTimer, 1000);
        
        return () => clearInterval(interval);
    }, [task.next_reset, task.claimed]);
    
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
                    <span className="task-reward-amount">+{Number(task.reward).toFixed(4)} TRX</span>
                </div>
                
                {/* Show reset timer for claimed daily tasks */}
                {task.claimed && task.can_reset && task.next_reset && (
                    <div className="task-reset-timer" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: '#6b7280',
                        marginTop: '4px'
                    }}>
                        <Clock size={14} />
                        <span>Reset in: {timeUntilReset}</span>
                    </div>
                )}
                
                {task.claimed ? (
                    <button className="task-btn task-btn-claimed" disabled>
                        <CheckCircle size={16} strokeWidth={2.5} />
                        Claimed
                    </button>
                ) : task.completed ? (
                    <button 
                        className="task-btn task-btn-claim"
                        onClick={() => onClaim(task.id)}
                        disabled={loading}
                    >
                        <Gift size={16} strokeWidth={2.5} />
                        {loading ? 'Processing...' : 'Claim'}
                    </button>
                ) : (
                    <button 
                        className="task-btn task-btn-check"
                        onClick={() => onCheck(task.id, task.link)}
                        disabled={loading}
                    >
                        {task.link ? (
                            <>
                                <ExternalLink size={16} strokeWidth={2.5} />
                                {loading ? 'Processing...' : 'Go'}
                            </>
                        ) : (
                            <>
                                <CheckCircle size={16} strokeWidth={2.5} />
                                {loading ? 'Processing...' : 'Check'}
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
