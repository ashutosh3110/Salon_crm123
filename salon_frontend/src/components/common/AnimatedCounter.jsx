import { useState, useEffect } from 'react';

/**
 * A hook-based animated counter component.
 * @param {number} value - The target number to count to.
 * @param {number} duration - Animation duration in ms (default 2000).
 * @param {string} prefix - Optional prefix (e.g., "$", "₹").
 * @param {string} suffix - Optional suffix (e.g., "%", "+").
 */
export default function AnimatedCounter({ value, duration = 2000, prefix = '', suffix = '', className = '' }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const targetValue = parseFloat(value) || 0;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Ease-out cubic: f(t) = 1 - (1-t)^3
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            setCount(Math.floor(easeProgress * targetValue));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    // Format for thousands separators if needed
    const formattedCount = count.toLocaleString();

    return (
        <span className={className}>
            {prefix}{formattedCount}{suffix}
        </span>
    );
}
