const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`
          ${sizes[size]}
          border-2 border-gray-200 dark:border-gray-700
          border-t-primary
          rounded-full animate-spin
        `}
            />
        </div>
    );
};

export const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-sm text-text-secondary dark:text-gray-400 animate-pulse">Loading...</p>
        </div>
    </div>
);

export default Spinner;
