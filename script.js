const display = document.querySelector('.calculator__display');
const historyDisplay = document.querySelector('.calculator__history');
const buttons = document.querySelectorAll('.calculator__button');
const historyTable = document.querySelector('#historyTable');
const toggleHistoryBtn = document.querySelector('.toggle-history');
const historyPanel = document.querySelector('.history-panel');

const operationsHistory = [];

let currentNumber = '';
let previousNumber = '';
let operator = null;
let resultHistory = false;

function updateDisplay() {
  display.value = currentNumber || '0';
}

function updateHistory(value) {
  historyDisplay.value = value;
}

function clearCalculator() {
  currentNumber = '';
  previousNumber = '';
  operator = null;
  resultHistory = false;
  updateDisplay();
  updateHistory('');
}

function deleteLastNumber() {
  if (resultHistory) return;
  currentNumber = currentNumber.slice(0, -1);
  updateDisplay();
}

function calculate() {
  const prev = parseFloat(previousNumber);
  const current = parseFloat(currentNumber);

  let result;

  switch (operator) {
    case '+': result = prev + current; break;
    case '-': result = prev - current; break;
    case 'x': result = prev * current; break;
    case '÷': result = current === 0 ? 'Error' : prev / current; break;
    default: return;
  }

  const operationText = `${previousNumber} ${operator} ${currentNumber} = ${result}`;
  operationsHistory.push(operationText);
  localStorage.setItem('operationsHistory', JSON.stringify(operationsHistory));
  
  updateHistoryList();
  applyResult(result);
}

function applyResult(result) {
 updateHistory(`${previousNumber} ${operator} ${currentNumber}`);
  currentNumber = result.toString();
  previousNumber = '';
  operator = null;
  resultHistory = true;
  updateDisplay();
}

function loadHistoryData() {
  operationsHistory.push(...JSON.parse(localStorage.getItem('operationsHistory') || '[]'));
  updateHistoryList();
}

function updateHistoryList() {
  historyTable.innerHTML = '';
  operationsHistory.forEach((operation, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${operation}</td>
    `;
    historyTable.appendChild(row);
  });
}

toggleHistoryBtn.addEventListener('click', () => {
  historyPanel.classList.toggle('hidden');
});

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const value = button.textContent;

    if (value.toLowerCase() === 'c') {
      clearCalculator();
      return;
    }

    if (['+', '-', 'x', '÷'].includes(value)) {
      if (currentNumber === '') return;

      if (operator !== null) {
        calculate();
      }

      operator = value;
      previousNumber = currentNumber;
      currentNumber = '';
      resultHistory = false;
      updateHistory(`${previousNumber} ${operator}`);
      return;
    }

    if (value === '=') {
      calculate();
      return;
    }

    if (value === '.') {
      if (resultHistory) {
        currentNumber = '0.';
        resultHistory = false;
      } else if (!currentNumber.includes('.')) {
        currentNumber += '.';
      }
      updateDisplay();
      return;
    }

    if (!isNaN(value)) {
      if (resultHistory) {
        currentNumber = value;
        resultHistory = false;
        updateHistory('');
      } else {
        currentNumber += value;
      }
      updateDisplay();
    }
  });
});

document.addEventListener('keydown', e => {
  const key = e.key;

  if (!isNaN(key)) {
    if (resultHistory) {
      currentNumber = key;
      resultHistory = false;
      updateHistory('');
    } else {
      currentNumber += key;
    }
    updateDisplay();
  }

  if (key === '.') {
    if (!currentNumber.includes('.')) {
      currentNumber += '.';
      updateDisplay();
    }
  }

  if (['+', '-', '*', '/'].includes(key)) {
    if (currentNumber === '') return;

    if (operator !== null) {
      calculate();
    }

    operator = key === '*' ? 'x' : key === '/' ? '÷' : key;
    previousNumber = currentNumber;
    currentNumber = '';
    updateHistory(`${previousNumber} ${operator}`);
  }

  if (e.key === 'Enter' || e.code === 'NumpadEnter') {
    calculate();
  }

  if (key === 'Backspace') {
    deleteLastNumber();
  }
  

  if (key === 'Escape') {
    clearCalculator();
    localStorage.removeItem('operationsHistory');
  }

});

loadHistoryData();
