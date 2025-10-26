const display = document.getElementById('display');
const subDisplay = document.getElementById('subDisplay');
const buttons = document.querySelectorAll('.btn');
let currentInput = '';

function updateDisplay() {
    display.value = currentInput || '';
    updatePreview();
}

function sanitize(expression){
    // Remove leading operators except minus, collapse multiple operators
    expression = expression.replace(/[^0-9.+\-*/() ]+/g, '');
    expression = expression.replace(/\s+/g, '');
    // Replace repeated operators like ++ or +- with single
    expression = expression.replace(/(\+|\-|\*|\/){2,}/g, (m) => m[m.length-1]);
    return expression;
}

function tryEval(expr){
    try{
        // eslint-disable-next-line no-eval
        const val = eval(expr);
        if (typeof val === 'number' && isFinite(val)) return val;
    }catch(e){ }
    return null;
}

function updatePreview(){
    const s = sanitize(currentInput);
    if (!s) { subDisplay.textContent = '0'; return }
    const res = tryEval(s);
    subDisplay.textContent = res === null ? '...' : res;
}

function calculate() {
    const s = sanitize(currentInput);
    const res = tryEval(s);
    if (res === null) {
        currentInput = 'Error';
    } else {
        currentInput = String(res);
    }
    updateDisplay();
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        // simple press animation
        btn.classList.add('press');
        setTimeout(()=>btn.classList.remove('press'),140);

        if (btn.id === 'clear') {
            currentInput = '';
            updateDisplay();
            return;
        }
        if (btn.id === 'equals') {
            calculate();
            return;
        }

        if (currentInput === 'Error') currentInput = '';

        // Prevent multiple operators in a row
        const last = currentInput.slice(-1);
        if (['+','-','*','/'].includes(value) && ['+','-','*','/'].includes(last)){
            // replace last operator with the new one
            currentInput = currentInput.slice(0,-1) + value;
        } else {
            currentInput += value;
        }
        updateDisplay();
    });
});

// Backspace / Cancel button (same as keyboard Backspace)
const backspaceBtn = document.getElementById('backspace');
if (backspaceBtn) {
    backspaceBtn.addEventListener('click', () => {
        if (currentInput === 'Error') currentInput = '';
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
        backspaceBtn.classList.add('press');
        setTimeout(()=>backspaceBtn.classList.remove('press'),120);
    });
}

// Keyboard support with mapping for x and ÷ and enter
window.addEventListener('keydown', (e) => {
    const key = e.key;
    const allowed = ['+','-','*','/','.','(',')'];
    if ((key >= '0' && key <= '9') || allowed.includes(key)){
        if (currentInput === 'Error') currentInput = '';
        currentInput += key;
        updateDisplay();
        return;
    }

    if (key === 'x' || key === 'X'){
        currentInput += '*'; updateDisplay(); return;
    }
    if (key === 'Enter') { e.preventDefault(); calculate(); return }
    if (key === 'Escape') { currentInput=''; updateDisplay(); return }
    if (key === 'Backspace') { currentInput = currentInput.slice(0,-1); updateDisplay(); return }
});

// small helper: initialize
updateDisplay();
