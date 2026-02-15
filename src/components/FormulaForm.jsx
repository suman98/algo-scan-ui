import React, { useState } from 'react';
import EquationBuilder from './EquationBuilder';

const FormulaForm = ({ initialData = {}, onSave, onCancel }) => {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [formulaData, setFormulaData] = useState({
    tokens: initialData.tokens || [],
    equation: initialData.equation || '',
    isValid: false,
    validation: { valid: false, message: '' }
  });
  const [errors, setErrors] = useState({});

  const handleFormulaChange = (data) => {
    setFormulaData(data);
    // Clear formula error when formula changes
    if (errors.formula) {
      setErrors(prev => ({ ...prev, formula: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formulaData.tokens || formulaData.tokens.length === 0) {
      newErrors.formula = 'Formula is required';
    } else if (!formulaData.isValid) {
      newErrors.formula = formulaData.validation?.message || 'Invalid formula';
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
        equation: formulaData.equation
      });
    }
  };

  return (
    <div className="p-6">
      {/* Name Field */}
      <div className="mb-4">
        <label className="block text-slate-400 mb-2 text-sm font-medium">
          Formula Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors(prev => ({ ...prev, name: null }));
          }}
          placeholder="e.g., RSI Overbought Signal"
          className={`w-full px-4 py-3 bg-slate-900 border-2 rounded-lg text-white focus:outline-none ${
            errors.name ? 'border-red-500 focus:border-red-400' : 'border-slate-600 focus:border-cyan-400'
          }`}
        />
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="mb-4">
        <label className="block text-slate-400 mb-2 text-sm font-medium">
          Description <span className="text-slate-600">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this formula does..."
          rows={3}
          className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none resize-none"
        />
      </div>

      {/* Formula Builder */}
      <div className="mb-4">
        <label className="block text-slate-400 mb-2 text-sm font-medium">
          Formula <span className="text-red-400">*</span>
        </label>
        {errors.formula && (
          <p className="text-red-400 text-sm mb-2">{errors.formula}</p>
        )}
        <EquationBuilder
          initialTokens={initialData.tokens || []}
          onChange={handleFormulaChange}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
        <button 
          onClick={onCancel} 
          className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 font-bold"
        >
          Cancel
        </button>
        <button 
          onClick={handleSubmit}
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold"
        >
          Save Formula
        </button>
      </div>
    </div>
  );
};

export default FormulaForm;
