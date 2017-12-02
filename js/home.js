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

    request('https://api.versutian.site/wg/points/get', function(data) {
        var leaderboard = JSON.parse(data);
        var leaderboardEl = document.getElementById('leaderboard');
        var position = 1;
        Object.entries(leaderboard).forEach(function (nation) {
            var name = nation[0];
            var data = nation[1];
            var linkCont = document.createElement('a');
            linkCont.setAttribute('class', 'list-group-item list-group-item-action flex-column align-items-start');
            var flexDiv = document.createElement('div');
            flexDiv.setAttribute('class', 'd-flex w-100 justify-content-between');
            linkCont.appendChild(flexDiv);
            var header = document.createElement('h5');
            var position = document.createElement('b');
            position.innerText = position + ".";
            header.appendChild(position);
            position++;
            var flag = document.createElement('img');
            flag.setAttribute('class', 'img-fluid flag');
            flag.src = nation.flagImg;
            header.appendChild(flag);
            header.innerHTML += " " + nation.displayName;
            flexDiv.appendChild(header);
            var pointsCont = document.createElement('small');
            pointsCont.innerHTML = nation.livePoints + " <b>WGP</b>";
            var pill = document.createElement('span');
            pill.setAttribute('class', 'badge badge-pill');
            var indicator;
            if (nation.gain === 0) {
                pill.classList.add('badge-success');
                indicator = '';
            } else if (nation.gain > 0) {
                pill.classList.add('badge-secondary');
                indicator = '+';
            } else {
                pill.classList.add('badge-danger');
                indicator = '-';
            }
            var hover = document.createElement('abbr');
            hover.title = indicator + nation.gain;
            hover.innerText = indicator + (nation.gain + nation.bonus);
            pill.appendChild(hover);
            pointsCont.appendChild(pill);
            flexDiv.appendChild(pointsCont);
            leaderboardEl.appendChild(linkCont);
        });
    });
}

// load the app when page has loaded
window.onload = function() {
    app();
}
