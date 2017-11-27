function app() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyBmCjNVn97PxEFbrnaLQAxwx8FiEQQ77t4",
        authDomain: "versutianpolls.firebaseapp.com",
        databaseURL: "https://versutianpolls.firebaseio.com",
        projectId: "versutianpolls",
        storageBucket: "versutianpolls.appspot.com",
        messagingSenderId: "123573167787"
    };
    firebase.initializeApp(config);

    var content = document.getElementById('content');
    var nation;

    function request(url, callback, xml) {
        var xhr = new XMLHttpRequest();
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
        xhr.open("GET", url);
        xhr.send();
    }

    function showLoginForm() {
        content.innerHTML = '<p class="lead">Please <a href="https://auth.versutian.site">sign in</a> to view your inventory.</p>';
    }

    $('#lootboxModal').on('hide.bs.modal', function (e) {
        document.getElementById("close-unbox").style.display = 'none';
        var tierEl = document.getElementById('loot-tier').innerText = "";
        var itemEl = document.getElementById('loot-item').innerText = "";
        request('https://api.versutian.site/boxes?nation=' + nation, function(boxes) {
            fillInventory(boxes);
        });
    });

    var commonDrop = new Howl({
        src: ['sound/common_drop.mp3']
    });

    var uncommonDrop = new Howl({
        src: ['sound/uncommon_drop.mp3']
    });

    var rareDrop = new Howl({
        src: ['sound/rare_drop.mp3']
    });

    var eliteDrop  = new Howl({
        src: ['sound/elite_drop.mp3']
    });

    var ambassadorDrop = new Howl({
        src: ['sound/ambassador_drop.mp3']
    });

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

    function fillInventory(boxes) {
        var boxData = JSON.parse(boxes);
        content.innerHTML = "";
        if (boxData.count === 0) {
            content.innerHTML = '<p class="lead">You do not have any lootboxes.</p>';
        } else {
            var row = document.createElement("div");
            row.classList.add('row');
            for (var i = 0; i < boxData.count; i++) {
                var col = document.createElement("div");
                col.setAttribute('class', 'col box-item');
                var img = document.createElement("img");
                img.classList.add("img-fluid")
                img.setAttribute("src", "img/crate.png");
                var button = document.createElement("button");
                button.setAttribute("type", "button");
                button.setAttribute("class", "btn btn-primary");
                button.addEventListener('click', function() {
                    $('#lootboxModal').modal('show');
                    request('https://api.versutian.site/loot?nation=' + nation, function(loot) {
                        var lootData = JSON.parse(loot);
                        document.getElementById("close-unbox").style.display = 'block';
                        var tierName;
                        var tierColor;
                        var rewardSound;
                        switch (lootData.tier) {
                            case 1:
                                tierName = "Common";
                                tierColor = "#B0C3D9";
                                commonDrop.play();
                                break;
                            case 2:
                                tierName = "Uncommon";
                                tierColor = "#5E98D9";
                                uncommonDrop.play();
                                break;
                            case 3:
                                tierName = "Rare";
                                tierColor = "#4B69FF";
                                rareDrop.play();
                                break;
                            case 4:
                                tierName = "Elite";
                                tierColor = "#8847FF";
                                eliteDrop.play();
                                break;
                            case 5:
                                tierName = "Ambassador Select";
                                tierColor = "#D32CE6";
                                ambassadorDrop.play();
                                break;
                            default:
                                break;
                        }
                        var tierEl = document.getElementById('loot-tier');
                        tierEl.style.color = tierColor;
                        tierEl.innerText = tierName;
                        var itemEl = document.getElementById('loot-item');
                        itemEl.style.color = tierColor;
                        itemEl.innerText = (lootData.special ? "Special " : "") + lootData.item;
                        document.getElementById('close-box').style.display = "block";
                    });
                });
                button.innerText = 'Open lootbox';
                col.appendChild(img);
                col.appendChild(button);
                row.appendChild(col);
            }
            content.appendChild(row);
        }
    }

    // are we logged in?
    var token = document.cookie.replace(/(?:(?:^|.*;\s*)__Secure-token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    if (token) {
        token = KJUR.jws.JWS.parse(token);
        if (token) {
            content.innerHTML = '';
            nation = token.payloadObj.user_id;
            request('https://api.versutian.site/boxes?nation=' + nation, function(boxes) {
                fillInventory(boxes);
            });
        } else {
            showLoginForm();
        }
    } else {
        showLoginForm();
    }
}

// load the app when page has loaded
window.onload = function() {
    app();
}