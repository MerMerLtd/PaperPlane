# PaperPlane
Large File Transfer Service

## Deploy
```shell
git clone https://github.com/MerMerLtd/PaperPlane
cd PaperPlane
npm i
npm start
```

## Metadata
- rootHash
- totalSlice
- fileName
- fileSize
- contentType

## Slice
- totalSlice
- sliceIndex
- sliceBuffer

## Password
- algorithm: HMACSHA256(password, salt)
- salt: new Date().getTime.toString(16)
