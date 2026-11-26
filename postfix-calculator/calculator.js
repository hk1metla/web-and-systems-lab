const readline = require('readline');

// Class to manage the stack
class Stack {
    constructor() {
        this.stack = [];
    }

    push(value) {
        this.stack.push(value);
    }

    pop() {
        if (this.isEmpty()) {
            throw new Error('Stack underflow');
        }
        return this.stack.pop();
    }

    peek() {
        if (this.isEmpty()) {
            throw new Error('Stack is empty');
        }
        return this.stack[this.stack.length - 1];
    }

    isEmpty() {
        return this.stack.length === 0;
    }
}

// SymbolTable class for managing variables
class SymbolTable {
    constructor() {
        this.table = new Map();
    }

    // Insert a variable with its value (allow overwriting)
    insert(name, value) {
        this.table.set(name, value); // Overwrite the value if the variable exists
    }

    // Get value of a variable with a fallback default value
    get(name) {
        if (!this.table.has(name)) {
            // If variable does not exist, return a default value
            console.log(`Warning: Variable '${name}' is undefined, defaulting to 0.`);
            return 0; // Default value for undefined variable
        }
        return this.table.get(name);
    }

    // Delete a variable
    delete(name) {
        if (!this.table.has(name)) {
            throw new Error('Variable does not exist');
        }
        this.table.delete(name);
    }
}

// Postfix++ Calculator to handle postfix expressions and variable assignments
class PostfixCalculator {
    constructor() {
        this.stack = new Stack();
        this.symbolTable = new SymbolTable();
    }

    // Evaluate a postfix expression
    evaluatePostfix(expression) {
        this.stack = new Stack();
        const tokens = expression.trim().split(/\s+/); // Split expression into tokens

        for (let token of tokens) {
            if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(token)) {
                this.stack.push(parseFloat(token)); // Push operand (number)
            } else if (/^[A-Z]$/.test(token)) { // Single uppercase letter for variables
                this.stack.push(token); // Push variable name as a string
            } else if (['+', '-', '*', '/', '^', 'sqrt', 'log', 'convert'].includes(token)) {
                this.handleOperator(token); // Handle operators
            } else if (token === '=') {
                this.handleAssignment(); // Handle assignment
            } else {
                throw new Error(`Invalid token: '${token}'`); // Improved error message
            }
        }

        // If there are remaining items in the stack, return the top item
        if (this.stack.stack.length > 1) throw new Error('Expression leaves unused operands');
        return this.stack.isEmpty() ? undefined : this.stack.pop();
    }

    // Handle operator +, -, *, /, ^, sqrt, log, convert
    handleOperator(operator) {
        let result;
        let a, b;
        if (['sqrt', 'log', 'convert'].includes(operator)) {
            a = this.stack.pop();
        } else {
            b = this.stack.pop();
            a = this.stack.pop();
        }

        if (typeof a === 'string' && /^[A-Z]$/.test(a)) a = this.symbolTable.get(a);
        if (typeof b === 'string' && /^[A-Z]$/.test(b)) b = this.symbolTable.get(b);
        switch (operator) {
            case '+':
                result = a + b;
                break;
            case '-':
                result = a - b;
                break;
            case '*':
                result = a * b;
                break;
            case '/':
                if (b === 0) throw new Error('Division by zero');
                result = a / b;
                break;
            case '^':
                result = Math.pow(a, b);
                break;
            case 'sqrt':
                if (a < 0) throw new Error('Square root undefined for negative numbers');
                result = Math.sqrt(a);
                break;
            case 'log':
                if (a <= 0) throw new Error('Logarithm undefined for non-positive numbers');
                result = Math.log(a);
                break;
            case 'convert':
                result = parseInt(a, 10).toString(16).toUpperCase();
                break;
            default:
                throw new Error(`Unknown operator: '${operator}'`);
        }

        this.stack.push(result); // Push result back to the stack
    }

    // Handle variable assignment (e.g., A 3 = assigns 3 to A)
    handleAssignment() {
        const value = this.stack.pop(); // Get the value to assign
        const variable = this.stack.pop(); // Get the variable name

        // Ensure the variable name is valid (a single uppercase letter)
        if (typeof variable !== 'string' || !/^[A-Z]$/.test(variable)) {
            throw new Error(`Invalid variable name: '${variable}'`);
        }

        this.symbolTable.insert(variable, value); // Assign the value to the variable
        console.log(`Assigned value ${value} to variable ${variable}`);
    }
}

// Main function to run the calculator interactively
function runCalculator() {
    const calc = new PostfixCalculator();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Function to prompt user for input and evaluate the postfix expression
    function promptUser() {
        rl.question('Enter a postfix expression (or "exit" to quit): ', (input) => {
            if (input.toLowerCase() === 'exit') {
                rl.close();
                return;
            }

            try {
                const result = calc.evaluatePostfix(input);
                console.log(`Result: ${result}`);
            } catch (error) {
                console.log(`Error: ${error.message}`);
            }

            promptUser(); // Prompt for next input
        });
    }

    // Start prompting the user
    promptUser();
}

if (require.main === module) runCalculator();
module.exports = {Stack, SymbolTable, PostfixCalculator};
