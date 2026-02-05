const fs = require('fs');
const content = fs.readFileSync('components/admin/NotificationSettings.tsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
let stack = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '{') {
            balance++;
            stack.push({ line: i + 1, char: j });
        } else if (char === '}') {
            balance--;
            if (balance < 0) {
                console.log(`Error: Extra '}' at Line ${i + 1}:${j}`);
                process.exit(1);
            }
            stack.pop();
        }
    }
}

if (balance > 0) {
    console.log(`Error: Missing '}' - Balance is ${balance}`);
    console.log('Unclosed braces at:', stack.slice(-3)); // Show last 3
} else {
    console.log('Braces are balanced!');
}
