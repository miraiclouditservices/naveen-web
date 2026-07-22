"use client";

import React, { useState, useEffect, useRef } from "react";

interface Option {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  hasError?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  hasError = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Reset search term when closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.id === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id: string) => {
    if (value === id) {
      onChange("");
    } else {
      onChange(id);
    }
    setIsOpen(false);
  };

  return (
    <div className="position-relative w-100" ref={wrapperRef}>
      <div
        className={`form-control bg-white d-flex align-items-center justify-content-between px-3`}
        style={{
          height: "38px",
          cursor: disabled ? "not-allowed" : "pointer",
          border: hasError ? "1px solid #dc2626" : (isOpen ? "1px solid var(--dark-section)" : "1px solid var(--border-color)"),
          borderRadius: "6px",
          boxShadow: hasError ? "0 0 0 3px rgba(220, 38, 38, 0.08)" : (isOpen ? "0 0 0 3px rgba(4, 4, 4, 0.08)" : "none"),
          transition: "all 0.15s ease-in-out",
          backgroundColor: disabled ? "var(--bg-app)" : "#ffffff",
          opacity: disabled ? 0.7 : 1
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span
          className={selectedOption ? "text-dark" : "text-muted"}
          style={{ fontSize: "0.82rem" }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i
          className="bi bi-chevron-down text-muted ms-2"
          style={{
            fontSize: "0.75rem",
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s"
          }}
        />
      </div>

      {isOpen && (
        <div
          className="position-absolute w-100 bg-white border shadow-lg rounded-2 mt-1 py-1"
          style={{
            zIndex: 1300,
            maxHeight: "220px",
            overflowY: "auto",
            borderColor: "var(--dark-section)"
          }}
        >
          <div className="px-2 py-1.5 border-bottom sticky-top bg-white">
            <div
              className="d-flex align-items-center bg-light px-2"
              style={{
                borderRadius: "4px",
                border: "1px solid var(--border-color)",
                height: "30px"
              }}
            >
              <i className="bi bi-search text-muted me-2" style={{ fontSize: "0.8rem" }} />
              <input
                type="text"
                className="border-0 bg-transparent w-100 shadow-none text-dark small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ outline: "none", fontSize: "0.8rem" }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div style={{ maxHeight: "170px", overflowY: "auto" }}>
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-muted text-center" style={{ fontSize: "0.8rem" }}>
                No results found.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === value;
                return (
                  <div
                    key={opt.id}
                    className="px-3 py-2 d-flex align-items-center justify-content-between option-item"
                    onClick={() => handleSelect(opt.id)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: isSelected ? "var(--bg-app)" : "transparent",
                      color: isSelected ? "var(--text-main)" : "var(--text-primary)",
                      fontSize: "0.82rem",
                      fontWeight: isSelected ? "600" : "400"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-app)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <i className="bi bi-check-lg text-dark" style={{ fontSize: "0.85rem" }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
