import { motion } from 'framer-motion';

const StatCard = ({
    title,
    value,
    change,
    changeType = 'positive', // positive, negative, neutral
    icon: Icon,
    iconColor = 'primary',
    subtitle,
    className = '',
}) => {
    const iconColors = {
        primary: 'from-primary/20 to-primary/5 text-primary',
        emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500',
        amber: 'from-amber-500/20 to-amber-500/5 text-amber-500',
        blue: 'from-blue-500/20 to-blue-500/5 text-blue-500',
        purple: 'from-purple-500/20 to-purple-500/5 text-purple-500',
        red: 'from-red-500/20 to-red-500/5 text-red-500',
    };

    const changeColors = {
        positive: 'text-emerald-500 bg-emerald-500/10',
        negative: 'text-red-500 bg-red-500/10',
        neutral: 'text-gray-500 bg-gray-500/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        bg-white dark:bg-dark-card rounded-2xl p-5
        border border-border-light dark:border-border-dark
        hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/20
        transition-all duration-300
        ${className}
      `}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconColors[iconColor]} flex items-center justify-center`}>
                    {Icon && <Icon className="w-5 h-5" />}
                </div>
                {change !== undefined && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${changeColors[changeType]}`}>
                        {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '→'} {change}
                    </span>
                )}
            </div>

            <div>
                <p className="text-2xl font-bold text-text-primary dark:text-white">{value}</p>
                <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">{title}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
                )}
            </div>
        </motion.div>
    );
};

export default StatCard;
