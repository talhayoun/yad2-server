const AWS = require("aws-sdk");
const multer = require('multer');
const multerS3 = require("multer-s3");

const s3 = new AWS.S3({ region: process.env.AWS_REGION });


const fileStorage = multerS3({
    s3,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    contentDisposition: "inline",
    bucket: function (req, file, cb) {
        cb(null, req.bucket)
    },
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        const fileName = new Date().getTime() + "-" + file.originalname;
        cb(null, fileName);
    }
})

const uploadImageToS3 = multer({ storage: fileStorage }).array("images");


const createBucket = async () => {
    try {
        let bucketName = `yad2-${new Date().getTime()}`
        await s3.createBucket({
            Bucket: bucketName,
            ACL: 'public-read',
            CreateBucketConfiguration: {
                LocationConstraint: "eu-west-1"
            }
        }).promise();
        return bucketName;
    } catch (err) {
        console.log(err);
    }
}


const bucketExists = async function (req, res, next) {
    try {
        if (!req.user.bucket) {
            let bucketName = await createBucket();
            req.bucket = bucketName;
        } else {
            req.bucket = req.user.bucket;
        }
        console.log(req.bucket, "&");
        next();
    } catch (error) {
        console.log(error)
    }
}


module.exports = { uploadImageToS3, bucketExists };