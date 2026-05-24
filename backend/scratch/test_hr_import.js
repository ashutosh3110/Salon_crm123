try {
    console.log('Loading models and controllers...');
    require('../Controllers/hrController');
    console.log('Controller loaded successfully.');
    
    require('../Routers/hrRoutes');
    console.log('Router loaded successfully.');
    
    console.log('All backend modifications syntax check PASSED!');
    process.exit(0);
} catch (error) {
    console.error('Import failed with error:', error);
    process.exit(1);
}
