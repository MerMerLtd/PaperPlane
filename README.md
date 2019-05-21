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

## Route
```shell
Router.prototype.route = async hash => {
    console.trace(hash)
    switch (true) {
        case hash.startsWith("#terms/privacy"):
            renderPrivacyPolicy();
            break;
        case hash.startsWith("#terms"):
            renderTerms();
            break;
        case hash.startsWith("#purchase"):
            renderPurchasePage();
            break;
        case hash.startsWith("#send"):
            renderDropView();
            break;
        case hash.startsWith("#receive"):
            if (window.location.hash.match(/\d{6}/)) {
                checkURL();
            } else {
                console.log("render renderDownloadInput")
                renderDownloadInput();
            }
            break;
        case hash.startsWith("#sign-in"):
            renderLoginView("sign-in");
            break;
        case hash.startsWith("#sign-up"):
            renderLoginView("sign-up");
            break;
        case hash.startsWith("#verification-success"):
            renderVerifyResultView(true);
            break;
        case hash.startsWith("#verification-fail"):
            renderVerifyResultView(false);
            break;
        case hash.startsWith("#confirm"):
            renderConfirmPage();
            break;
        case hash.startsWith("#deposit"):
            renderConfirmPage();
            break;
        default:
            break;
    }
}
```
