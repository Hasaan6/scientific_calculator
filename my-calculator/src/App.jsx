import React, { useState } from 'react';
import './Calculator.css';

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
    </div>
  );
};

export default ScientificCalculator;