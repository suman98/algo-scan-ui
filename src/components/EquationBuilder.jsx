import React, { useState, useRef, useEffect } from 'react';
import FUNCTIONS from '../data/functions.json';

// Constants
const OPERATOR_DISPLAY = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  '>': '>',
  '<': '<',
  '>=': '≥',
  '<=': '≤',
  '==': '==',
  '!=': '≠'
};

const SOURCE_OPTIONS = ['OPEN', 'HIGH', 'LOW', 'CLOSE'];

const EquationBuilder = ({ initialTokens = [], onChange }) => {
  const [tokens, setTokens] = useState(initialTokens);
  const [searchValue, setSearchValue] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [numberValue, setNumberValue] = useState('');
  
  // Modal states
  const [showFunctionModal, setShowFunctionModal] = useState(false);
  const [currentFunction, setCurrentFunction] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [editingTokenIndex, setEditingTokenIndex] = useState(-1);
  
  // Popup states
  const [operatorPopup, setOperatorPopup] = useState({ show: false, index: -1, position: { x: 0, y: 0 } });
  const [numberPopup, setNumberPopup] = useState({ show: false, index: -1, position: { x: 0, y: 0 }, value: '' });
  
  const inputRef = useRef(null);

  // Notify parent of changes
  useEffect(() => {
    const equation = tokens.map(t => t.value).join(' ');
    const validation = validateBooleanFormula();
    onChange?.({ tokens, equation, isValid: validation.valid, validation });
  }, [tokens]);

  const filteredFunctions = Object.keys(FUNCTIONS).filter(
    name => name.toUpperCase().includes(searchValue.toUpperCase())
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowAutocomplete(value.length > 0 && filteredFunctions.length > 0);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!showAutocomplete) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredFunctions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFunctions[selectedIndex]) {
        selectFunction(filteredFunctions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false);
    }
  };

  const selectFunction = (funcName) => {
    setCurrentFunction(funcName);
    const func = FUNCTIONS[funcName];
    const initialParams = {};
    func.params.forEach(p => {
      initialParams[p.name] = p.default;
    });
    setParamValues(initialParams);
    setEditingTokenIndex(-1);
    setShowFunctionModal(true);
    setShowAutocomplete(false);
    setSearchValue('');
  };

  const editFunctionToken = (index) => {
    const token = tokens[index];
    if (token.type !== 'function') return;
    
    const match = token.value.match(/^(\w+)\((.*)\)$/);
    if (!match) return;
    
    const funcName = match[1];
    const paramString = match[2];
    const paramValuesList = paramString.split(',').map(s => s.trim());
    
    setCurrentFunction(funcName);
    setEditingTokenIndex(index);
    
    const func = FUNCTIONS[funcName];
    const params = {};
    func.params.forEach((p, i) => {
      params[p.name] = paramValuesList[i] !== undefined ? paramValuesList[i] : p.default;
    });
    setParamValues(params);
    setShowFunctionModal(true);
  };

  const confirmFunction = () => {
    if (!currentFunction) return;
    
    const func = FUNCTIONS[currentFunction];
    const values = func.params.map(p => paramValues[p.name]);
    const functionCall = `${currentFunction}(${values.join(', ')})`;
    
    const newTokens = [...tokens];
    if (editingTokenIndex >= 0) {
      newTokens[editingTokenIndex].value = functionCall;
    } else {
      newTokens.push({ type: 'function', value: functionCall });
    }
    setTokens(newTokens);
    closeFunctionModal();
  };

  const closeFunctionModal = () => {
    setShowFunctionModal(false);
    setCurrentFunction(null);
    setParamValues({});
    setEditingTokenIndex(-1);
  };

  const addOperator = (op) => {
    if (tokens.length === 0) return;
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === 'operator' || lastToken.type === 'comparison') return;
    
    const isComparison = ['>', '<', '>=', '<=', '==', '!='].includes(op);
    setTokens([...tokens, { type: isComparison ? 'comparison' : 'operator', value: op }]);
  };

  const addNumber = () => {
    if (!numberValue || isNaN(parseFloat(numberValue))) return;
    if (tokens.length > 0) {
      const lastToken = tokens[tokens.length - 1];
      if (lastToken.type === 'function' || lastToken.type === 'number') return;
    }
    setTokens([...tokens, { type: 'number', value: numberValue }]);
    setNumberValue('');
  };

  const deleteToken = (index) => {
    setTokens(tokens.filter((_, i) => i !== index));
  };

  const handleTokenClick = (index, e, type) => {
    const rect = e.target.getBoundingClientRect();
    const position = { x: rect.left, y: rect.bottom + 5 };
    
    if (type === 'function') {
      editFunctionToken(index);
    } else if (type === 'number') {
      setNumberPopup({ show: true, index, position, value: tokens[index].value });
    } else {
      setOperatorPopup({ show: true, index, position });
    }
  };

  const updateOperator = (newOp) => {
    const newTokens = [...tokens];
    const isComparison = ['>', '<', '>=', '<=', '==', '!='].includes(newOp);
    newTokens[operatorPopup.index] = { type: isComparison ? 'comparison' : 'operator', value: newOp };
    setTokens(newTokens);
    setOperatorPopup({ show: false, index: -1, position: { x: 0, y: 0 } });
  };

  const updateNumber = () => {
    if (!numberPopup.value || isNaN(parseFloat(numberPopup.value))) return;
    const newTokens = [...tokens];
    newTokens[numberPopup.index].value = numberPopup.value;
    setTokens(newTokens);
    setNumberPopup({ show: false, index: -1, position: { x: 0, y: 0 }, value: '' });
  };

  const getPreview = () => {
    if (!currentFunction) return '';
    const func = FUNCTIONS[currentFunction];
    const values = func.params.map(p => paramValues[p.name]);
    return `${currentFunction}(${values.join(', ')})`;
  };

  // Validate that formula is a boolean equation
  const validateBooleanFormula = () => {
    if (tokens.length === 0) return { valid: false, message: 'Formula is empty' };
    
    const comparisonIndex = tokens.findIndex(t => t.type === 'comparison');
    if (comparisonIndex === -1) {
      return { valid: false, message: 'Formula must contain a comparison operator (>, <, ≥, ≤, ==, ≠)' };
    }
    
    const leftSide = tokens.slice(0, comparisonIndex);
    const hasLeftOperand = leftSide.some(t => t.type === 'function' || t.type === 'number');
    if (!hasLeftOperand) {
      return { valid: false, message: 'Missing left side of comparison' };
    }
    
    const rightSide = tokens.slice(comparisonIndex + 1);
    const hasRightOperand = rightSide.some(t => t.type === 'function' || t.type === 'number');
    if (!hasRightOperand) {
      return { valid: false, message: 'Missing right side of comparison' };
    }
    
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === 'operator' || lastToken.type === 'comparison') {
      return { valid: false, message: 'Formula cannot end with an operator' };
    }
    
    return { valid: true, message: '' };
  };
  
  const validation = validateBooleanFormula();
  const isValidBooleanFormula = validation.valid;

  return (
    <div>
      {/* Equation Display */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 mb-4 min-h-[60px] font-mono text-green-400">
        {tokens.length === 0 ? (
          <span className="text-slate-500">Click on functions to build your equation</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tokens.map((token, index) => (
              <span
                key={index}
                onClick={(e) => handleTokenClick(index, e, token.type)}
                className={`
                  px-3 py-2 rounded-md cursor-pointer transition-all border-2 border-transparent hover:border-cyan-400
                  ${token.type === 'function' ? 'bg-indigo-900/50 text-cyan-400' : ''}
                  ${token.type === 'operator' ? 'bg-green-900/50 text-green-400' : ''}
                  ${token.type === 'comparison' ? 'bg-red-900/50 text-red-400' : ''}
                  ${token.type === 'number' ? 'bg-purple-900/50 text-purple-300' : ''}
                `}
              >
                {token.type === 'operator' || token.type === 'comparison' 
                  ? OPERATOR_DISPLAY[token.value] || token.value 
                  : token.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-slate-800 rounded-xl p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => searchValue && setShowAutocomplete(true)}
              placeholder="Type function name (e.g., EMA, RSI...)"
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
            />
            {showAutocomplete && (
              <div className="absolute top-full left-0 right-0 bg-slate-800 border-2 border-slate-600 border-t-0 rounded-b-lg max-h-60 overflow-y-auto z-50">
                {filteredFunctions.map((name, i) => (
                  <div
                    key={name}
                    onClick={() => selectFunction(name)}
                    className={`px-4 py-3 cursor-pointer border-b border-slate-700 hover:bg-slate-700 ${i === selectedIndex ? 'bg-slate-700' : ''}`}
                  >
                    <div className="text-cyan-400 font-bold">{name}</div>
                    <div className="text-slate-500 text-sm">({FUNCTIONS[name].params.map(p => p.name).join(', ')})</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <span className="text-slate-500 font-bold">or</span>

          <div className="flex gap-2">
            <input
              type="number"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addNumber()}
              placeholder="Number"
              className="w-24 px-3 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-purple-300 focus:border-purple-400 focus:outline-none"
            />
            <button onClick={addNumber} className="px-4 py-2 bg-purple-900/50 text-purple-300 rounded-lg hover:bg-purple-800/50 font-bold">
              + Add
            </button>
          </div>
        </div>

        {/* Operators */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['+', '-', '*', '/'].map(op => (
            <button key={op} onClick={() => addOperator(op)} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-bold">
              {OPERATOR_DISPLAY[op]}
            </button>
          ))}
          {['>', '<', '>=', '<=', '==', '!='].map(op => (
            <button key={op} onClick={() => addOperator(op)} className="px-4 py-2 bg-green-900/50 text-green-400 rounded-lg hover:bg-green-800/50 font-bold">
              {OPERATOR_DISPLAY[op]}
            </button>
          ))}
          <button onClick={() => setTokens(tokens.slice(0, -1))} className="px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-800/50 font-bold">
            ⟲ Undo
          </button>
          <button onClick={() => setTokens([])} className="px-4 py-2 bg-orange-900/50 text-orange-400 rounded-lg hover:bg-orange-800/50 font-bold">
            Clear
          </button>
        </div>
      </div>

      {/* Validation Message */}
      {tokens.length > 0 && !isValidBooleanFormula && (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
          ⚠️ {validation.message}
        </div>
      )}

      {/* Function Parameter Modal */}
      {showFunctionModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={closeFunctionModal}>
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              {editingTokenIndex >= 0 ? 'Edit' : 'Configure'}
              <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-sm">{currentFunction}</span>
            </h3>
            
            {/* Get existing function tokens for source options */}
            {(() => {
              const existingFunctions = tokens
                .filter((t, idx) => t.type === 'function' && idx !== editingTokenIndex)
                .map(t => t.value);
              
              return FUNCTIONS[currentFunction]?.params.map(param => (
                <div key={param.name} className="mb-4">
                  <label className="block text-slate-400 mb-2 text-sm">
                    {param.name} <span className="text-slate-600">{param.description}</span>
                  </label>
                  {param.type === 'source' ? (
                    <select
                      value={paramValues[param.name]}
                      onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    >
                      <optgroup label="Price Data">
                        {SOURCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </optgroup>
                      {existingFunctions.length > 0 && (
                        <optgroup label="Functions">
                          {existingFunctions.map((func, idx) => <option key={`func-${idx}`} value={func}>{func}</option>)}
                        </optgroup>
                      )}
                    </select>
                  ) : param.type === 'select' ? (
                    <select
                      value={paramValues[param.name]}
                      onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {param.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={paramValues[param.name]}
                      onChange={(e) => setParamValues({ ...paramValues, [param.name]: e.target.value })}
                      readOnly={param.locked}
                      className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                    />
                  )}
                </div>
              ));
            })()}

            <div className="bg-slate-900 rounded-lg p-3 mb-4">
              <div className="text-slate-500 text-xs uppercase mb-1">Preview</div>
              <div className="text-green-400 font-mono">{getPreview()}</div>
            </div>

            <div className="flex gap-3">
              <button onClick={closeFunctionModal} className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 font-bold">
                Cancel
              </button>
              {editingTokenIndex >= 0 && (
                <button onClick={() => { deleteToken(editingTokenIndex); closeFunctionModal(); }} className="px-4 py-3 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-800/50 font-bold">
                  🗑
                </button>
              )}
              <button onClick={confirmFunction} className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold">
                {editingTokenIndex >= 0 ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operator Popup */}
      {operatorPopup.show && (
        <div 
          className="fixed bg-slate-800 border-2 border-slate-600 rounded-lg p-3 z-50 shadow-xl"
          style={{ left: operatorPopup.position.x, top: operatorPopup.position.y }}
        >
          <div className="grid grid-cols-4 gap-2 mb-2">
            {['+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!='].map(op => (
              <button
                key={op}
                onClick={() => updateOperator(op)}
                className={`px-3 py-2 rounded font-bold ${['>', '<', '>=', '<=', '==', '!='].includes(op) ? 'bg-green-900/50 text-green-400' : 'bg-slate-700 text-white'} hover:bg-slate-600`}
              >
                {OPERATOR_DISPLAY[op]}
              </button>
            ))}
          </div>
          <button 
            onClick={() => { deleteToken(operatorPopup.index); setOperatorPopup({ show: false, index: -1, position: { x: 0, y: 0 } }); }} 
            className="w-full px-3 py-2 bg-red-900/50 text-red-400 rounded font-bold hover:bg-red-800/50"
          >
            🗑 Delete
          </button>
        </div>
      )}

      {/* Number Popup */}
      {numberPopup.show && (
        <div 
          className="fixed bg-slate-800 border-2 border-slate-600 rounded-lg p-3 z-50 shadow-xl"
          style={{ left: numberPopup.position.x, top: numberPopup.position.y }}
        >
          <input
            type="number"
            value={numberPopup.value}
            onChange={(e) => setNumberPopup({ ...numberPopup, value: e.target.value })}
            className="w-28 px-3 py-2 bg-slate-900 border-2 border-slate-600 rounded text-purple-300 mb-2 focus:border-purple-400 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={updateNumber} className="flex-1 px-3 py-2 bg-purple-900/50 text-purple-300 rounded font-bold hover:bg-purple-800/50">
              Update
            </button>
            <button 
              onClick={() => { deleteToken(numberPopup.index); setNumberPopup({ show: false, index: -1, position: { x: 0, y: 0 }, value: '' }); }} 
              className="px-3 py-2 bg-red-900/50 text-red-400 rounded font-bold hover:bg-red-800/50"
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquationBuilder;
