var imgs = document.getElementsByTagName('img');
for (var img of imgs) {
    var url = img.getAttribute('isrc');
    img.src = url;
}