const { Cart } = require("../model/Cart");

exports.fetchCartByUser = async (req, res) => {
    const {id} = req.user;
    try {
        const cart = await Cart.find({user: id}).populate('product');
        res.status(200).json(cart);
    } catch(err)
    {
        res.status(400).json(err);
    }
}

exports.addToCart = async (req, res) => {
    const {id} = req.user;
    const cart = new Cart({...req.body, user : id})
    try{
        const doc = await cart.save();
        const response = await doc.populate('product');
        res.status(201).json(response)
    } catch(err){
        res.status(400).json(err);
    }
}

exports.deleteToCart = async (req, res) => {
    const {id} = req.params;
    try{
        const doc = await Cart.findByIdAndDelete(id);
        res.status(200).json(doc)
    } catch(err){
        res.status(400).json(err);
    }
}

exports.updateCart= async(req, res) => {
    const {id} = req.params
    try {
    const cart = await Cart.findByIdAndUpdate(id, req.body, {new:true});
    // console.log(cart);
    const response = await cart.populate('product');
    res.status(200).json(response);
    } catch(err)
    {
        res.status(400).json(err);
    }
}