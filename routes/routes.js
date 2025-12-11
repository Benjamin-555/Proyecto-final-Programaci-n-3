const express = require('express')
const router = express.Router()
const Product = require('../models/products')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { resourceLimits } = require('worker_threads')

const archivoUpoload = path.join(__dirname, '../upload')

var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, archivoUpoload)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

var upload = multer({
    storage: storage
}).single('itemPhoto')



router.get('/', async (req, res) => {
    
    try{
        const products = await Product.find({})
        res.render('index', {titulo: 'Inicio', products: products})
    }
    catch(error){
        res.json({ message: error.message })
    }
})

router.get('/add', (req, res) => {
    res.render('addProduct', {titulo: 'Agregar Productos'})
})

router.post('/add', upload, (req, res) =>{
    const product = new Product({
        code: req.body.code,
        itemName: req.body.itemName,
        itemPhoto: req.file.filename,
        price: req.body.price,
        description: req.body.description,
        stock: req.body.quantityInStock
    })
    product.save().then(() => {
       req.session.message = {
        message: 'Producto agregado correctamente',
        type: 'success'
       }

        res.redirect('/')
    }).catch((error) => {
      res.json({
        message: error.message,
        type: 'danger'
      })
    })
})

//editar
router.get('/edit/:id', async (req, res) => {
    const id = req.params.id

    try{
        const product = await Product.findById(id)

        if(product == null){
            res.redirect('/')
        }
        else {
            res.render('editProduct', {
                titulo: 'editar producto',
                product: product
            })
        }
    }
    catch(error){
        res.status(500).send()
    }
})

router.post('/update/:id', upload, async (req, res) =>{
    const id = req.params.id
    let new_image = ''

    if(req.file){
        new_image = req.file.filename

        try{
            fs.unlinkSync('./upload/' + req.body.old_image)
        }
        catch(error){
            console.log(error)
        }
    }
    else{
        new_image = req.body.old_image
    }

    try{
        await Product.findByIdAndUpdate(id, {
            code: req.body.code,
            itemName: req.body.itemName,
            itemPhoto: new_image,
            price: req.body.price,
            description: req.body.description,
            stock: req.body.quantityInStock
        })

        req.session.message = {
        message: 'Producto agregado correctamente',
        type: 'success'
       }

        res.redirect('/')
    }
    catch(error){
        res.json({
            message: error.message,
            type: 'danger'
        })
    }
})

//delete
router.get('/delete/:id', async (req, res) => {
    const id = req.params.id

    try{
        const product = await Product.findByIdAndDelete(id)

        if(product != null && product.itemPhoto != ''){
            try{
                fs.unlinkSync('./upload/' + resourceLimits.itemPhoto)
            }
            catch(error){
                console.log(error)
            }
        }

        req.session.message = {
            message: 'Producto eliminado correctamente',
            type: 'info'
       }

       res.redirect('/')
    }
    catch(error){
         res.json({
            message: error.message,
            type: 'danger'
        })
    }
})

module.exports = router