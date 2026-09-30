const { createProduct, deleteProduct, updateProduct } = require('../../controller/admin/product/productController');
const isUserAuthenticated = require('../../middlewares/isAuthenticated');
const { storage,multer } = require('../../middlewares/multerConfig');
const restrict = require('../../middlewares/restrict');
const { updateMany } = require('../../models/productModel');
const catchAsync = require('../../services/catchAsync');
const {getProducts, getEachProducts} = require('../../controller/global/globalController')
// requirint the foncigurations for file handling that we did in the middleware asecitin
const upload = multer({storage:storage})
//using express router
const rtr = require('express').Router();
getProducts
//authenticatio routes 
// htting post request on the /register endpoint with the logics
// rtr.route('/add_product').post(createProduct)
// thisis post request wit htwo diffwentr contorller
// we fust go from is user authenticated to the create product 
// for tat the control must pass from isuserauthenticated
// then they wil be able to create product
// the next() takes us from isuserauthenticated controller to create produce controller
// see next() in action in middleware folder inside the file for isauthenticated.js
// the third paratmetr is for those who is admin and they can upload a single fiel only
// productImage alias providd must be followed when taking the image from user otehrwise eror 
rtr.route('/add_product').post(catchAsync(isUserAuthenticated), catchAsync(restrict("admin","seller")),catchAsync(upload.single('productImage')),catchAsync(createProduct))
//for all products
rtr.route('/products').get(catchAsync(getProducts))
// for each product
rtr.route('/products/:id').get(catchAsync(getEachProducts)).delete(catchAsync(isUserAuthenticated),restrict("admin","seller"),catchAsync(upload.single('productImage')),catchAsync(deleteProduct))
// the upload.single method must be used otherwist the node will nnot handle form data anf file module b\
// the only reason multer is used 
.patch(catchAsync(isUserAuthenticated), catchAsync(restrict("admin","seller")), upload.single('productImage'), catchAsync(updateProduct));

// deleting the rpoduct with an id
// rtr.route('/products/:id').get(catchAsync(getEachProducts))


module.exports = rtr;
