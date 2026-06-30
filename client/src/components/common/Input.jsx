import React from 'react';

export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  textarea = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const baseInputStyles = `w-full px-4 py-2.5 bg-slate-50 border rounded-xl transition-all duration-200 outline-none text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-secondary/20 ${
    error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 focus:border-secondary'
  }`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`${baseInputStyles} resize-none`}
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={baseInputStyles}
          {...props}
        />
      )}
      {error ? (
        <p className="text-xs text-rose-500 font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
