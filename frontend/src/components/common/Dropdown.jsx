import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

function Dropdown({
  trigger,
  children,
  align = 'right', // 'left' | 'right'
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`dropdown-root ${className}`} ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={() => setIsOpen((prev) => !prev)}>
        {typeof trigger === 'function' ? trigger({ isOpen }) : trigger}
      </div>

      {isOpen && (
        <div className={`dropdown-menu dropdown-align-${align}`} onClick={() => setIsOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
