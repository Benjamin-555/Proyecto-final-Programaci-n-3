const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    itemName: {
        type: String,
        required: true
    },
    itemPhoto: {
        type: String,     // URL de la imagen o nombre del archivo
        required: false
    },
    description: {
        type: String,
        required: false
    },
    quantityInStock: {
        type: Number,
        required: true,
        default: 0
    },
    price: {
        type: Number,
        required: true
    }
})

const product = mongoose.model('product', productSchema)

module.exports = product