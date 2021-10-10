const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema({
    assetType: {
        type: String
    },
    balcony: {
        type: String
    },
    city: {
        type: String
    },
    date: {
        type: String
    },
    email: {
        type: String
    },
    username: {
        type: String
    },
    floorNumber: {
        type: String
    },
    houseCommitte: {
        type: String
    },
    houseNumber: {
        type: String
    },
    images: [
        {
            image: {
                type: String
            }
        }
    ],
    mainImage: {
        type: String
    },
    parking: {
        type: String
    },
    paymentAmount: {
        type: String
    },
    phone: {
        type: String
    },
    price: {
        type: String
    },
    propertyTax: {
        type: String
    },
    properties: [
        {
            property: {
                type: String
            }
        }
    ],
    roomsNumber: {
        type: String
    },
    size: {
        type: String
    },
    street: {
        type: String
    },
    textarea: {
        type: String
    },
    totalFloorNumber: {
        type: String
    },
    totalSize: {
        type: String
    },
    video: {
        type: String
    },
    user: {
        type: mongoose.Types.ObjectId
    }
});

const Ad = mongoose.model("ads", AdSchema);

module.exports = Ad;