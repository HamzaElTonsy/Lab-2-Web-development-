const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelector("#keys");

let current = "0";
let previous = null;
let operator = null;
let waitingForNumber = false;
let finished = false;

function show() {
  display.textContent = current;
}

function format(value) {
  if (!Number.isFinite(value)) return "Error";

  if (Object.is(value, -0)) value = 0;

  return String(Number(value.toPrecision(10)));
}

function clearCalculator() {
  current = "0";
  previous = null;
  operator = null;
  waitingForNumber = false;
  finished = false;
  expression.textContent = "\u00a0";
  show();
}

function enterNumber(number) {
  if (current === "Error" || waitingForNumber || finished) {
    current = number;
    waitingForNumber = false;
    finished = false;
  } else {
    current = current === "0" ? number : current + number;
  }

  if (current.replace(/[-.]/g, "").length > 14) {
    current = current.slice(0, -1);
  }

  show();
}

function enterDecimal() {
  if (current === "Error" || waitingForNumber || finished) {
    current = "0.";
    waitingForNumber = false;
    finished = false;
  } else if (!current.includes(".")) {
    current += ".";
  }

  show();
}

function calculate(a, b, sign) {
  if (sign === "+") return a + b;
  if (sign === "-") return a - b;
  if (sign === "*") return a * b;
  if (sign === "/") {
    return b === 0 ? NaN : a / b;
  }

  return b;
}

function displayOperator(sign) {
  return {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
  }[sign];
}

function chooseOperator(nextOperator) {
  if (current === "Error") return;

  const value = Number(current);

  if (operator && !waitingForNumber) {
    const result = calculate(previous, value, operator);

    current = format(result);
    previous = result;
  } else {
    previous = value;
  }

  operator = nextOperator;
  waitingForNumber = true;
  finished = false;

  expression.textContent = `${format(previous)} ${displayOperator(nextOperator)}`;

  show();
}

function equals() {
  if (!operator || waitingForNumber || current === "Error") {
    return;
  }

  const first = previous;
  const second = Number(current);
  const sign = operator;
  const result = calculate(first, second, sign);

  expression.textContent = `${format(first)} ${displayOperator(sign)} ${format(second)} =`;

  current = format(result);
  previous = null;
  operator = null;
  waitingForNumber = true;
  finished = true;

  show();
}

function backspace() {
  if (waitingForNumber || finished || current === "Error") {
    current = "0";
    waitingForNumber = false;
    finished = false;
  } else {
    current =
      current.length <= 1 || (current.length === 2 && current.startsWith("-"))
        ? "0"
        : current.slice(0, -1);
  }

  show();
}

function useAction(action) {
  if (action === "clear") {
    clearCalculator();
  }

  if (action === "backspace") {
    backspace();
  }

  if (action === "decimal") {
    enterDecimal();
  }

  if (action === "equals") {
    equals();
  }

  if (action === "percent" && current !== "Error") {
    current = format(Number(current) / 100);
    show();
  }
}

// Listen for calculator button clicks.
keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  if (button.dataset.number !== undefined) {
    enterNumber(button.dataset.number);
  } else if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
  } else if (button.dataset.action) {
    useAction(button.dataset.action);
  }
});

// Support keyboard input.
document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) {
    enterNumber(event.key);
  } else if (event.key === ".") {
    enterDecimal();
  } else if (["+", "-", "*", "/"].includes(event.key)) {
    event.preventDefault();
    chooseOperator(event.key);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    equals();
  } else if (event.key === "Backspace") {
    backspace();
  } else if (event.key === "Escape") {
    clearCalculator();
  } else if (event.key === "%") {
    useAction("percent");
  }
});

show();
