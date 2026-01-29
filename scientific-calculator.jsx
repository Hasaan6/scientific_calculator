import React, { useState, useEffect } from 'react';

// ============================================
// CALCULATOR ENGINE MODULE
// ============================================
const CalculatorEngine = {
  // Basic operations
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => b !== 0 ? a / b : 'Error',
  
  // Scientific operations
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
  asin: (x) => Math.asin(x),
  acos: (x) => Math.acos(x),
  atan: (x) => Math.atan(x),
  
  // Logarithmic operations
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  
  // Power operations
  power: (base, exp) => Math.pow(base, exp),
  sqrt: (x) => Math.sqrt(x),
  square: (x) => x * x,
  
  // Other operations
  factorial: (n) => {
    if (n < 0) return 'Error';
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  },
  
  reciprocal: (x) => x !== 0 ? 1 / x : 'Error',
  absolute: (x) => Math.abs(x),
  negate: (x) => -x,
  
  // Constants
  PI: Math.PI,
  E: Math.E,
};

// ============================================
// EXPRESSION PARSER MODULE
// ============================================
const ExpressionParser = {
  evaluate: (expression) => {
    try {
      // Replace special characters and functions
      let parsed = expression
        .replace(/π/g, Math.PI)
        .replace(/e/g, Math.E)
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/√/g, 'Math.sqrt');
      
      // Evaluate the expression
      const result = Function('"use strict"; return (' + parsed + ')')();
      return isFinite(result) ? result : 'Error';
    } catch (error) {
      return 'Error';
    }
  }
};

// ============================================
// DISPLAY MODULE
// ============================================
const Display = ({ value, expression, angleMode }) => {
  return (
    <div className="display-container">
      <div className="angle-mode">{angleMode}</div>
      <div className="expression">{expression || '0'}</div>
      <div className="result">{value}</div>
    </div>
  );
};

