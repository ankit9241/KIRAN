import React from "react";

const Modal = ({ isOpen, title, message, icon, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel", showCancel = false }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative animate-fadeIn">
        {icon && <div className="flex justify-center mb-3 text-3xl">{icon}</div>}
        {title && <h2 className="text-xl font-bold text-center mb-2">{title}</h2>}
        <div className="text-gray-700 text-center mb-6">{message}</div>
        <div className="flex justify-center gap-4">
          {showCancel && (
            <button
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal; 