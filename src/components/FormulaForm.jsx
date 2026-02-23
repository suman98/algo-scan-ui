import React, { useEffect, useState } from "react";
import EquationBuilder from "./EquationBuilder";
import { useRef } from "react";

const FormulaForm = ({ initialData = {}, onSave, onCancel }) => {
  const [name, setName] = useState(initialData.name || "");
  const [description, setDescription] = useState(initialData.description || "");
  const [formulaData, setFormulaData] = useState({
    tokens: initialData.tokens || [],
    equation: initialData.equation || "",
    isValid: false,
    validation: { valid: false, message: "" },
  });
  const [errors, setErrors] = useState({});
  const portalRootRef = useRef(null);
  const [portalRoot, setPortalRoot] = useState(null);

  useEffect(() => {
    if (portalRootRef.current) {
      setPortalRoot(portalRootRef.current);
    }
  }, []);

  const handleFormulaChange = (data) => {
    setFormulaData(data);
    if (errors.formula) {
      setErrors((prev) => ({ ...prev, formula: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!formulaData.tokens || formulaData.tokens.length === 0) {
      newErrors.formula = "Formula is required";
    } else if (!formulaData.isValid) {
      newErrors.formula = formulaData.validation?.message || "Invalid formula";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave({
        name: name.trim(),
        description: description.trim(),
        tokens: formulaData.tokens,
        equation: formulaData.equation,
      });
    }
  };

  return (
    <>
      <style>{`
        .ff-scroll::-webkit-scrollbar { width: 6px; }
        .ff-scroll::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.3); }
        .ff-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4 0%, #0e7490 100%);
          border-radius: 99px;
        }
        .ff-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #22d3ee 0%, #06b6d4 100%);
        }
        .ff-scroll {
          scrollbar-width: thin;
          scrollbar-color: #0e7490 rgba(15, 23, 42, 0.3);
        }
      `}</style>

      {/* ── Root: full height, flex-col ── */}
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">

        {/* ══ SCROLLABLE CONTENT ══ */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* ── Header (scrolls with content) ── */}
          <div className="flex-shrink-0 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
            {/* Title row */}
            <div className="px-3 py-2.5">
              <div className="space-y-0.5">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Formula Details
                </h3>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Give your formula a name and description
                </p>
              </div>
            </div>

            {/* ── Name + Description on the SAME ROW ── */}
            <div className="px-3 pb-3 flex gap-3 items-start">

              {/* Name */}
              <div className="flex-shrink-0 w-56 space-y-1.5">
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                  <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
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
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd" />
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

          {/* ── Scrollable Body ── */}
          <div className="flex-1 ff-scroll overflow-y-auto" style={{ width: "100%" }}>
            <div className="flex gap-0">
              {/* LEFT SIDEBAR (30%) — portal anchor */}
              <div className="w-[50%] flex-shrink-0 border-r border-slate-700/50 bg-slate-900/40 backdrop-blur-sm p-3">
                <div ref={portalRootRef} className="relative z-50" />
              </div>

              {/* RIGHT PANEL — Equation Builder (70%) */}
              <div className="flex-1 flex flex-col">
                {/* Formula error banner */}
                {errors.formula && (
                  <div className="flex-shrink-0 px-3 pt-3">
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-2 backdrop-blur-sm
                      animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-rose-400 text-xs flex items-start gap-1.5 leading-relaxed">
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd" />
                        </svg>
                        <span>{errors.formula}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Builder sub-header */}
                <div className="flex-shrink-0 px-3 pt-3 pb-2.5 border-b border-slate-700/50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Build Your Formula
                      </h3>
                      <p className="text-slate-400 text-[10px] leading-relaxed">
                        Add functions, numbers, and operators to create your equation
                      </p>
                    </div>

                    {/* Token count + validity badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 bg-slate-800/50 backdrop-blur-sm px-2 py-1.5 rounded-lg border border-slate-700/50">
                        <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <div className="text-center">
                          <div className="text-cyan-400 font-mono font-bold text-xs leading-none">
                            {formulaData.tokens.length}
                          </div>
                          <div className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold mt-0.5">
                            Tokens
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
                        formulaData.isValid
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : formulaData.tokens.length > 0
                          ? "bg-rose-500/10 border-rose-500/30"
                          : "bg-slate-800/50 border-slate-700/50"
                      }`}>
                        {formulaData.isValid ? (
                          <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd" />
                          </svg>
                        ) : formulaData.tokens.length > 0 ? (
                          <svg className="w-3 h-3 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        )}
                        <div className="text-center">
                          <div className={`font-bold text-xs leading-none transition-colors duration-300 ${
                            formulaData.isValid ? "text-emerald-400"
                              : formulaData.tokens.length > 0 ? "text-rose-400"
                              : "text-slate-500"
                          }`}>
                            {formulaData.isValid ? "Valid" : formulaData.tokens.length > 0 ? "Invalid" : "Empty"}
                          </div>
                          <div className="text-slate-500 text-[8px] uppercase tracking-wider font-semibold mt-0.5">
                            Status
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equation preview (compact) */}
                  {formulaData.equation && (
                    <div className="mt-2 bg-slate-800/30 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-slate-700/50
                      animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <div className="font-mono text-xs text-emerald-400 truncate leading-relaxed">
                          {formulaData.equation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Equation builder content */}
                <div className="flex-1 p-3">
                  <EquationBuilder
                    initialTokens={initialData.tokens || []}
                    onChange={handleFormulaChange}
                    portalRoot={portalRoot}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ FIXED FOOTER ══ */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-2.5
          border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formulaData.tokens.length === 0 ? (
              <span>Start by adding functions or numbers on the right →</span>
            ) : formulaData.isValid ? (
              <span className="text-emerald-400 font-medium">✓ Formula is ready to save</span>
            ) : (
              <span className="text-rose-400 font-medium">⚠ Please fix validation errors</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700/50 font-medium
                text-sm transition-all duration-200 border border-slate-700/50 hover:border-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg
                hover:from-cyan-500 hover:to-cyan-400 font-semibold text-sm transition-all duration-200
                shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Save Formula
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormulaForm;
