import { useEffect, useState, useRef } from 'react';
// import eruda from 'eruda';
import { Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileDebugger = () => {
    // const [isVisible, setIsVisible] = useState(false);
    // const [isReady, setIsReady] = useState(false);
    // const initialized = useRef(false);

    // useEffect(() => {
    //     if (initialized.current) return;
    //     initialized.current = true;

    //     try {
    //         eruda.init({
    //             tool: ['console', 'network', 'resources', 'elements', 'info'],
    //             useShadowDom: true
    //         });

    //         // Hide eruda default button via CSS
    //         const style = document.createElement('style');
    //         style.innerHTML = '.eruda-entry-btn { display: none !important; }';
    //         document.head.appendChild(style);

    //         // Give eruda a moment to build its internal UI
    //         setTimeout(() => {
    //             setIsReady(true);
    //         }, 500);
    //     } catch (e) {
    //         console.error("Eruda init error:", e);
    //     }

    //     return () => {
    //         // Optional: eruda.destroy();
    //     };
    // }, []);

    // const toggleDebugger = () => {
    //     if (!isReady) return;

    //     try {
    //         if (!isVisible) {
    //             if (typeof eruda.show === 'function') {
    //                 eruda.show();
    //                 setIsVisible(true);
    //             }
    //         } else {
    //             if (typeof eruda.hide === 'function') {
    //                 eruda.hide();
    //                 setIsVisible(false);
    //             }
    //         }
    //     } catch (e) {
    //         console.error("Eruda toggle error:", e);
    //     }
    // };

    return null;

    // return (
    //     <motion.button
    //         drag
    //         dragConstraints={{ left: -20, right: 20, top: -500, bottom: 20 }}
    //         dragElastic={0.1}
    //         whileTap={{ scale: 0.9 }}
    //         onClick={toggleDebugger}
    //         disabled={!isReady}
    //         style={{
    //             position: 'fixed',
    //             bottom: '100px',
    //             right: '20px',
    //             width: '48px',
    //             height: '48px',
    //             borderRadius: '50%',
    //             background: isReady ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)',
    //             backdropFilter: 'blur(12px)',
    //             border: '1px solid rgba(255, 255, 255, 0.2)',
    //             color: isReady ? '#C8956C' : '#666',
    //             display: 'flex',
    //             alignItems: 'center',
    //             justifyContent: 'center',
    //             zIndex: 9999999,
    //             boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    //             cursor: isReady ? 'grab' : 'not-allowed',
    //             opacity: isReady ? 1 : 0.5,
    //             touchAction: 'none' // Important for dragging
    //         }}
    //         className="debug-toggle-btn"
    //     >
    //         <Terminal size={22} />
    //     </motion.button>
    // );
};

export default MobileDebugger;
