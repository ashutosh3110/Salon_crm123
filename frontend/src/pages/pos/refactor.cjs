const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'victus', 'Desktop', 'wapixo new one', 'frontend', 'src', 'pages', 'pos', 'POSBillingPage.jsx');
const content = fs.readFileSync(filePath, 'utf-8');

const returnIndex = content.indexOf('return (\\n        <div className="flex flex-col h-[calc(100vh-125px)] lg:h-[calc(100vh-115px)] mt-0 overflow-hidden">');
if (returnIndex === -1) {
    console.log("Could not find return statement.");
} else {
    // Find where modals start. Usually '{/* Outstanding Due Warning Popup */}'
    const modalsIndex = content.indexOf('{/* Outstanding Due Warning Popup */}');
    console.log("Return starts at:", returnIndex);
    console.log("Modals start at:", modalsIndex);
    
    // Let's write the main content part to a temp file so we can inspect it
    const mainContent = content.substring(returnIndex, modalsIndex);
    fs.writeFileSync('main_content.txt', mainContent);
    console.log("Wrote main content to main_content.txt");
}
