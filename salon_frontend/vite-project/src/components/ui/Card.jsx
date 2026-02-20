const Card = ({
    children,
    className = '',
    padding = 'md',
    hover = false,
    gradient = false,
    onClick,
}) => {
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            onClick={onClick}
            className={`
        bg-white dark:bg-dark-card
        rounded-2xl
        border border-border-light dark:border-border-dark
        ${paddings[padding]}
        ${hover ? 'hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 cursor-pointer' : ''}
        ${gradient ? 'bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-dark-bg' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default Card;
