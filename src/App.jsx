import FormulaManager from './FormulaManager'

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
          initialFormulas={[]}
          onChange={handleFormulasChange}
        />
      </div>
    </div>
  )
}

export default App
