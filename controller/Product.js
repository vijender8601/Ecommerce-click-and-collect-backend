const { Product } = require("../model/Product")


exports.createProduct = async (req, res) => {
    const product = new Product(req.body)
    try{
        const response = await product.save();
        res.status(201).json(response)
    } catch(err){
        res.status(400).json(err);
    }
}

exports.fetchAllProducts = async (req, res) => {

    let condition = {}; // to make sure that deleted product just show to admin

    if(!req.query.admin)
    {
        condition.deleted = {$ne:true}
    }
    // TODO : we have to try with multiple categories and brands is front end

    let query = Product.find(condition);
    let totalProductsQuery = Product.find(condition);

    // filter = {'category':['smartphones','laptops']}
    // sort = {_sort:"price",_order="desc"}
    // pagination = {_page:1,_limit=10}

    if(req.query.category)
    {
        query = query.find({ category: req.query.category});
        totalProductsQuery = totalProductsQuery.find({ category: req.query.category});
    }

    if(req.query.brand)
    {
        query = query.find({ brand: req.query.brand});
        totalProductsQuery = totalProductsQuery.find({ brand: req.query.brand});
    }

    // TODO: try to implement sort according to price after discount
    if(req.query._sort && req.query._order) {
        query = query.sort({ [req.query._sort] : req.query._order});
    }

    const totalDocs = await totalProductsQuery.countDocuments().exec();
    console.log({totalDocs});
    if(req.query._page && req.query._limit)
    {
        const pageSize = req.query._limit;
        const page = req.query._page;

        query = query.skip(pageSize * (page-1)).limit(pageSize);
    }

    try{
        const response = await query.exec();
        res.set('X-Total-Count', totalDocs);
        res.status(200).json(response)
    } catch(err){
        res.status(400).json(err);
    }
}

exports.fetchProductById = async(req, res) => {
    const {id} = req.params
    try {
    let item = await Product.findById(id)
    res.status(200).json(item);
    } catch(err)
    {
        res.status(400).json(err);
    }
}

exports.updateProduct= async(req, res) => {
    const {id} = req.params
    try {
    let product = await Product.findByIdAndUpdate(id, req.body, {new:true});
    res.status(200).json(product);
    } catch(err)
    {
        res.status(400).json(err);
    }
}