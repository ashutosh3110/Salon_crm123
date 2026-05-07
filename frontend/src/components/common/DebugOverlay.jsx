import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Trash2, ChevronRight, ChevronLeft, AlertCircle, Bug } from 'lucide-react';

const DebugOverlay = () => {
    const [logs, setLogs] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const addLog = (type, args) => {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            setLogs(prev => [...prev.slice(-100), {
                id: Date.now() + Math.random(),
                type,
                message,
                time: new Date().toLocaleTimeString()
            }]);
        };

        console.log = (...args) => {
            originalLog(...args);
            addLog('log', args);
        };
        console.error = (...args) => {
            originalError(...args);
            addLog('error', args);
        };
        console.warn = (...args) => {
            originalWarn(...args);
            addLog('warn', args);
        };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '10px',
                    zIndex: 99999,
                    background: 'rgba(0,0,0,0.8)',
                    color: '#C8956C',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #C8956C',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
            >
                <Bug size={20} />
            </button>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: isMinimized ? '40px' : '80%',
                height: '100vh',
                background: 'rgba(0,0,0,0.9)',
                color: '#fff',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                borderLeft: '1px solid #333',
                fontFamily: 'monospace',
                fontSize: '10px',
                transition: 'width 0.3s ease'
            }}
        >
            <div style={{
                padding: '10px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#111'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Terminal size={14} color="#C8956C" />
                    {!isMinimized && <span style={{ fontWeight: 'bold' }}>APK LOGS</span>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setIsMinimized(!isMinimized)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                        {isMinimized ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                    {!isMinimized && (
                        <>
                            <button onClick={() => setLogs([])} style={{ background: 'none', border: 'none', color: '#fff' }}>
                                <Trash2 size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                                <X size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {!isMinimized && (
                <div 
                    ref={scrollRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}
                >
                    {logs.length === 0 && (
                        <div style={{ opacity: 0.3, textAlign: 'center', marginTop: '20px' }}>No logs yet...</div>
                    )}
                    {logs.map(log => (
                        <div key={log.id} style={{
                            borderBottom: '1px solid #222',
                            paddingBottom: '4px',
                            color: log.type === 'error' ? '#ff5252' : log.type === 'warn' ? '#ffb142' : '#eee'
                        }}>
                            <span style={{ opacity: 0.5, marginRight: '6px' }}>[{log.time}]</span>
                            <span style={{ fontWeight: log.type !== 'log' ? 'bold' : 'normal' }}>
                                {log.message}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DebugOverlay;
