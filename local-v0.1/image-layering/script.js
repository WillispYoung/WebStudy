function wait(ms) {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve(ms)
        }, ms)
    })
}

// window.onload = function() {
//     var images = document.getElementsByTagName('img');
//     var index = 0;

//     async function loadImage() {
//         let img = new Image();
//         img.onload = async function() {
//             images[index].src = images[index].getAttribute('data-src');
//             await wait(100);

//             index += 1;
//             if (index === images.length) return;
//             else loadImage();
//         }
//         img.src = images[index].getAttribute('data-src');
//     }

//     loadImage();
// }

window.onload = function() {
    var imgs = [
        "seller/seller-ad-1.jpg",
        "seller/seller-ad-2.jpg",
        "seller/seller-ad-3.jpg"
    ];
    var index = 0;
    var count = 0;
    var ad = document.getElementById('ad');
    var interval = setInterval(function() {
        index += 1;
        index %= 3;
        ad.src = imgs[index];

        count += 1;
        if (count >= 3) clearInterval(interval);
    }, 1000);
}