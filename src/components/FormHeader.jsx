import React from "react";

const FormHeader = ({ name, setName, description, setDescription, errors, setErrors }) => {
  return (
    <div className="shrink-0 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      {/* Title row */}
      <div className="px-3 py-2.5">
        <div className="space-y-0.5">
          <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Formula Details
          </h3>
          <p className="text-slate-400 text-[10px] leading-relaxed">
            Give your formula a name and description
          </p>
        </div>
      </div>

      {/* Name + Description on the SAME ROW */}
      <div className="px-3 pb-3 flex gap-3 items-start">
        {/* Name */}
        <div className="shrink-0 w-56 space-y-1.5">
          <label className="flex items-center gap-1 text-xs font-semibold text-slate-300">
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            Name
            <span className="text-rose-400 text-xs">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            placeholder="e.g., RSI Overbought Signal"
            className={`w-full px-2.5 py-2 bg-slate-800/50 backdrop-blur-sm border rounded-lg text-white text-sm
              placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
              errors.name
                ? "border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500"
                : "border-slate-700/50 focus:border-cyan-500/50 focus:ring-cyan-500/20"
            }`}
          />
          {errors.name && (
            <p className="text-rose-400 text-xs flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.name}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-slate-700/50 mt-5" />

        {/* Description */}
        <div className="flex-1 space-y-1.5">
          <label className="flex items-center gap-1 text-xs font-semibold text-slate-300">
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Description
            <span className="text-slate-600 text-[10px] font-normal">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this formula does..."
            rows={2}
            className="w-full px-2.5 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg
              text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2
              focus:border-cyan-500/50 focus:ring-cyan-500/20 resize-none transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default FormHeader;
