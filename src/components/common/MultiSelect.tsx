"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function MultiSelect({ options, selectedIds, onChange, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item: string) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectedItems = options.filter((opt: any) => selectedIds.includes(opt._id));
  const filteredOptions = options.filter((opt: any) => opt.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="position-relative" ref={wrapperRef}>
      <div
        className={`form-control bg-white d-flex flex-wrap align-items-center gap-2 px-3 py-2 ${isOpen ? 'border-primary' : ''}`}
        style={{ minHeight: '45px', cursor: 'pointer', border: isOpen ? '1px solid var(--bs-primary)' : '1px solid var(--border-color)', borderRadius: '8px', boxShadow: isOpen ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none', transition: 'all 0.2s' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedItems.length === 0 && <span className="text-muted small">{placeholder}</span>}
        {selectedItems.map((item: any) => (
          <span
            key={item._id}
            className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-flex align-items-center gap-1 py-1 px-2 rounded-pill shadow-sm"
            style={{ fontWeight: '600', fontSize: '0.8rem' }}
            onClick={(e) => { e.stopPropagation(); handleSelect(item._id); }}
          >
            {item.name} <i className="hgi-stroke hgi-cancel-01" style={{ cursor: 'pointer', fontSize: '0.85rem' }}></i>
          </span>
        ))}
        <i className={`hgi-stroke hgi-arrow-down-01 ms-auto ${isOpen ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '0.9rem', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}></i>
      </div>

      {isOpen && (
        <div className="position-absolute w-100 bg-white border border-primary shadow-lg rounded-3 mt-1 py-2" style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
          <div className="px-3 pb-2 mb-1 border-bottom">
            <div className="d-flex align-items-center form-control bg-light px-2 py-1" style={{ borderRadius: '6px', border: 'none' }}>
              <i className="hgi-stroke hgi-search-01 text-muted me-2" style={{ fontSize: '1rem' }}></i>
              <input 
                type="text" 
                className="border-0 bg-transparent w-100 shadow-none text-dark small" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ outline: 'none' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          {filteredOptions.length === 0 ? <div className="p-3 text-muted small text-center">No results found.</div> : null}
          {filteredOptions.map((opt: any) => {
            const isSelected = selectedIds.includes(opt._id);
            return (
              <div
                key={opt._id}
                className="px-3 py-2 d-flex align-items-center gap-2"
                onClick={() => handleSelect(opt._id)}
                style={{ cursor: 'pointer', backgroundColor: isSelected ? 'rgba(13, 110, 253, 0.05)' : 'transparent' }}
              >
                <div className={`d-flex justify-content-center align-items-center rounded ${isSelected ? 'bg-primary border-primary' : 'bg-white border'}`} style={{ width: '16px', height: '16px', border: '1px solid var(--border-color)' }}>
                  {isSelected && <i className="hgi-stroke hgi-checkmark-circle-01 text-white" style={{ fontSize: '0.85rem', lineHeight: 1 }}></i>}
                </div>
                <span className={`small ${isSelected ? 'text-primary fw-bold' : 'text-dark'}`}>{opt.name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
