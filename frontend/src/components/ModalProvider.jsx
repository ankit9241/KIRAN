import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import Modal from "./Modal";

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalProps, setModalProps] = useState({ isOpen: false });
  const resolverRef = useRef(null);

  // showModal returns a promise that resolves to true (confirm) or false (cancel)
  const showModal = useCallback(({ title, message, icon, confirmText, cancelText, showCancel = false }) => {
    setModalProps({
      isOpen: true,
      title,
      message,
      icon,
      confirmText,
      cancelText,
      showCancel,
      onConfirm: () => {
        setModalProps(m => ({ ...m, isOpen: false }));
        if (resolverRef.current) {
          console.log('Modal confirmed');
          resolverRef.current(true);
        }
      },
      onCancel: () => {
        setModalProps(m => ({ ...m, isOpen: false }));
        if (resolverRef.current) {
          console.log('Modal cancelled');
          resolverRef.current(false);
        }
      },
    });
    return new Promise(resolve => {
      resolverRef.current = resolve;
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalProps(m => ({ ...m, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
    }
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal {...modalProps} />
    </ModalContext.Provider>
  );
}; 