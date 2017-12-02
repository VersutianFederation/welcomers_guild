function app() {

    function request(url, callback, xml) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function() {
            // check if we are on NS API cooldown
            if (url.startsWith('https://www.nationstates.net/cgi-bin/api.cgi?nation=')) {
                // notify the user that they're on API cooldown
                if (xhr.status === 429) {
                    // notify the user once
                    if (!nsBan) {
                        alert('You have been banned for ' + xhr.getResponseHeader('x-retry-after') + ' seconds by the NationStates API');
                        nsBan = true;
                    }
                    // don't callback, we didn't data
                    return;
                } else {
                    // reset ban notification tracker
                    nsBan = false;
                }
            }
            // give our callback XML if it requested it
            callback(xml ? xhr.responseXML : xhr.responseText);
        };
        xhr.withCredentials = true;
        xhr.send();
    }

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
}

// load the app when page has loaded
window.onload = function() {
    app();
}
