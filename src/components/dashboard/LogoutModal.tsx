"use client";

import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 10000,
      backdropFilter: 'blur(10px)', animation: 'fadeIn 0.2s ease-out'
    }}>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      
      <div className="bg-white rounded-2xl shadow-2xl p-5 text-center" style={{ width: '400px', animation: 'slideUp 0.3s ease-out' }}>
        <div className="mb-4 d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle" style={{ width: '80px', height: '80px' }}>
          <i className="bi bi-box-arrow-right display-4 text-danger"></i>
        </div>
        
        <h3 className="fw-bold text-dark mb-2" style={{ letterSpacing: '-0.02em' }}>Confirm Logout</h3>
        <p className="text-muted small mb-4 px-3">Are you sure you want to end your session? You will need to re-authenticate to access the global command center.</p>
        
        <div className="d-flex gap-3">
          <button 
            className="btn btn-light rounded-pill flex-grow-1 py-3 fw-bold border-0 transition-all hover-lift" 
            onClick={onClose}
            style={{ fontSize: '0.85rem' }}
          >
            Stay Signed In
          </button>
          <button 
            className="btn btn-danger rounded-pill flex-grow-1 py-3 fw-bold shadow-lg transition-all hover-lift"
            onClick={onConfirm}
            style={{ fontSize: '0.85rem' }}
          >
            End Session
          </button>
        </div>
      </div>
      
      <style jsx global>{`
        .rounded-2xl { border-radius: 1.5rem !important; }
        .hover-lift:hover { transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
