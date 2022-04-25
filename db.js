const fs = require('fs');

let data = JSON.parse(fs.readFileSync('./db.json').toString("utf-8"))
function saveData(){fs.writeFileSync('./db.json', JSON.stringify(data, null, 4))}
function clearData(){data = {}; saveData()}
function logJson(json){console.log(JSON.stringify(json,null,4).replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,m=>"\x1b["+(/^"/.test(m)?/:$/.test(m)?"34":"32":/true|false/.test(m)?"35":/null/.test(m)?"31":"36")+"m"+m+"\x1b[0m"))}

module.exports = {
    data: data,
    saveData: saveData,
    clearData: clearData,
    logJson: logJson,
}