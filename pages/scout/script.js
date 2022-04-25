let steps, step, states, data = [], teamNum = -1;
const div = document.getElementById("content");

function beginSession(){
    console.log("Called beginSession");
    steps = DATA.map(i=>i);
    data = [];
    waitForTeamNum();
}

function waitForTeamNum(){
    nextStep();
}

function nextStep(){
    console.log("Called nextStep");
    if(!steps.length){
        endSession();
        return;
    }
    step = steps.shift();
    states = [];
    //Clear div 
    while(div.children.length) div.removeChild(div.firstChild);
    //Load step elements into div
    div.style.setProperty("--N", step.length);
    div.setAttribute("data-N", step.length);
    for(let part of step){
        let r = {result: null};
        states.push(r);
        div.appendChild(makeEl(part, r));
    }
    div.appendChild(makeFinishButton());
}

function endSession(){
    while(div.children.length) div.removeChild(div.firstChild);
    console.log("Called endsession");
    console.log({team:teamNum,data:data});

    fetch('/scout/action', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({team:teamNum, data:data})
    }).then(_=>{
        console.log('Successfully uploaded data');
    })

    beginSession();
}

function makeEl(part, res){
    let wrap = document.createElement("div");
    wrap.className = "wrapper " + part.type.toLowerCase();
    let title = document.createElement("span");
    title.className = "display-name";
    title.innerText = part["display-name"];
    wrap.appendChild(title);
    let ctnt = document.createElement("div");
    switch(part.type){
        case "BOOLEAN":
            // let bool = document.createElement("button");
            // ctnt.appendChild(bool);
            // break;
        case "COUNT":
            let cnt = 0;
            let mBtn = document.createElement("button"); mBtn.innerText = "<";
            let disp = document.createElement("input");
            let pBtn = document.createElement("button"); pBtn.innerText = ">";
            disp.value = res.result = 0;
            disp.className = "number-input-simple";
            disp.setAttribute("type", "number");
            mBtn.onmousedown = _=>{res.result = disp.value = Math.max(+disp.value - 1, 0)}
            pBtn.onmousedown = _=>{res.result = disp.value = Math.min(+disp.value + 1, 99)}
            disp.onchange = disp.oninput = disp.onkeypress = _=>{
                if(disp.value.length) res.result = disp.value = Math.max(Math.min(+disp.value, 99), 0);
            }
            ctnt.appendChild(mBtn);
            ctnt.appendChild(disp);
            ctnt.appendChild(pBtn);
            break;
        case "TEXT":
            let inp = document.createElement("span");
            inp.setAttribute("contenteditable", "true");
            res.result = "";
            inp.onkeypress = _=>{res.result = inp.innerText}
            ctnt.appendChild(inp);
            break;
        case "SELECT":
            let sel = document.createElement("select");
            for(let option in part.options){
                let opt = document.createElement("option");
                opt.innerText = option;
                opt.value = part.options[option];
                sel.appendChild(opt);
            }
            res.result = sel.value;
            sel.onchange = _=>{
                res.result = sel.value;
            }
            ctnt.appendChild(sel);
            break;
        default:
            throw new Error("UNKNOWN STEP TYPE");
    }
    wrap.appendChild(ctnt);
    return wrap;
}

function makeFinishButton(){
    let wrap = document.createElement("div");
    wrap.className = "finish-btn-wrapper";

    let btn = document.createElement("button");
    btn.className = "finish-btn";
    btn.innerText = "Next step";
    btn.onclick = _=>{
        data.push(states.map(i=>i.result));
        nextStep();
    }
    wrap.appendChild(btn);

    // let f = setInterval(_=>{
    //     if(states.map(i=>i.finished).reduce((a,b)=>a&&b)){
    //         data.push(states.map(i=>i.result));
    //         clearInterval(f);
    //         nextStep();
    //     }
    // },1);
    return wrap;
}


beginSession();