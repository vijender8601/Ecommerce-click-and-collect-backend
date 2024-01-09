const express = require('express')

const { fetchCategories, createCategory } = require('../controller/Category');
const { fetchBrands } = require('../controller/Brand');

const router = express.Router();

//after "/categories"
router.get('/',fetchCategories).post('/', createCategory);

exports.router = router;