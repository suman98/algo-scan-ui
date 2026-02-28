import FormulaManager from './FormulaManager'

// Sample formulas to demonstrate the formula builder
const sampleFormulas = [
  {
    name: 'RSI Overbought Signal',
    description: 'Triggers when RSI crosses above 70, indicating potential overbought conditions',
    tokens: [
      { type: 'function', value: 'RSI(CLOSE, 0, 14)' },
      { type: 'comparison', value: '>' },
      { type: 'number', value: '70' }
    ],
    equation: 'RSI(CLOSE, 0, 14) > 70'
  },
  {
    name: 'Golden Cross',
    description: 'Detects when short-term EMA crosses above long-term SMA - a bullish signal',
    tokens: [
      { type: 'function', value: 'EMA(CLOSE, 0, 12)' },
      { type: 'comparison', value: '>' },
      { type: 'function', value: 'SMA(CLOSE, 0, 26)' }
    ],
    equation: 'EMA(CLOSE, 0, 12) > SMA(CLOSE, 0, 26)'
  },
  {
    name: 'MACD Bullish Crossover',
    description: 'Identifies when MACD line crosses above the signal line',
    tokens: [
      { type: 'function', value: 'MACD(CLOSE, 0, 9, 12, 26, 9, MACD)' },
      { type: 'comparison', value: '>' },
      { type: 'function', value: 'MACD(CLOSE, 0, 9, 12, 26, 9, signal)' }
    ],
    equation: 'MACD(CLOSE, 0, 9, 12, 26, 9, MACD) > MACD(CLOSE, 0, 9, 12, 26, 9, signal)'
  }
];

function App() {
  const handleFormulasChange = (formulas) => {
    console.log('Formulas updated:', formulas)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 text-center mb-8">
          📊 Technical Indicator Formula Builder
        </h1>
        
        <FormulaManager 
          initialFormulas={sampleFormulas}
          onChange={handleFormulasChange}
        />
      </div>
    </div>
  )
}

export default App
