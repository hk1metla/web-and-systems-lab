# Postfix Calculator

Stack-based arithmetic with a variable symbol table.

```bash
node calculator.js
node smoke_test.js
```

Examples: `2 3 +` gives 5; `A 3 =` stores a variable; `A 2 *` gives 6; `16 sqrt` gives 4. Enter `exit` to quit. The maintained release validates numeric tokens, resolves variables before arithmetic and starts each expression with a fresh operand stack.
