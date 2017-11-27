var mansNotHot = new Howl({
    src: ['sound/mans_not_hot.mp3']
});

$(".mans_not_hot").hover(function() {
    mansNotHot.stop();
    mansNotHot.play();
}, function() {
    mansNotHot.stop();
});

$(".mans_not_hot").click(function() {
    mansNotHot.stop();
    mansNotHot.play();
});
