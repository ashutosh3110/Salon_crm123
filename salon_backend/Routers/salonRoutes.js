const express = require('express');
const router = express.Router();
const { 
    createSalon, 
    getSalons, 
    getSalon, 
    updateSalon, 
    deleteSalon,
    getSalonStats
} = require('../Controllers/salonController');

router.get('/stats', getSalonStats);
router.post('/', createSalon);
router.get('/', getSalons);
router.get('/:id', getSalon);
router.put('/:id', updateSalon);
router.delete('/:id', deleteSalon);

module.exports = router;
