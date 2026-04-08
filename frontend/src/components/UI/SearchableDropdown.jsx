import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import './SearchableDropdown.css';

const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  searchable = true,
  disabled = false,
  renderOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Each option can be { label, value } or a plain string
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(o => String(o.value) === String(value));

  const filtered = normalizedOptions.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openAbove = spaceBelow < 240 && rect.top > spaceBelow;
    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openAbove
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
  };

  const dropdownPortal = isOpen
    ? ReactDOM.createPortal(
        <div
          className={`sd-dropdown ${className}`}
          ref={dropdownRef}
          style={dropdownStyle}
          onKeyDown={handleKeyDown}
        >
          {searchable && (
            <div className="sd-search-wrap">
              <Search size={14} className="sd-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="sd-search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="sd-search-clear"
                  onClick={() => setSearch('')}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
          <ul className="sd-options">
            {filtered.length > 0 ? (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  className={`sd-option ${String(opt.value) === String(value) ? 'sd-selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {renderOption ? renderOption(opt) : opt.label}
                </li>
              ))
            ) : (
              <li className="sd-no-results">No results found</li>
            )}
          </ul>
        </div>,
        document.body
      )
    : null;

  return (
    <div
      className={`sd-container ${className} ${disabled ? 'sd-disabled' : ''}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <button
        type="button"
        ref={triggerRef}
        className={`sd-trigger ${isOpen ? 'sd-open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className={`sd-value ${!selectedOption ? 'sd-placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={15} className={`sd-chevron ${isOpen ? 'sd-chevron-up' : ''}`} />
      </button>

      {dropdownPortal}
    </div>
  );
};

export default SearchableDropdown;
