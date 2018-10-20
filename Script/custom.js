function onload() {
    var id = Number(getQueryStringValue("id"));
    var sid = Number((getQueryStringValue("subid") == undefined) ? 0 : getQueryStringValue("subid"));
    getRoute(id, sid);
}


function getRoutefforNext() {
    var id = Number(getQueryStringValue("id"));
    var sid = Number((getQueryStringValue("subid") == undefined) ? 0 : getQueryStringValue("subid"));
    (sid == 0) ? getRoute(id + 1, sid) : getRoute(id, sid + 1);
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

function getRoute(id, sid) {
    loadJSON(function (response) {
        currentContext: String;
        currId: Number;
        var actual_JSON = JSON.parse(response);
        if (sid != 0) {
            this.currId = Number(sid);
            actual_JSON = actual_JSON.filter(mainObj => {
                return mainObj.id == id;
            })[0].sub;
        } else {
            this.currId = Number(id);
        }
        var active = actual_JSON.filter(data => {
            return data.id == (this.currId != '' ? Number(this.currId) : 1);
        });
        if (active["0"] == undefined) {
            this.currentContext = actual_JSON.filter(data => {
                return data.id == 0;
            })["0"];
        } else {
            this.currentContext = active["0"];
        }
        let mainId = ((sid == 0) ? this.currentContext.id : id);
        let subId = ((sid != 0) ? this.currentContext.id : sid);
        getNextTopic(this.currentContext.id, actual_JSON);
        updateURL(mainId, subId);
        callAjax(this.currentContext);
    });
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

function callAjax(screen) {
    doAjax(screen);
}


function doAjax(screen) {
    var baseURL = `https://kanishkagit.github.io/selfPreparation/WebPages/${screen.screenName}`;
    //var baseURL = `http://127.0.0.1:5500/WebPages/${screen.screenName}`;
    fetch(baseURL).then(response => {
        response.text().then(data => {
            document.querySelector("#result").innerHTML = data;
            operateOnPage(screen);
        }).catch(err => {
            console.log("Error is ", err);
        })
    }).catch(err => {
        console.log("Fail is ", err);
    });
}

function operateOnPage(screen){
    getContent();
    getTagsforPage();
    designPageText();
    getSubList(screen);
    $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
    });
}

function updateURL(id, sid) {
    if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?id=' + String(id) + '&subid=' + String((sid == 0) ? 0 : sid);
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
                contentList += `<a class="dropdown-item" onclick="getRoute(${element.id},0)" href='#'>`;
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
    if (document.querySelectorAll('.heading-name') != null) {
        document.querySelectorAll('.heading-name').forEach(node => {
            node.setAttribute('id', nodeId + 1);
            tagsHtml += `<a class='btn btn-sm btn-primary mr-1' href='#${nodeId}'>${node.innerHTML}</a>`;
            document.querySelector('#tag-section').innerHTML = tagsHtml
            nodeId++;
        });
    }
}

//text highlighting styles
function designPageText() {
    let custTxtClass = [
        {
            "name": "success",
            "class": "alert alert-success p-0"
        },
        {
            "name": "warning",
            "class": "alert alert-warning p-0"
        },
        {
            "name": "danger",
            "class": "alert alert-danger p-0"
        },
        {
            "name": "info",
            "class": "alert alert-info p-0"
        },
        {
            "name": "h-text",
            "class": "h-text"
        }
    ];
    custTxtClass.forEach(classObj => {
        if (document.querySelectorAll(classObj.name) != null) {
            document.querySelectorAll(classObj.name).forEach(node => {
                node.setAttribute('class', classObj.class);
            });
        }
    })
}

function getSubList(subObj) {
    if (subObj.sub != 'NA') {
        let nodeId = 0;
        let tagsHtml = '';
        if (subObj.sub != undefined) {
            subObj.sub.forEach(node => {
                if (node.id > 0) {
                    tagsHtml += `<button class='btn btn-lg btn-primary mr-1' onclick="getRoute(${subObj.id},${node.id})">${node.name}</button>`;
                    document.querySelector('#tag-section').innerHTML = tagsHtml
                }
            });
        }
    }
}