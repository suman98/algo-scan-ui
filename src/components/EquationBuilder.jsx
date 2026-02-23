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
  
  // Collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Function configuration state (moved from modal)
  const [showFunctionConfig, setShowFunctionConfig] = useState(false);
  const [currentFunction, setCurrentFunction] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [editingTokenIndex, setEditingTokenIndex] = useState(-1);
  
  // Popup states
  const [operatorPopup, setOperatorPopup] = useState({ show: false, index: -1, position: { x: 0, y: 0 } });
  const [numberPopup, setNumberPopup] = useState({ show: false, index: -1, position: { x: 0, y: 0 }, value: '' });
  
  const inputRef = useRef(null);
  const configRef = useRef(null);

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
    setShowFunctionConfig(true);
    setShowAutocomplete(false);
    setSearchValue('');
    
    // Expand if collapsed
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    
    // Scroll to config section
    setTimeout(() => {
      configRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
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
    setShowFunctionConfig(true);
    
    // Expand if collapsed
    if (isCollapsed) {
      setIsCollapsed(false);
    }
    
    // Scroll to config section
    setTimeout(() => {
      configRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
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
    closeFunctionConfig();
  };

  const closeFunctionConfig = () => {
    setShowFunctionConfig(false);
    setCurrentFunction(null);
    setParamValues({});
    setEditingTokenIndex(-1);
  };

  // Check if a comparison operator already exists
  const hasComparisonOperator = tokens.some(t => t.type === 'comparison');

  const addOperator = (op) => {
    if (tokens.length === 0) return;
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === 'operator' || lastToken.type === 'comparison') return;
    
    const isComparison = ['>', '<', '>=', '<=', '==', '!='].includes(op);
    
    // Only allow one comparison operator
    if (isComparison && hasComparisonOperator) return;
    
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
    const currentToken = tokens[operatorPopup.index];
    
    // If trying to change to comparison, check if one already exists (excluding current token)
    if (isComparison && currentToken.type !== 'comparison' && hasComparisonOperator) return;
    
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
    <div className="bg-slate-900 rounded-xl border-2 border-slate-700 overflow-hidden">
      {/* Collapse Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b-2 border-slate-700 cursor-pointer hover:bg-slate-800" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center gap-3">
          <span className={`text-xl transition-transform duration-300 ${isCollapsed ? '' : 'rotate-90'}`}>
            ▶
          </span>
          <h2 className="text-white font-bold text-lg">Equation Builder</h2>
          {tokens.length > 0 && (
            <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded text-xs font-mono">
              {tokens.length} tokens
            </span>
          )}
        </div>
        <div className="text-slate-500 text-sm">
          {isValidBooleanFormula ? (
            <span className="text-green-400">✓ Valid</span>
          ) : tokens.length > 0 ? (
            <span className="text-red-400">✗ Invalid</span>
          ) : (
            <span>-</span>
          )}
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0' : 'max-h-[4000px]'}`}>
        <div className="p-4 space-y-4">
          {/* Equation Display */}
          <div>
            <label className="block text-slate-400 text-sm mb-2 font-semibold">Current Equation</label>
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 min-h-[60px] font-mono text-green-400">
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
          </div>

          {/* Input Section */}
          <div className="bg-slate-800 rounded-xl p-4 space-y-4">
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
                <button onClick={addNumber} className="px-4 py-2 bg-purple-900/50 text-purple-300 rounded-lg hover:bg-purple-800/50 font-bold whitespace-nowrap">
                  + Add
                </button>
              </div>
            </div>

            {/* Operators */}
            <div className="space-y-2">
              <label className="block text-slate-400 text-sm font-semibold">Operators</label>
              <div className="flex flex-wrap gap-2">
                {['+', '-', '*', '/'].map(op => (
                  <button key={op} onClick={() => addOperator(op)} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-bold">
                    {OPERATOR_DISPLAY[op]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['>', '<', '>=', '<=', '==', '!='].map(op => (
                  <button 
                    key={op} 
                    onClick={() => addOperator(op)} 
                    disabled={hasComparisonOperator}
                    className={`px-4 py-2 rounded-lg font-bold ${hasComparisonOperator ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed' : 'bg-green-900/50 text-green-400 hover:bg-green-800/50'}`}
                    title={hasComparisonOperator ? 'Only one comparison operator allowed' : ''}
                  >
                    {OPERATOR_DISPLAY[op]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setTokens(tokens.slice(0, -1))} disabled={tokens.length === 0} className="flex-1 px-4 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-800/50 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                  ⟲ Undo
                </button>
                <button onClick={() => setTokens([])} disabled={tokens.length === 0} className="flex-1 px-4 py-2 bg-orange-900/50 text-orange-400 rounded-lg hover:bg-orange-800/50 font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Function Configuration Section */}
          {showFunctionConfig && currentFunction && (
            <div ref={configRef} className="bg-slate-800 rounded-xl p-4 border-2 border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {editingTokenIndex >= 0 ? 'Edit' : 'Configure'}
                  <span className="bg-cyan-500 text-black px-3 py-1 rounded-full text-sm">{currentFunction}</span>
                </h3>
                <button 
                  onClick={closeFunctionConfig}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Function Description */}
              {FUNCTIONS[currentFunction]?.description && (
                <div className="text-slate-400 text-sm">
                  {FUNCTIONS[currentFunction].description}
                </div>
              )}

              {/* Parameters */}
              <div className="space-y-3">
                {(() => {
                  const existingFunctions = tokens
                    .filter((t, idx) => t.type === 'function' && idx !== editingTokenIndex)
                    .map(t => t.value);
                  
                  return FUNCTIONS[currentFunction]?.params.map(param => (
                    <div key={param.name}>
                      <label className="block text-slate-300 mb-2 text-sm font-semibold">
                        {param.name}
                        {param.description && (
                          <span className="text-slate-500 text-xs ml-2">— {param.description}</span>
                        )}
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
                          className={`w-full px-4 py-3 bg-slate-900 border-2 border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none ${param.locked ? 'cursor-not-allowed opacity-50' : ''}`}
                        />
                      )}
                    </div>
                  ));
                })()}
              </div>

              {/* Preview */}
              <div className="bg-slate-900 rounded-lg p-3 border border-slate-600">
                <div className="text-slate-500 text-xs uppercase mb-1 font-semibold">Preview</div>
                <div className="text-green-400 font-mono text-sm break-all">{getPreview()}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={closeFunctionConfig} 
                  className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 font-bold transition-colors"
                >
                  Cancel
                </button>
                {editingTokenIndex >= 0 && (
                  <button 
                    onClick={() => { deleteToken(editingTokenIndex); closeFunctionConfig(); }} 
                    className="px-4 py-3 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-800/50 font-bold transition-colors"
                    title="Delete this function"
                  >
                    🗑 Delete
                  </button>
                )}
                <button 
                  onClick={confirmFunction} 
                  className="flex-1 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold transition-colors"
                >
                  {editingTokenIndex >= 0 ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          )}

          {/* Validation Message */}
          {tokens.length > 0 && !isValidBooleanFormula && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              ⚠️ {validation.message}
            </div>
          )}

          {tokens.length > 0 && isValidBooleanFormula && (
            <div className="bg-green-900/30 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
              ✓ Equation is valid and ready to use
            </div>
          )}
        </div>
      </div>

      {/* Operator Popup */}
      {operatorPopup.show && (
        <>
          {/* Backdrop to close on outside click */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOperatorPopup({ show: false, index: -1, position: { x: 0, y: 0 } })}
          />
          <div 
            className="fixed bg-slate-800 border-2 border-slate-600 rounded-lg p-3 z-50 shadow-xl"
            style={{ left: operatorPopup.position.x, top: operatorPopup.position.y }}
          >
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['+', '-', '*', '/', '>', '<', '>=', '<=', '==', '!='].map(op => {
                const isComparison = ['>', '<', '>=', '<=', '==', '!='].includes(op);
                const currentIsComparison = tokens[operatorPopup.index]?.type === 'comparison';
                const isDisabled = isComparison && !currentIsComparison && hasComparisonOperator;
                
                return (
                  <button
                    key={op}
                    onClick={() => !isDisabled && updateOperator(op)}
                    disabled={isDisabled}
                    className={`px-3 py-2 rounded font-bold ${
                      isDisabled 
                        ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed' 
                        : isComparison 
                          ? 'bg-green-900/50 text-green-400 hover:bg-slate-600' 
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {OPERATOR_DISPLAY[op]}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setOperatorPopup({ show: false, index: -1, position: { x: 0, y: 0 } })} 
                className="flex-1 px-3 py-2 bg-slate-600 text-white rounded font-bold hover:bg-slate-500"
              >
                Cancel
              </button>
              <button 
                onClick={() => { deleteToken(operatorPopup.index); setOperatorPopup({ show: false, index: -1, position: { x: 0, y: 0 } }); }} 
                className="px-3 py-2 bg-red-900/50 text-red-400 rounded font-bold hover:bg-red-800/50"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Number Popup */}
      {numberPopup.show && (
        <>
          {/* Backdrop to close on outside click */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setNumberPopup({ show: false, index: -1, position: { x: 0, y: 0 }, value: '' })}
          />
          <div 
            className="fixed bg-slate-800 border-2 border-slate-600 rounded-lg p-3 z-50 shadow-xl"
            style={{ left: numberPopup.position.x, top: numberPopup.position.y }}
          >
            <input
              type="number"
              value={numberPopup.value}
              onChange={(e) => setNumberPopup({ ...numberPopup, value: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border-2 border-slate-600 rounded text-purple-300 mb-2 focus:border-purple-400 focus:outline-none"
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={() => setNumberPopup({ show: false, index: -1, position: { x: 0, y: 0 }, value: '' })} 
                className="flex-1 px-3 py-2 bg-slate-600 text-white rounded font-bold hover:bg-slate-500"
              >
                Cancel
              </button>
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
        </>
      )}
    </div>
  );
};

export default EquationBuilder;
