const express = require('express')

const { fetchBrands, createBrand } = require('../controller/Brand');

const router = express.Router();

//after "/brands"
router.get('/',fetchBrands).post('/',createBrand);

exports.router = router;