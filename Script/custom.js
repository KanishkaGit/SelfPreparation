function onload() {
    var id = getQueryStringValue("id");
    getRoute(id);
}


function getRoutefforNext() {
    var id = getQueryStringValue("id");
    getRoute(parseInt(id) + 1);
}

function getNextTopic(id, actual_JSON) {
    var nextId = parseInt(id) + 1;
    var nextTopic = actual_JSON.filter(data => {
        return data.id == nextId;
    })["0"];
    if (nextTopic == undefined) {
        nextTopic = actual_JSON.filter(data => {
            return data.id == 0;
        })["0"];
    }
    document.querySelector("#nextButton").innerHTML = `Next : ${nextTopic.name}  &#x21ac;`;
}
function getQueryStringValue(key) {
    return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'route.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function getRoute(id) {
    loadJSON(function (response) {
        currentContext: String;
        var actual_JSON = JSON.parse(response);
        var active = actual_JSON.filter(data => {
            return data.id == id;
        });
        if (active["0"] == undefined) {
            this.currentContext = actual_JSON.filter(data => {
                return data.id == 0;
            })["0"];
        } else {
            this.currentContext = active["0"];
        }
        getNextTopic(this.currentContext.id, actual_JSON);
        updateURL(this.currentContext.id);
        callAjax(this.currentContext.screenName);
    });
}

function callAjax(screenName) {
    doAjax(screenName);
}


function doAjax(screenName) {
    //var baseURL = `https://kanishkagit.github.io/selfPreparation/WebPages/${screenName}`;
    var baseURL = `http://127.0.0.1:5500/WebPages/${screenName}`;
    fetch(baseURL).then(response => {
        response.text().then(data => {
            document.querySelector("#result").innerHTML = data;
            getContent();
            getTagsforPage();
        }).catch(err => {
            console.log("Error is ", err);
        })
    }).catch(err => {
        console.log("Fail is ", err);
    });
}

function updateURL(id) {
    if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + id;
        window.history.pushState({ path: newurl }, '', newurl);
    }
}

//Get Content from route json file
function getContent() {
    if (document.querySelector('#content-table').innerHTML = '') {
    } else {
        loadJSON(function (response) {
            var routeJson = JSON.parse(response).filter(data => {
                return data.id > 0;
            });
            var contentList = '';
            routeJson.forEach(element => {
                contentList += `<a class="dropdown-item" onclick="getRoute(${element.id})" href='#'>`;
                contentList += element.name;
            });
            document.querySelector('#content-table').innerHTML = contentList;
        });
    }
}

//get Tags for page content
function getTagsforPage() {
    let nodeId = 0;
    let tagsHtml = '';
    if (document.querySelector('.heading-name') !== null) {
        document.querySelectorAll('.heading-name').forEach(node => {
            node.setAttribute('id', nodeId + 1);
            tagsHtml += `<a class='btn btn-sm btn-primary mr-1' href='#${nodeId}'>${node.innerHTML}</a>`;
            document.querySelector('#tag-section').innerHTML = tagsHtml
            nodeId++;
        });
    }
}