import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setVisible(true);
    setTimeout(() => setVisible(false), duration);
  }, []);

  const hideToast = () => setVisible(false);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && visible && (
        <div className={`toast toast-${toast.type}`} onClick={hideToast}>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={hideToast}>&times;</button>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider; 