// ============================================
// BUTTON MODULE
// ============================================
const Button = ({ label, onClick, className = '', type = 'default' }) => {
  return (
    <button
      className={`calc-button ${type} ${className}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

// ============================================
// BUTTON GRID MODULE
// ============================================
const ButtonGrid = ({ onButtonClick, angleMode, onAngleModeToggle }) => {
  const scientificButtons = [
    { label: 'sin', type: 'function' },
    { label: 'cos', type: 'function' },
    { label: 'tan', type: 'function' },
    { label: 'ln', type: 'function' },
    { label: 'log', type: 'function' },
    { label: 'x²', type: 'function' },
    { label: '√', type: 'function' },
    { label: 'xʸ', type: 'function' },
    { label: 'n!', type: 'function' },
    { label: '1/x', type: 'function' },
    { label: '|x|', type: 'function' },
    { label: 'π', type: 'constant' },
    { label: 'e', type: 'constant' },
    { label: '(', type: 'operator' },
    { label: ')', type: 'operator' },
    { label: angleMode, type: 'mode', action: onAngleModeToggle },
  ];

  const standardButtons = [
    { label: 'C', type: 'clear' },
    { label: '←', type: 'backspace' },
    { label: '÷', type: 'operator' },
    { label: '×', type: 'operator' },
    { label: '7', type: 'number' },
    { label: '8', type: 'number' },
    { label: '9', type: 'number' },
    { label: '-', type: 'operator' },
    { label: '4', type: 'number' },
    { label: '5', type: 'number' },
    { label: '6', type: 'number' },
    { label: '+', type: 'operator' },
    { label: '1', type: 'number' },
    { label: '2', type: 'number' },
    { label: '3', type: 'number' },
    { label: '=', type: 'equals' },
    { label: '0', type: 'number' },
    { label: '.', type: 'number' },
    { label: '±', type: 'operator' },
  ];

  return (
    <div className="button-grid">
      <div className="scientific-panel">
        {scientificButtons.map((btn, idx) => (
          <Button
            key={idx}
            label={btn.label}
            type={btn.type}
            onClick={btn.action || (() => onButtonClick(btn.label, btn.type))}
          />
        ))}
      </div>
      <div className="standard-panel">
        {standardButtons.map((btn, idx) => (
          <Button
            key={idx}
            label={btn.label}
            type={btn.type}
            onClick={() => onButtonClick(btn.label, btn.type)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN CALCULATOR COMPONENT
// ============================================
const ScientificCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [angleMode, setAngleMode] = useState('DEG');
  const [lastResult, setLastResult] = useState(null);
  const [newNumber, setNewNumber] = useState(true);

  const convertAngle = (value) => {
    return angleMode === 'RAD' ? value : (value * Math.PI) / 180;
  };

  const handleButtonClick = (label, type) => {
    switch (type) {
      case 'number':
        handleNumber(label);
        break;
      case 'operator':
        handleOperator(label);
        break;
      case 'function':
        handleFunction(label);
        break;
      case 'constant':
        handleConstant(label);
        break;
      case 'clear':
        handleClear();
        break;
      case 'backspace':
        handleBackspace();
        break;
      case 'equals':
        handleEquals();
        break;
      default:
        break;
    }
  };

  const handleNumber = (num) => {
    if (newNumber) {
      setDisplay(num);
      setExpression(expression + num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
      setExpression(expression + num);
    }
  };

  const handleOperator = (op) => {
    if (op === '±') {
      const current = parseFloat(display);
      setDisplay(String(-current));
      return;
    }
    setExpression(expression + op);
    setNewNumber(true);
  };

  const handleFunction = (func) => {
    const current = parseFloat(display);
    let result;

    switch (func) {
      case 'sin':
        result = CalculatorEngine.sin(convertAngle(current));
        break;
      case 'cos':
        result = CalculatorEngine.cos(convertAngle(current));
        break;
      case 'tan':
        result = CalculatorEngine.tan(convertAngle(current));
        break;
      case 'ln':
        result = CalculatorEngine.ln(current);
        break;
      case 'log':
        result = CalculatorEngine.log(current);
        break;
      case 'x²':
        result = CalculatorEngine.square(current);
        setExpression(expression + '²');
        break;
      case '√':
        setExpression(expression + '√(');
        setNewNumber(true);
        return;
      case 'xʸ':
        setExpression(expression + '^');
        setNewNumber(true);
        return;
      case 'n!':
        result = CalculatorEngine.factorial(Math.floor(current));
        break;
      case '1/x':
        result = CalculatorEngine.reciprocal(current);
        break;
      case '|x|':
        result = CalculatorEngine.absolute(current);
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setLastResult(result);
    setNewNumber(true);
  };

  const handleConstant = (constant) => {
    const value = constant === 'π' ? Math.PI : Math.E;
    setDisplay(String(value));
    setExpression(expression + constant);
    setNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    } else {
      setDisplay('0');
      setExpression('');
    }
  };

  const handleEquals = () => {
    try {
      let expr = expression.replace(/\^/g, '**');
      const result = ExpressionParser.evaluate(expr);
      setDisplay(String(result));
      setLastResult(result);
      setExpression('');
      setNewNumber(true);
    } catch (error) {
      setDisplay('Error');
    }
  };

  const toggleAngleMode = () => {
    setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG');
  };

  return (
    <div className="calculator-wrapper">
      <div className="calculator">
        <div className="calculator-header">
          <div className="brand">SCIENTIFIC FX-991</div>
          <div className="solar-panel">
            <div className="solar-cell"></div>
            <div className="solar-cell"></div>
            <div className="solar-cell"></div>
          </div>
        </div>
        <Display 
          value={display} 
          expression={expression}
          angleMode={angleMode}
        />
        <ButtonGrid 
          onButtonClick={handleButtonClick}
          angleMode={angleMode}
          onAngleModeToggle={toggleAngleMode}
        />
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Share+Tech+Mono&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .calculator-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 20px;
          font-family: 'Orbitron', monospace;
        }

        .calculator {
          width: 100%;
          max-width: 480px;
          background: linear-gradient(145deg, #2a2a3e, #1f1f2e);
          border-radius: 24px;
          padding: 28px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
          position: relative;
          animation: slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .calculator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .brand {
          font-size: 11px;
          font-weight: 700;
          color: #00d4ff;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }

        .solar-panel {
          display: flex;
          gap: 3px;
        }

        .solar-cell {
          width: 24px;
          height: 8px;
          background: linear-gradient(180deg, #1a4d6d 0%, #0d2438 100%);
          border-radius: 2px;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .display-container {
          background: linear-gradient(180deg, #1a2332 0%, #0f1419 100%);
          border-radius: 12px;
          padding: 20px 18px;
          margin-bottom: 24px;
          box-shadow: 
            inset 0 2px 8px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(0, 212, 255, 0.1);
          position: relative;
          min-height: 100px;
        }

        .angle-mode {
          position: absolute;
          top: 8px;
          right: 12px;
          font-size: 10px;
          color: #ff6b35;
          font-weight: 600;
          letter-spacing: 1px;
          background: rgba(255, 107, 53, 0.1);
          padding: 3px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255, 107, 53, 0.3);
        }

        .expression {
          font-family: 'Share Tech Mono', monospace;
          font-size: 14px;
          color: #6b8ba8;
          min-height: 20px;
          margin-bottom: 8px;
          text-align: right;
          overflow-x: auto;
          white-space: nowrap;
        }

        .result {
          font-family: 'Orbitron', monospace;
          font-size: 36px;
          font-weight: 700;
          color: #00d4ff;
          text-align: right;
          text-shadow: 0 0 20px rgba(0, 212, 255, 0.6);
          animation: glow 2s ease-in-out infinite;
          letter-spacing: 1px;
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(0, 212, 255, 0.6); }
          50% { text-shadow: 0 0 30px rgba(0, 212, 255, 0.9); }
        }

        .button-grid {
          display: grid;
          gap: 20px;
        }

        .scientific-panel {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 16px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .standard-panel {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .calc-button {
          height: 56px;
          border: none;
          border-radius: 10px;
          font-family: 'Orbitron', monospace;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .calc-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .calc-button:hover::before {
          opacity: 1;
        }

        .calc-button:active {
          transform: scale(0.95);
        }

        .calc-button.number,
        .calc-button.default {
          background: linear-gradient(145deg, #3a3a4e, #2f2f3e);
          color: #e8e8e8;
        }

        .calc-button.number:hover,
        .calc-button.default:hover {
          background: linear-gradient(145deg, #454560, #3a3a4e);
          box-shadow: 
            0 6px 16px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .calc-button.operator {
          background: linear-gradient(145deg, #00d4ff, #0099cc);
          color: #0a0a0f;
          font-weight: 700;
        }

        .calc-button.operator:hover {
          background: linear-gradient(145deg, #00e5ff, #00aad4);
          box-shadow: 
            0 6px 20px rgba(0, 212, 255, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .calc-button.function,
        .calc-button.constant,
        .calc-button.mode {
          background: linear-gradient(145deg, #4a4a5e, #3a3a4e);
          color: #00d4ff;
          font-size: 13px;
          height: 48px;
        }

        .calc-button.function:hover,
        .calc-button.constant:hover,
        .calc-button.mode:hover {
          background: linear-gradient(145deg, #555570, #4a4a5e);
          box-shadow: 
            0 4px 16px rgba(0, 212, 255, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .calc-button.clear {
          background: linear-gradient(145deg, #ff6b35, #d64d24);
          color: #ffffff;
          font-weight: 700;
        }

        .calc-button.clear:hover {
          background: linear-gradient(145deg, #ff7b45, #e65d34);
          box-shadow: 
            0 6px 20px rgba(255, 107, 53, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .calc-button.backspace {
          background: linear-gradient(145deg, #5a5a6e, #4a4a5e);
          color: #ff6b35;
          font-weight: 700;
        }

        .calc-button.equals {
          background: linear-gradient(145deg, #00ff88, #00cc6a);
          color: #0a0a0f;
          font-weight: 900;
          font-size: 24px;
          grid-row: span 2;
          height: 122px;
        }

        .calc-button.equals:hover {
          background: linear-gradient(145deg, #00ff99, #00dd7a);
          box-shadow: 
            0 8px 24px rgba(0, 255, 136, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.3);
        }

        @media (max-width: 520px) {
          .calculator {
            max-width: 100%;
            padding: 20px;
          }

          .calc-button {
            height: 52px;
            font-size: 15px;
          }

          .calc-button.function,
          .calc-button.constant,
          .calc-button.mode {
            font-size: 12px;
            height: 44px;
          }

          .result {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
};

export default ScientificCalculator;
