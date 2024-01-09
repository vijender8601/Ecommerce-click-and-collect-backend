
const { User } = require("../model/User");

exports.fetchUserById = async (req, res) => {
    const {id} = req.user
    try {
        const user = await User.findById(id);
        // console.log(user, "here in fetch user by id");
        res.status(200).json({id: user.id, addresses: user.addresses, email: user.email, role: user.role});
    } catch(err)
    {
        res.status(400).json(err);
    }
}


exports.updateUser= async(req, res) => {
    const {id} = req.params
    console.log("hii", req.params, req.body);
    
    try {
    let user = await User.findByIdAndUpdate(id, req.body, {new:true});
    console.log(req.body);
    res.status(200).json(user);
    } catch(err)
    {
        res.status(400).json(err);
    }
}