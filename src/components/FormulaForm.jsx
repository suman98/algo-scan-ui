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
    // Clear formula error when formula changes
    if (errors.formula) {
      setErrors((prev) => ({ ...prev, formula: null }));
    }
  };



  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

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
    <div className="flex flex-col h-full">
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Side - Equation Builder (70%) */}
        <div className="flex-[7] space-y-6 overflow-y-auto">
          {/* Name Field */}
          <div>
            <label className="block text-slate-400 mb-2 text-sm font-medium">
              Formula Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              placeholder="e.g., RSI Overbought Signal"
              className={`w-full px-4 py-3 bg-slate-900 border-2 rounded-lg text-white focus:outline-none ${
                errors.name
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-600 focus:border-cyan-400"
              }`}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-slate-400 mb-2 text-sm font-medium">
              Description <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this formula does..."
              rows={6}
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>
          <div ref={portalRootRef}></div>
          {/* Formula Error */}
          {errors.formula && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{errors.formula}</p>
            </div>
          )}

          {/* Formula Summary */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h3 className="text-slate-400 text-sm font-semibold mb-2">Formula Summary</h3>
            <div className="text-slate-300 text-sm space-y-1">
              <div>Tokens: <span className="text-cyan-400">{formulaData.tokens.length}</span></div>
              <div>Status: {formulaData.isValid ? (
                <span className="text-green-400">✓ Valid</span>
              ) : (
                <span className="text-red-400">✗ Invalid</span>
              )}</div>
            </div>
          </div>
        </div>
        <div className="flex-[3] overflow-y-auto">

          <EquationBuilder
            initialTokens={initialData.tokens || []}
            onChange={handleFormulaChange}
            portalRoot={portalRoot}
          />
        </div>

        {/* Right Side - Form Fields (30%) */}
      
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div className="flex gap-3 justify-end p-6 border-t-2 border-slate-700 bg-slate-800">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 font-bold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold transition-colors"
        >
          Save Formula
        </button>
      </div>
    </div>
  );
};

export default FormulaForm;
