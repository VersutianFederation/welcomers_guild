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

    function showLoginForm() {
        content.innerHTML = '<p class="lead">Please <a href="https://auth.versutian.site">sign in</a> to view your inventory.</p>';
    }

    $('#lootboxModal').on('hide.bs.modal', function (e) {
        var crateImg = document.getElementById('crate-img');
        crateImg.style.backgroundColor = "";
        crateImg.style.boxShadow = "";
        document.getElementById("close-unbox").style.display = 'none';
        document.getElementById("close-box").style.display = 'none';
        var tierEl = document.getElementById('loot-tier').innerText = "";
        var itemEl = document.getElementById('loot-item').innerText = "";
        request('https://api.versutian.site//wg/loot/inventory', function(boxes) {
            fillInventory(boxes);
        });
    });

    var unboxSound = new Howl({
        src: ['sound/unbox.mp3']
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

    var specialDrop = new Howl({
        src: ['sound/special_drop.mp3']
    });

    function fillInventory(boxes) {
        var boxData = JSON.parse(boxes);
        content.innerHTML = "";
        if (boxData.count < 1) {
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
                    unboxSound.play();
                    request('https://api.versutian.site/wg/loot/roll', function(loot) {
                        unboxSound.once('end', function() {
                            var lootData = JSON.parse(loot);
                            document.getElementById("close-unbox").style.display = 'block';
                            var tierName;
                            var tierColor;
                            var rewardSound;
                            unboxSound.stop();
                            var dropSound;
                            switch (lootData.tier) {
                                case 1:
                                    tierName = "Common";
                                    tierColor = "#B0C3D9";
                                    dropSound = commonDrop;
                                    break;
                                case 2:
                                    tierName = "Uncommon";
                                    tierColor = "#5E98D9";
                                    dropSound = uncommonDrop;
                                    break;
                                case 3:
                                    tierName = "Rare";
                                    tierColor = "#4B69FF";
                                    dropSound = rareDrop;
                                    break;
                                case 4:
                                    tierName = "Elite";
                                    tierColor = "#8847FF";
                                    dropSound = eliteDrop;
                                    break;
                                case 5:
                                    tierName = "Ambassador Select";
                                    tierColor = "#D32CE6";
                                    dropSound = ambassadorDrop;
                                    break;
                                default:
                                    break;
                            }
                            if (lootData.special) {
                                dropSound = specialDrop;
                            }
                            dropSound.play();
                            var crateImg = document.getElementById('crate-img');
                            crateImg.style.backgroundColor = tierColor;
                            crateImg.style.boxShadow = "0 0 " + lootData.tier * 2 + "px " + tierColor;
                            var tierEl = document.getElementById('loot-tier');
                            tierEl.style.color = tierColor;
                            tierEl.innerText = tierName;
                            var itemEl = document.getElementById('loot-item');
                            itemEl.style.color = tierColor;
                            itemEl.innerHTML = (lootData.special ? '<span style="color: #8650AC">Special</span> ' : '') + lootData.item;
                            document.getElementById('close-box').style.display = "block";
                        });                        
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
    request('https://api.versutian.site/auth/verify', function(verRes) {
        if (verRes != 0) {
            content.innerHTML = '';
            nation = verRes.user_id;
            request('https://api.versutian.site/wg/loot/inventory', function(boxes) {
                fillInventory(boxes);
            });
        } else {
            showLoginForm();
        }
    });
}

// load the app when page has loaded
window.onload = function() {
    app();
}
