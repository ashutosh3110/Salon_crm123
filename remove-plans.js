const fs = require('fs');
const file = 'frontend/src/pages/app/AppMembershipPage.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    /\{\/\* Toggle Switch: Plans \/ My Membership \*\/\}[\s\S]*?(?=\{\/\* Render Views \*\/)/,
    ''
);

code = code.replace(
    "const [activeTab, setActiveTab] = useState('plans');",
    "const [activeTab, setActiveTab] = useState('my-membership');"
);

code = code.replace(
    /\s*<button[\s\S]*?onClick=\{\(\) => setActiveTab\('plans'\)\}[\s\S]*?<\/button>/,
    ''
);

fs.writeFileSync(file, code);
