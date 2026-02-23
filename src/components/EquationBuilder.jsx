import React, { useState, useRef, useEffect } from "react";
import FUNCTIONS from "../data/functions.json";
import { createPortal } from "react-dom";

// Constants
const OPERATOR_DISPLAY = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
  ">": ">",
  "<": "<",
  ">=": "≥",
  "<=": "≤",
  "==": "==",
  "!=": "≠",
};

const SOURCE_OPTIONS = ["OPEN", "HIGH", "LOW", "CLOSE"];

const EquationBuilder = ({ initialTokens = [], onChange, portalRoot }) => {
  const [tokens, setTokens] = useState(initialTokens);
  const [searchValue, setSearchValue] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [numberValue, setNumberValue] = useState("");

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [showFunctionConfig, setShowFunctionConfig] = useState(false);
  const [currentFunction, setCurrentFunction] = useState(null);
  const [paramValues, setParamValues] = useState({});
  const [editingTokenIndex, setEditingTokenIndex] = useState(-1);

  const [operatorPopup, setOperatorPopup] = useState({
    show: false,
    index: -1,
    position: { x: 0, y: 0 },
  });
  const [numberPopup, setNumberPopup] = useState({
    show: false,
    index: -1,
    position: { x: 0, y: 0 },
    value: "",
  });

  const inputRef = useRef(null);
  const configRef = useRef(null);

  useEffect(() => {
    const equation = tokens.map((t) => t.value).join(" ");
    const validation = validateBooleanFormula();
    onChange?.({ tokens, equation, isValid: validation.valid, validation });
  }, [tokens]);

  const filteredFunctions = Object.keys(FUNCTIONS).filter((name) =>
    name.toUpperCase().includes(searchValue.toUpperCase())
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowAutocomplete(value.length > 0 && filteredFunctions.length > 0);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!showAutocomplete) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, filteredFunctions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredFunctions[selectedIndex]) {
        selectFunction(filteredFunctions[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowAutocomplete(false);
    }
  };

  const selectFunction = (funcName) => {
    setCurrentFunction(funcName);
    const func = FUNCTIONS[funcName];
    const initialParams = {};
    func.params.forEach((p) => {
      initialParams[p.name] = p.default;
    });
    setParamValues(initialParams);
    setEditingTokenIndex(-1);
    setShowFunctionConfig(true);
    setShowAutocomplete(false);
    setSearchValue("");

    if (isCollapsed) {
      setIsCollapsed(false);
    }

    setTimeout(() => {
      configRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  const editFunctionToken = (index) => {
    const token = tokens[index];
    if (token.type !== "function") return;

    const match = token.value.match(/^(\w+)\((.*)\)$/);
    if (!match) return;

    const funcName = match[1];
    const paramString = match[2];
    const paramValuesList = paramString.split(",").map((s) => s.trim());

    setCurrentFunction(funcName);
    setEditingTokenIndex(index);

    const func = FUNCTIONS[funcName];
    const params = {};
    func.params.forEach((p, i) => {
      params[p.name] =
        paramValuesList[i] !== undefined ? paramValuesList[i] : p.default;
    });
    setParamValues(params);
    setShowFunctionConfig(true);

    if (isCollapsed) {
      setIsCollapsed(false);
    }

    setTimeout(() => {
      configRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  };

  const confirmFunction = () => {
    if (!currentFunction) return;

    const func = FUNCTIONS[currentFunction];
    const values = func.params.map((p) => paramValues[p.name]);
    const functionCall = `${currentFunction}(${values.join(", ")})`;

    const newTokens = [...tokens];
    if (editingTokenIndex >= 0) {
      newTokens[editingTokenIndex].value = functionCall;
    } else {
      newTokens.push({ type: "function", value: functionCall });
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

  const hasComparisonOperator = tokens.some((t) => t.type === "comparison");

  const addOperator = (op) => {
    if (tokens.length === 0) return;
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === "operator" || lastToken.type === "comparison")
      return;

    const isComparison = [">", "<", ">=", "<=", "==", "!="].includes(op);

    if (isComparison && hasComparisonOperator) return;

    setTokens([
      ...tokens,
      { type: isComparison ? "comparison" : "operator", value: op },
    ]);
  };

  const addNumber = () => {
    if (!numberValue || isNaN(parseFloat(numberValue))) return;
    if (tokens.length > 0) {
      const lastToken = tokens[tokens.length - 1];
      if (lastToken.type === "function" || lastToken.type === "number") return;
    }
    setTokens([...tokens, { type: "number", value: numberValue }]);
    setNumberValue("");
  };

  const deleteToken = (index) => {
    setTokens(tokens.filter((_, i) => i !== index));
  };

  const handleTokenClick = (index, e, type) => {
    const rect = e.target.getBoundingClientRect();
    const position = { x: rect.left, y: rect.bottom + 5 };

    if (type === "function") {
      editFunctionToken(index);
    } else if (type === "number") {
      setNumberPopup({
        show: true,
        index,
        position,
        value: tokens[index].value,
      });
    } else {
      setOperatorPopup({ show: true, index, position });
    }
  };

  const updateOperator = (newOp) => {
    const newTokens = [...tokens];
    const isComparison = [">", "<", ">=", "<=", "==", "!="].includes(newOp);
    const currentToken = tokens[operatorPopup.index];

    if (
      isComparison &&
      currentToken.type !== "comparison" &&
      hasComparisonOperator
    )
      return;

    newTokens[operatorPopup.index] = {
      type: isComparison ? "comparison" : "operator",
      value: newOp,
    };
    setTokens(newTokens);
    setOperatorPopup({ show: false, index: -1, position: { x: 0, y: 0 } });
  };

  const updateNumber = () => {
    if (!numberPopup.value || isNaN(parseFloat(numberPopup.value))) return;
    const newTokens = [...tokens];
    newTokens[numberPopup.index].value = numberPopup.value;
    setTokens(newTokens);
    setNumberPopup({
      show: false,
      index: -1,
      position: { x: 0, y: 0 },
      value: "",
    });
  };

  const getPreview = () => {
    if (!currentFunction) return "";
    const func = FUNCTIONS[currentFunction];
    const values = func.params.map((p) => paramValues[p.name]);
    return `${currentFunction}(${values.join(", ")})`;
  };

  const validateBooleanFormula = () => {
    if (tokens.length === 0)
      return { valid: false, message: "Empty formula" };

    const comparisonIndex = tokens.findIndex((t) => t.type === "comparison");
    if (comparisonIndex === -1) {
      return {
        valid: false,
        message: "Missing comparison",
      };
    }

    const leftSide = tokens.slice(0, comparisonIndex);
    const hasLeftOperand = leftSide.some(
      (t) => t.type === "function" || t.type === "number"
    );
    if (!hasLeftOperand) {
      return { valid: false, message: "Missing left value" };
    }

    const rightSide = tokens.slice(comparisonIndex + 1);
    const hasRightOperand = rightSide.some(
      (t) => t.type === "function" || t.type === "number"
    );
    if (!hasRightOperand) {
      return { valid: false, message: "Missing right value" };
    }

    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === "operator" || lastToken.type === "comparison") {
      return { valid: false, message: "Ends with operator" };
    }

    return { valid: true, message: "" };
  };

  const validation = validateBooleanFormula();
  const isValidBooleanFormula = validation.valid;

  return (
    <>
      <style>{`
        .eq-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .eq-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .eq-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4 0%, #0e7490 100%);
          border-radius: 99px;
        }
        .eq-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #22d3ee 0%, #06b6d4 100%);
        }
        .eq-scroll {
          scrollbar-width: thin;
          scrollbar-color: #0e7490 transparent;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 150ms ease-out;
        }
      `}</style>

      {/* Compact Panel */}
      {portalRoot &&
        createPortal(
          <div className="flex flex-col h-full bg-slate-800/30 border-r border-slate-700/50">
            {/* Compact Header */}
            <div
              className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-colors group"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`text-cyan-400 text-sm flex-shrink-0 transition-transform duration-300 group-hover:text-cyan-300 ${
                    isCollapsed ? "" : "rotate-90"
                  }`}
                >
                  ▶
                </span>
                <h3 className="text-white font-bold text-sm truncate">
                  Equation
                </h3>
                {tokens.length > 0 && (
                  <span className="bg-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded text-xs font-mono flex-shrink-0 border border-cyan-500/40">
                    {tokens.length}
                  </span>
                )}
              </div>
              <div className="text-xs flex-shrink-0 font-bold">
                {isValidBooleanFormula ? (
                  <span className="text-emerald-400 text-lg">✓</span>
                ) : tokens.length > 0 ? (
                  <span className="text-rose-400 text-lg">⚠</span>
                ) : (
                  <span className="text-slate-600 text-lg">−</span>
                )}
              </div>
            </div>

            {/* Collapsible Content */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out flex-1 ${
                isCollapsed ? "max-h-0" : "max-h-full"
              }`}
            >
              <div className="p-3 space-y-3  h-full">
                {/* Equation Display */}
                <div className="space-y-1.5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold px-1">
                    Formula
                  </p>
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded px-3 py-2 min-h-[50px] font-mono text-sm text-emerald-400/90 overflow-x-auto hover:border-slate-600/60 transition-colors">
                    {tokens.length === 0 ? (
                      <span className="text-slate-600 text-xs">
                        Click on indicator search your indicator and add it
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {tokens.map((token, index) => (
                          <span
                            key={index}
                            onClick={(e) =>
                              handleTokenClick(index, e, token.type)
                            }
                            className={`px-2 py-1 rounded cursor-pointer transition-all border border-transparent hover:border-cyan-400/50 hover:scale-105 active:scale-95 text-xs whitespace-nowrap ${
                              token.type === "function"
                                ? "bg-indigo-900/50 text-cyan-300 hover:bg-indigo-800/70"
                                : ""
                            }
                            ${
                              token.type === "operator"
                                ? "bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/60"
                                : ""
                            }
                            ${
                              token.type === "comparison"
                                ? "bg-rose-900/40 text-rose-300 hover:bg-rose-800/60"
                                : ""
                            }
                            ${
                              token.type === "number"
                                ? "bg-purple-900/40 text-purple-300 hover:bg-purple-800/60"
                                : ""
                            }`}
                            title={`Click to ${
                              token.type === "function" ? "edit" : "modify"
                            }`}
                          >
                            {token.type === "operator" ||
                            token.type === "comparison"
                              ? OPERATOR_DISPLAY[token.value] || token.value
                              : token.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Function Search */}
                <div className="space-y-1.5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold px-1">
                    Search Indicators
                  </p>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={searchValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() =>
                        searchValue && setShowAutocomplete(true)
                      }
                      placeholder="Search…"
                      className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/40 rounded text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all"
                    />
                    {showAutocomplete && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/95 border border-slate-700/50 rounded max-h-48 overflow-y-auto z-50 shadow-lg animate-slideIn">
                        {filteredFunctions.length > 0 ? (
                          filteredFunctions.map((name, i) => (
                            <div
                              key={name}
                              onClick={() => selectFunction(name)}
                              className={`px-3 py-2 cursor-pointer border-b border-slate-700/30 hover:bg-slate-700/60 transition-colors text-sm ${
                                i === selectedIndex
                                  ? "bg-slate-700/60 text-cyan-400 border-l-2 border-l-cyan-400"
                                  : "text-slate-300"
                              }`}
                            >
                              <div className="font-bold text-sm">{name}</div>
                              <div className="text-slate-500 text-xs truncate">
                                {FUNCTIONS[name].params
                                  .map((p) => p.name)
                                  .join(", ")}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-3 text-center text-slate-500 text-sm">
                            No match
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Number Input */}
                <div className="space-y-1.5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold px-1">
                    Number
                  </p>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={numberValue}
                      onChange={(e) => setNumberValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addNumber()}
                      placeholder="Add After Operator (Numeric Value only)"
                      className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-700/40 rounded text-purple-300 text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all"
                    />
                    <button
                      onClick={addNumber}
                      className="px-3 py-2 bg-purple-900/40 text-purple-300 hover:bg-purple-800/50 rounded font-bold text-sm transition-all active:scale-95 flex-shrink-0 border border-purple-600/30 hover:border-purple-500/40"
                      title="Add (Enter)"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Arithmetic Operators */}
                <div className="space-y-1.5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold px-1">
                    Arithmetic
                  </p>
                  <div className="grid grid-cols-4 gap-1">
                    {["+", "-", "*", "/"].map((op) => (
                      <button
                        key={op}
                        onClick={() => addOperator(op)}
                        className="px-2 py-2 bg-slate-700/40 text-slate-300 hover:bg-slate-600/60 rounded font-bold text-sm transition-all active:scale-95 border border-slate-600/30 hover:border-slate-500/40"
                        title={op}
                      >
                        {OPERATOR_DISPLAY[op]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comparison Operators */}
                <div className="space-y-1.5">
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-bold px-1 flex items-center justify-between">
                    <span>Compare</span>
                    {hasComparisonOperator && (
                      <span className="text-xs text-rose-400">1 max</span>
                    )}
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {[">", "<", ">=", "<=", "==", "!="].map((op) => (
                      <button
                        key={op}
                        onClick={() => addOperator(op)}
                        disabled={hasComparisonOperator}
                        className={`px-2 py-2 rounded font-bold text-sm transition-all active:scale-95 border ${
                          hasComparisonOperator
                            ? "bg-slate-700/20 text-slate-600 cursor-not-allowed border-slate-600/20"
                            : "bg-cyan-900/40 text-cyan-300 hover:bg-cyan-800/60 border-cyan-500/30 hover:border-cyan-400/40"
                        }`}
                        title={
                          hasComparisonOperator
                            ? "Only one allowed"
                            : op
                        }
                      >
                        {OPERATOR_DISPLAY[op]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 pt-2">
                  <button
                    onClick={() => setTokens(tokens.slice(0, -1))}
                    disabled={tokens.length === 0}
                    className="flex-1 px-2 py-2 bg-slate-700/40 text-slate-300 hover:bg-slate-600/60 rounded font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 border border-slate-600/30"
                    title="Undo"
                  >
                    Undo ↶
                  </button>
                  <button
                    onClick={() => setTokens([])}
                    disabled={tokens.length === 0}
                    className="flex-1 px-2 py-2 bg-rose-900/30 text-rose-400 hover:bg-rose-800/40 rounded font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 border border-rose-600/30"
                    title="Clear"
                  >
                   Reset ✕
                  </button>
                </div>

                {/* Validation */}
                {tokens.length > 0 && (
                  <div
                    className={`text-sm rounded px-2 py-2 flex items-start gap-2 border ${
                      isValidBooleanFormula
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    <span className="flex-shrink-0 text-lg mt-px">
                      {isValidBooleanFormula ? "✓" : "⚠"}
                    </span>
                    <span className="leading-snug text-sm">
                      {isValidBooleanFormula
                        ? "Valid"
                        : validation.message}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>,
          portalRoot
        )}

      {/* Function Config - Medium Size */}
      {showFunctionConfig && currentFunction && (
        <div
          ref={configRef}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-cyan-500/30 space-y-3   animate-slideIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-white font-bold text-sm">
                {editingTokenIndex >= 0 ? "Edit" : "Add"}
              </h3>
              <span className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                {currentFunction}
              </span>
            </div>
            <button
              onClick={closeFunctionConfig}
              className="text-slate-400 hover:text-white text-lg flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-slate-700/50 rounded transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="border-b border-slate-700/40" />

          {/* Description */}
          {FUNCTIONS[currentFunction]?.description && (
            <p className="text-slate-400 text-sm leading-relaxed">
              {FUNCTIONS[currentFunction].description}
            </p>
          )}

          {/* Parameters */}
          <div className="space-y-2">
            {(() => {
              const existingFunctions = tokens
                .filter(
                  (t, idx) => t.type === "function" && idx !== editingTokenIndex
                )
                .map((t) => t.value);

              return FUNCTIONS[currentFunction]?.params.map((param) => (
                <div key={param.name} className="space-y-1">
                  <label className="block text-slate-300 text-sm font-semibold">
                    {param.name}
                    {param.description && (
                      <span className="text-slate-500 text-xs font-normal ml-2">
                        ({param.description})
                      </span>
                    )}
                  </label>
                  {param.type === "source" ? (
                    <select
                      value={paramValues[param.name]}
                      onChange={(e) =>
                        setParamValues({
                          ...paramValues,
                          [param.name]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/40 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all"
                    >
                      <optgroup label="Price">
                        {SOURCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </optgroup>
                      {existingFunctions.length > 0 && (
                        <optgroup label="Func">
                          {existingFunctions.map((func, idx) => (
                            <option key={`func-${idx}`} value={func}>
                              {func.substring(0, 20)}…
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  ) : param.type === "select" ? (
                    <select
                      value={paramValues[param.name]}
                      onChange={(e) =>
                        setParamValues({
                          ...paramValues,
                          [param.name]: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/40 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all"
                    >
                      {param.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={paramValues[param.name]}
                      onChange={(e) =>
                        setParamValues({
                          ...paramValues,
                          [param.name]: e.target.value,
                        })
                      }
                      readOnly={param.locked}
                      className={`w-full px-3 py-2 bg-slate-900/60 border border-slate-700/40 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all ${
                        param.locked
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    />
                  )}
                </div>
              ));
            })()}
          </div>

          {/* Preview */}
          <div className="bg-slate-900/40 rounded px-3 py-2 border border-slate-700/40 space-y-1">
            <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">
              Preview
            </p>
            <div className="text-emerald-400 font-mono text-sm break-all">
              {getPreview()}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-1 pt-1">
            <button
              onClick={closeFunctionConfig}
              className="flex-1 px-3 py-2 bg-slate-700/40 text-slate-300 hover:bg-slate-600/50 rounded font-bold text-sm transition-all active:scale-95 border border-slate-600/30"
            >
              Cancel
            </button>
            {editingTokenIndex >= 0 && (
              <button
                onClick={() => {
                  deleteToken(editingTokenIndex);
                  closeFunctionConfig();
                }}
                className="px-3 py-2 bg-rose-900/30 text-rose-400 hover:bg-rose-800/40 rounded font-bold text-sm transition-all active:scale-95 border border-rose-600/30"
              >
                🗑
              </button>
            )}
            <button
              onClick={confirmFunction}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 rounded font-bold text-sm transition-all active:scale-95 border border-cyan-600/40 shadow-sm shadow-cyan-500/15"
            >
              {editingTokenIndex >= 0 ? "Update" : "Add"}
            </button>
          </div>
        </div>
      )}

      {/* Operator Popup - Medium Size */}
      {operatorPopup.show &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() =>
                setOperatorPopup({
                  show: false,
                  index: -1,
                  position: { x: 0, y: 0 },
                })
              }
            />
            <div
              className="fixed bg-slate-800/95 border border-slate-700/50 rounded-lg p-2 z-50 shadow-lg backdrop-blur-sm animate-slideIn"
              style={{
                left: operatorPopup.position.x,
                top: operatorPopup.position.y,
              }}
            >
              <div className="grid grid-cols-3 gap-1 mb-2">
                {["+", "-", "*", "/", ">", "<", ">=", "<=", "==", "!="].map(
                  (op) => {
                    const isComparison = [
                      ">",
                      "<",
                      ">=",
                      "<=",
                      "==",
                      "!=",
                    ].includes(op);
                    const currentIsComparison =
                      tokens[operatorPopup.index]?.type === "comparison";
                    const isDisabled =
                      isComparison &&
                      !currentIsComparison &&
                      hasComparisonOperator;

                    return (
                      <button
                        key={op}
                        onClick={() => !isDisabled && updateOperator(op)}
                        disabled={isDisabled}
                        className={`px-2 py-2 rounded text-sm font-bold transition-all active:scale-95 border ${
                          isDisabled
                            ? "bg-slate-700/30 text-slate-600 cursor-not-allowed border-slate-600/20"
                            : isComparison
                            ? "bg-rose-900/40 text-rose-400 hover:bg-rose-800/50 border-rose-600/30 hover:border-rose-500/40"
                            : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/60 border-slate-600/30 hover:border-slate-500/40"
                        }`}
                      >
                        {OPERATOR_DISPLAY[op]}
                      </button>
                    );
                  }
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setOperatorPopup({
                      show: false,
                      index: -1,
                      position: { x: 0, y: 0 },
                    })
                  }
                  className="flex-1 px-2 py-1.5 bg-slate-700/50 text-slate-300 rounded text-sm font-bold hover:bg-slate-600/60 transition-all active:scale-95 border border-slate-600/30"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    deleteToken(operatorPopup.index);
                    setOperatorPopup({
                      show: false,
                      index: -1,
                      position: { x: 0, y: 0 },
                    });
                  }}
                  className="px-2 py-1.5 bg-rose-900/40 text-rose-400 rounded text-sm font-bold hover:bg-rose-800/50 transition-all active:scale-95 border border-rose-600/30"
                >
                  🗑
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Number Popup - Medium Size */}
      {numberPopup.show &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() =>
                setNumberPopup({
                  show: false,
                  index: -1,
                  position: { x: 0, y: 0 },
                  value: "",
                })
              }
            />
            <div
              className="fixed bg-slate-800/95 border border-slate-700/50 rounded-lg p-2 z-50 shadow-lg backdrop-blur-sm min-w-[160px] animate-slideIn"
              style={{
                left: numberPopup.position.x,
                top: numberPopup.position.y,
              }}
            >
              <input
                type="number"
                value={numberPopup.value}
                onChange={(e) =>
                  setNumberPopup({ ...numberPopup, value: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700/40 rounded text-purple-300 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all"
                autoFocus
              />
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setNumberPopup({
                      show: false,
                      index: -1,
                      position: { x: 0, y: 0 },
                      value: "",
                    })
                  }
                  className="flex-1 px-2 py-1.5 bg-slate-700/50 text-slate-300 rounded text-sm font-bold hover:bg-slate-600/60 transition-all active:scale-95 border border-slate-600/30"
                >
                  Close
                </button>
                <button
                  onClick={updateNumber}
                  className="flex-1 px-2 py-1.5 bg-purple-900/40 text-purple-300 rounded text-sm font-bold hover:bg-purple-800/50 transition-all active:scale-95 border border-purple-600/30"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    deleteToken(numberPopup.index);
                    setNumberPopup({
                      show: false,
                      index: -1,
                      position: { x: 0, y: 0 },
                      value: "",
                    });
                  }}
                  className="px-2 py-1.5 bg-rose-900/40 text-rose-400 rounded text-sm font-bold hover:bg-rose-800/50 transition-all active:scale-95 border border-rose-600/30"
                >
                  🗑
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};

export default EquationBuilder;
