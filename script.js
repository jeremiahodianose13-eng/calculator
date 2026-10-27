const exprEl = document.getElementById('expr');
const resultEl = document.getElementById('result');

let current = '0';     // number being typed
let previous = null;   // stored first operand (number)
let operator = null;   // pending operator
let justEvaluated = false;

const compute = (a, b, op) => {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
  }
};

const format = (n) => {
  if (!isFinite(n)) return 'Error';
  // round off floating point noise (0.1 + 0.2)
  return String(parseFloat(n.toPrecision(12)));
};

function update() {
  resultEl.textContent = current;
  exprEl.textContent = operator ? `${format(previous)} ${operator}` : '';
  // shrink font for long numbers
  resultEl.style.fontSize = current.length > 12 ? '24px' : current.length > 8 ? '30px' : '38px';
}

function inputNumber(d) {
  if (current === 'Error' || justEvaluated) { current = '0'; justEvaluated = false; }
  if (current.replace(/[-.]/g, '').length >= 15) return;
  current = current === '0' ? d : current + d;
  update();
}

function inputDecimal() {
  if (current === 'Error' || justEvaluated) { current = '0'; justEvaluated = false; }
  if (!current.includes('.')) current += '.';
  update();
}

function chooseOperator(op) {
  if (current === 'Error') return;
  if (operator && !justEvaluated && previous !== null && current !== '') {
    // chain: 2 + 3 + ... evaluates 2 + 3 first
    const r = compute(previous, parseFloat(current), operator);
    if (!isFinite(r)) { clearAll(); current = 'Error'; update(); return; }
    previous = r;
  } else {
    previous = parseFloat(current);
  }
  operator = op;
  current = '0';
  justEvaluated = false;
  exprEl.textContent = `${format(previous)} ${operator}`;
  resultEl.textContent = format(previous);
}

function equals() {
  if (!operator || previous === null) return;
  const b = parseFloat(current);
  const r = compute(previous, b, operator);
  exprEl.textContent = `${format(previous)} ${operator} ${format(b)} =`;
  operator = null;
  previous = null;
  current = format(r);
  justEvaluated = true;
  resultEl.textContent = current;
  resultEl.style.fontSize = current.length > 12 ? '24px' : current.length > 8 ? '30px' : '38px';
}

function clearAll() {
  current = '0'; previous = null; operator = null; justEvaluated = false;
  update();
}

function backspace() {
  if (justEvaluated || current === 'Error') { clearAll(); return; }
  current = current.length > 1 ? current.slice(0, -1) : '0';
  update();
}

function percent() {
  if (current === 'Error') return;
  current = format(parseFloat(current) / 100);
  update();
}

// Button clicks
document.querySelector('.keys').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.num !== undefined) inputNumber(btn.dataset.num);
  else if (btn.dataset.op) chooseOperator(btn.dataset.op);
  else {
    switch (btn.dataset.action) {
      case 'decimal': inputDecimal(); break;
      case 'equals': equals(); break;
      case 'clear': clearAll(); break;
      case 'delete': backspace(); break;
      case 'percent': percent(); break;
    }
  }
});

// Keyboard support
const keyMap = { '+': '+', '-': '−', '*': '×', 'x': '×', '/': '÷' };
document.addEventListener('keydown', (e) => {
  let btn = null;
  const k = e.key;
  if (/^[0-9]$/.test(k)) { inputNumber(k); btn = document.querySelector(`[data-num="${k}"]`); }
  else if (k === '.') { inputDecimal(); btn = document.querySelector('[data-action="decimal"]'); }
  else if (keyMap[k]) { e.preventDefault(); chooseOperator(keyMap[k]); btn = document.querySelector(`[data-op="${keyMap[k]}"]`); }
  else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); btn = document.querySelector('[data-action="equals"]'); }
  else if (k === 'Backspace') { backspace(); btn = document.querySelector('[data-action="delete"]'); }
  else if (k === 'Escape' || k === 'Delete') { clearAll(); btn = document.querySelector('[data-action="clear"]'); }
  else if (k === '%') { percent(); btn = document.querySelector('[data-action="percent"]'); }
  if (btn) {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 110);
  }
});

update();