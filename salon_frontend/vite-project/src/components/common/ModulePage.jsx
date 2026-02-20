import { motion } from 'framer-motion';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

/**
 * Generates a placeholder page for modules not yet fully implemented
 */
const ModulePage = ({ title, description, icon: Icon, children }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary dark:text-white">{title}</h1>
                        {description && (
                            <p className="text-text-secondary dark:text-gray-400 mt-0.5">{description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {children}
        </motion.div>
    );
};

export default ModulePage;
