const fs = require('fs');

const originalFile = 'POSBillingPage_original.jsx';
const newLayoutFile = 'new_layout.jsx';
const targetFile = 'POSBillingPage.jsx';

const originalContent = fs.readFileSync(originalFile, 'utf-8');
const newLayoutContent = fs.readFileSync(newLayoutFile, 'utf-8');

const lines = originalContent.split('\n');

// The main layout return starts at 1585, and ends around 2404
// Let's find exactly `    return (` at 1585
const startIdx = lines.findIndex(l => l.includes('return (') && l.includes('    return ('));
// We want to find the exact line 1585 or the one that has `<div className="flex flex-col h-[calc(100vh-125px)] lg:h-[calc(100vh-115px)] mt-0 overflow-hidden">`

let actualStartIndex = 1584; // 0-indexed
let actualEndIndex = 2403; // 0-indexed

// find the exact line for `        <div className="flex flex-col h-[calc(100vh-125px)] lg:h-[calc(100vh-115px)] mt-0 overflow-hidden">`
let divStartIndex = lines.findIndex(l => l.includes('<div className="flex flex-col h-[calc(100vh-125px)] lg:h-[calc(100vh-115px)] mt-0 overflow-hidden">'));
let divEndIndex = lines.findIndex(l => l.includes('            {/* ─── Modals rendered outside panel flex but inside outer wrapper ─── */}'));

if (divStartIndex !== -1 && divEndIndex !== -1) {
    // The replace target is from divStartIndex to divEndIndex - 1
    const before = lines.slice(0, divStartIndex);
    const after = lines.slice(divEndIndex);
    
    // newLayoutContent already has the div start, but wait, the end of newLayoutContent does not have the modals yet.
    // The new_layout.jsx contains exactly what should replace the main div content up to the modals.
    
    const finalContent = before.join('\n') + '\n' + newLayoutContent + '\n            {/* ─── Modals rendered outside panel flex but inside outer wrapper ─── */}\n' + after.slice(1).join('\n');
    
    fs.writeFileSync(targetFile, finalContent);
    console.log("Successfully replaced the layout.");
} else {
    console.log("Could not find start/end markers.");
    console.log(divStartIndex, divEndIndex);
}
