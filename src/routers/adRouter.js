const express = require("express");
const { auth } = require("../middleware/auth");
const { filterProperties } = require("../middleware/filter");
const { uploadImageToS3, bucketExists } = require("../middleware/s3");
const router = new express.Router();
const Ad = require("../models/AdSchema");
const User = require("../models/userSchema");


router.post("/new-ad", auth, bucketExists, uploadImageToS3, async (req, res) => {
    try {
        console.log(req.files)
        console.log(req.body)

        //Creating a new ad to database with the data provided,
        // adding user id as reference.

        const ad = await new Ad({
            assetType: req.body.assetType,
            balcony: req.body.balcony,
            city: req.body.city,
            street: req.body.street,
            date: req.body.date,
            email: req.body.email,
            floorNumber: req.body.floorNumber,
            houseCommitte: req.body.houseCommitte,
            parking: req.body.parking,
            paymentAmount: req.body.paymentAmount,
            phone: req.body.phone,
            price: req.body.price,
            propertyTax: req.body.propertyTax,
            roomsNumber: req.body.roomsNumber,
            size: req.body.size,
            totalSize: req.body.totalSize,
            textarea: req.body.textarea,
            totalFloorNumber: req.body.totalFloorNumber,
            username: req.body.username,
            user: req.user._id
        });
        if (!ad) {
            return res.send({ err: "Failed to create a new ad" });
        }

        //Adding images to the ad aswell as filtering and adding 
        //main image to the specificed location in databse.

        for (let i = 0; i < req.files.length; i++) {
            if (req.files[i].originalname.startsWith("mainImage"))
                ad.mainImage = req.files[i].location;
            else if (req.files[i].originalname.startsWith("mainVideo"))
                ad.video = req.files[i].location;
            else
                ad.images = ad.images.concat({ image: req.files[i].location });
        }

        //Properties recevied as a string, converting it into an array and adding it
        // one by one.

        let splitProperties = req.body.properties.split(",");
        for (let i = 0; i < splitProperties.length; i++) {
            ad.properties = ad.properties.concat({ property: splitProperties[i] })
        }
        await ad.save()

        const user = req.user;
        user.bucket = req.bucket;
        user.ads = user.ads.concat({ ad: ad._id });
        await user.save();
        console.log("Saved ad to user")

        res.send({ ad });

    } catch (err) {
        res.send({ err: "Failed to create new ad" });
    }
})


router.get("/ads", async (req, res) => {
    try {
        const ads = await Ad.find();
        if (!ads) {
            return res.send({ err: "Failed to get ads" });
        }
        res.send({ ads })
    } catch (err) {
        res.send({ err: "Failed to get ads" });
    }
})

router.post("/ads/filter/extra", async (req, res) => {
    try {
        req.body.sizeFrom = req.body.sizeFrom ? req.body.sizeFrom : '0';
        req.body.sizeTo = req.body.sizeTo ? req.body.sizeTo : '999';
        req.body.floorFrom = req.body.floorFrom ? req.body.floorFrom : '0'
        req.body.floorTo = req.body.floorTo ? req.body.floorTo : '999';
        req.body.date = req.body.date ? req.body.date : '2021-10-08'
        req.body.properties = req.body.properties.length === 0 ? ["דלתות פנדור", 'ממ"ד', "מרוהטת", "חניה", "סורגים", "חיות מחמד", "מעלית", "מחסן", "לשותפים", "מיזוג", "לטווח ארוך", "גישה לנכים", "מרפסת", "משופצת", "בבלעדיות"] : req.body.properties;
        console.log(req.body)
        const filterAds = await Ad.find(
            {
                'properties.property': req.body.properties,
                floorNumber: {
                    $gte: req.body.floorFrom,
                    $lte: req.body.floorTo
                },
                size: {
                    $gte: req.body.sizeFrom,
                    $lte: req.body.sizeTo
                },
                date: {
                    $gte: req.body.date
                }
            }
        );
        console.log(filterAds)
        if (!filterAds) {
            return res.send({ err: "Failed to filter ads" })
        }
        res.send({ filterAds })
    } catch (error) {
        res.send({ err: "Failed to filter ads" })
    }
})

router.post("/ads/filter", async (req, res) => {
    try {
        console.log(req.body)
        let roomFrom = req.body.roomFrom || 0;
        let roomTo = req.body.roomTo || 99;
        if (roomFrom === "all") roomFrom = 0;
        if (roomTo === "all") roomTo = 99;
        let priceFrom = req.body.priceFrom || 0
        let priceTo = req.body.priceTo || 9999;
        let assetType = req.body.assetType.length === 0 ? ["דירה", "דירת גן", "גג\\פנטאהוז", "דופלקס", "דירת נופש", "מרתף\\פרטר", "טריפלקס", "יחידת דיור", "החלפת דירות", "סטודיו\\לופט", "סאבלט", 'בית פרטי\\קוט"ג', "דו משפחתי", "משק חקלאי\\נחלה", "משק עזר", "מגרשים", "דיור מוגן", "בניין מגורים", "מחסן", "חניה", "קב' רכישה\\ זכות לנכס", "כללי"] : req.body.assetType;
        let assetName = req.body.assetName || undefined;
        let city = req.body?.assetValue === "city" ? assetName : undefined;
        let street = req.body?.assetValue === "city" ? undefined : assetName;
        if (req.body?.assetValue === "street") {
            street = req.body?.assetName.split(",")[1]?.trim();
            city = req.body?.assetName.split(",")[0]
        }
        if (assetName === undefined) {
            city = undefined,
                street = undefined;
        }
        console.log(`roomFrom:, ${roomFrom} roomTo: ${roomTo} priceFrom: ${priceFrom} priceTo: ${priceTo}`)
        console.log(`assetName: ${assetName} city: ${city} street: ${street}`)
        console.log(`assetType:${assetType}`)
        let filterAd = await Ad.find({
            roomsNumber: {
                $gte: roomFrom,
                $lte: roomTo
            },
            price: {
                $gte: priceFrom,
                $lte: priceTo
            },
            assetType,
            city: city,
            street: street,
        })
        console.log(filterAd)
        if (!filterAd)
            return res.send({ err: "failed to filter" })

        res.send({ filterAd })
    } catch (error) {
        console.log(error)
        res.send({ err: "failed to filter" })
    }
})

router.post("/getAd", async (req, res) => {
    try {
        const ad = await Ad.findOne({ _id: req.body.ID });
        if (!ad) {
            return res.send({ err: "Failed to get ad" })
        }
        res.send({ ad });
    } catch (error) {
        res.send({ err: "Failed to get add" })
    }
})

module.exports = router;