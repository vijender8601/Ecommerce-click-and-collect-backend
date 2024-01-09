const express = require('express');
const { addToCart, fetchCartByUser, deleteToCart, updateCart } = require('../controller/Cart');


const router = express.Router();

router.post('/', addToCart)
       .get('/',fetchCartByUser)
       .delete('/:id', deleteToCart)
       .patch('/:id', updateCart);

exports.router = router;