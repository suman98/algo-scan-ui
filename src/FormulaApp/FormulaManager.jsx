import React, { useState } from 'react';
import FormulaForm from '../components/FormulaForm';

// Main Formula Manager Component
const FormulaManager = ({ initialFormulas = [], onChange }) => {
  const [formulas, setFormulas] = useState(initialFormulas);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);

  const handleSave = (formula) => {
    let newFormulas;
    if (editingIndex >= 0) {
      newFormulas = [...formulas];
      newFormulas[editingIndex] = formula;
    } else {
      newFormulas = [...formulas, formula];
    }
    setFormulas(newFormulas);
    setShowModal(false);
    setEditingIndex(-1);
    onChange?.(newFormulas);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleDelete = (index) => {
    const newFormulas = formulas.filter((_, i) => i !== index);
    setFormulas(newFormulas);
    onChange?.(newFormulas);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingIndex(-1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Formula List */}
      <div className="space-y-3 mb-4">
        {formulas.map((formula, index) => (
          <div key={index} className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                {/* Name */}
                <h3 className="text-lg font-semibold text-white mb-1 truncate">
                  {formula.name}
                </h3>
                {/* Description */}
                {formula.description && (
                  <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                    {formula.description}
                  </p>
                )}
                {/* Formula */}
                <div className="font-mono text-green-400 text-sm overflow-x-auto bg-slate-900/50 rounded-lg p-2">
                  {formula.equation}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleEdit(index)}
                  className="px-3 py-2 bg-cyan-600/20 text-cyan-400 rounded-lg hover:bg-cyan-600/30 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {formulas.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            No formulas yet. Click "Add New Formula" to create one.
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={() => { setEditingIndex(-1); setShowModal(true); }}
        className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-500 font-bold transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span> Add New Formula
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="border-b-2 border-slate-700 px-6 py-4 bg-slate-800">
              <h2 className="text-xl font-bold text-white">
                {editingIndex >= 0 ? 'Edit Formula' : 'Add New Formula'}
              </h2>
            </div>
            <FormulaForm
              initialData={editingIndex >= 0 ? formulas[editingIndex] : {}}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaManager;
