const Product = require("../../../models/productModel");
const fs = require("fs");
const path = require("path");
// Include .env to access environment variables
require('dotenv').config();

exports.createProduct = ((req, res) => {
    try {
        // getting file metadata
        const file = req.file
        // setting default filepath as some image
        let filepath
        if (!req.file) {
            filepath = "https://artists.spotify.com/songwriter/3IMp1zKhmOEmva4eNPGZKf"
        } else {
            const base = (process.env.BACKEND_URL || 'http://localhost:3000/').replace(/\/?$/, '/')
            filepath = base + req.file.filename
        }
        console.log(file)
        console.log(req.user);
        // return;
        // support both legacy userProduct* and new product* keys from frontend FormData
        const userProductName = req.body.userProductName || req.body.productName;
        const userProductPrice = req.body.userProductPrice || req.body.productPrice;
        const userProductDescription = req.body.userProductDescription || req.body.productDescription;
        const userProductStatus = req.body.userProductStatus || req.body.productStatus || 'public';
        const userProductStock = req.body.userProductStock || req.body.productStock;
        // if any of the above information is not provided give 400 status error
        if (!userProductName || !userProductPrice || !userProductDescription || !userProductStatus || !userProductStock) {
            // send 400 status with required product field not filled 
            return res.status(400).json({
                message: "given product field must be filled compulsarily"
            })
        }
        // insert to the Products collectionin mongo db 
        Product.create({
            productName: userProductName,
            productPrice: userProductPrice,
            productDescription: userProductDescription,
            productStatus: userProductStatus,
            productStock: userProductStock,
            // setting image as filename
            productImage: filepath,
        })
            .then((product) => {
                res.status(201).json({
                    message: "product created successfully",
                    product: product
                })
            })
    } catch (err) {
        console.log(err.message)
        res.status(500).json({
            message: "Something went wrong"
        })

    }


})

exports.deleteProduct = async (req, res) => {
    const { id } = req.params
    if (!id) {
        return res.status(400).json({
            message: "Please provide id"
        })
    }
    // deleting old data while 
    const oldData = await Product.findById(id)
    if (!oldData) {
        return res.status(404).json({
            message: "No data found with that id"
        })
    }

    const oldProductImage = oldData.productImage || "" // http://localhost:3000/1698943267271-bunImage.png"
    if (oldProductImage.includes("spotify.com") || !oldProductImage.startsWith("http")) {
        // nothing to delete on disk
    } else {
    const baseLen = (process.env.BACKEND_URL || 'http://localhost:3000/').length
    const finalFilePathAfterCut = oldProductImage.slice(baseLen).replace(/^\//,'')
    // REMOVE FILE FROM UPLOADS FOLDER
    const absPath = path.join(__dirname, "..", "..", "..", "uploads", finalFilePathAfterCut)
    fs.unlink(absPath, (err) => {
        if (err) {
            console.log("error deleting file", err)
        } else {
            console.log("file deleted successfully")
        }
    })
    }
    await Product.findByIdAndDelete(id)
    res.status(200).json({

        message: "Product delete successfully"
    })

}


exports.updateProduct = async (req, res) => {
    // kicking off user without id parameters
    const { id } = req.params
    if (!id) {
        return res.status(400).json({
            message: "provide the ID"
        })
    }

    // getting the old photo and deleting the,m
    const productToEdit = await Product.findById(id);
    if (!productToEdit) {
        return res.status(404).json({
            message: "no dtaa with that id",
        })
        // if product to be edited is found
    } else {
        // Log the entire body to see the received data

        // Destructure the data from the body
        const { updatedUserProductName, updatedUserProductPrice, updatedUserProductDescription, updatedUserProductStatus, updatedUserProductStock } = req.body;
        console.log('Request Body:', req.body);

        // Validate if any field is missing
        if (!updatedUserProductName || !updatedUserProductPrice || !updatedUserProductDescription || !updatedUserProductStatus || !updatedUserProductStock) {
            return res.status(400).json({
                message: "Given product field must be filled compulsorily",
                bodyfile: req.file
            });
        }

        // Proceed with the rest of your code

        // if any of the above information is not provided give 400 status error

        // taking productImage value from the json of product
        const imageToEdit = productToEdit.productImage;//http://localhost:3000/abc.png
        const toCut = process.env.BACKEND_URL.length;//
        // giving absolute path bu cuttingthe URL part and only feeding image part
        const finalFilePathAfterCut = "./uploads/" + imageToEdit.slice(toCut)//abc.png
        console.log(finalFilePathAfterCut + "=========");
        // if user has added a file wit hfilename request then delete previous image
        if (req.file && req.file.filename) {
            fs.unlink(finalFilePathAfterCut, (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("deleted file successfully")
                }
            })

        }

        const updatedData = await Product.findByIdAndUpdate(id, {
            productName: updatedUserProductName,
            productPrice: updatedUserProductPrice,
            productDescription: updatedUserProductDescription,
            productStatus: updatedUserProductStatus,
            productStock: updatedUserProductStock,
            // setting image as filename if give nfile give path else give old filepath name
            productImage: (req.file && req.file.filename) ? process.env.BACKEND_URL + "" + req.file.filename : imageToEdit
        }, {
            new: true
        })
        res.status(200).json({
            message: "successfully updated image",
            data: updatedData
        })
    }
}
