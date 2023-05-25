let userList=[]
let leftOffset=5;
// 用户名
let ipt1;
// 房间号
let ipt2;
// 操纵的角色
let block
// 建立的websocket全局变量
var ws;
let b1MarginLeft;
let b2MarginLeft;
function btn1Socket(){
    var obj={
        funcCode: "right",
        userName: ipt1,
        roomNo: ipt2,
        block: block
    }
    ws.send(JSON.stringify(obj))
}
function btn2Socket(){
    var obj={
        funcCode: "left",
        userName: ipt1,
        roomNo: ipt2,
        block: block
    }
    ws.send(JSON.stringify(obj))
}
function exit(){
    // funcCode 离开
    let data={
        funcCode: "0",
        name: ipt1,
        roomNo: ipt2
    }
    ws.send(JSON.stringify(data))
}
function enter(){
    ipt1=document.getElementById("ipt1").value;
    ipt2=document.getElementById("ipt2").value;
    
    // console.log(ipt1)
    ws = new WebSocket("ws://localhost:3000");
    ws.onopen=function(){
        let data={
            funcCode: "1",
            name:ipt1,
            roomNo:ipt2
        }
        ws.send(JSON.stringify(data))
    }
    ws.onmessage=function(rec){
        console.log(rec.data)
        console.log(JSON.parse(rec.data).funcCode)
        let recData=JSON.parse(rec.data)
        let funcCode=recData.funcCode
        console.log(funcCode==="left")
        // console(funcCode==="0")
        if(funcCode==="0"){
            // 分配操纵的角色
            block=recData.block
            let tot=recData.tot
            console.log("已分配角色:"+block)
            let btn1=document.getElementById("btn3")
            let ipt1V=document.getElementById("ipt1")
            let ipt2V=document.getElementById("ipt2")
            let notice1=document.getElementById("notice1")
            ipt1V.style.display="none"
            ipt2V.style.display="none"
            btn1.style.display="none"
            if(tot===1) notice1.innerHTML="玩家"+ipt1+"已经进入房间"+ipt2
            // 第二名玩家加入房间
            else if(tot===2) {
                // funcCode=2 发送提示进入消息
                var obj={
                    funcCode: "2",
                    roomNo: ipt2,
                    message: "玩家"+ipt1+"已经进入房间"+ipt2
                }

                ws.send(JSON.stringify(obj))
            }
        }else if(funcCode==="404"){
            alert("用户名重复")
        }else if(funcCode==="405"){
            alert("房间已经满了")
        }else if(funcCode==="right"){
            let block1=recData.block
            let roomNo=recData.roomNo
            // 如果传来的信号是同一个房间的玩家发出的
            if(roomNo===ipt2){
                move(block1)
            }
            // 判断传来的请求是控制哪一个div块的
        }else if(funcCode==="left"){
            let block1=recData.block
            let roomNo=recData.roomNo
            if(roomNo===ipt2){
                move1(block1)
            }
        }else if(funcCode==="message"){
            let mess1=recData.message
            let notice2=document.getElementById("notice2")
            let roomNo=recData.roomNo
            if(roomNo===ipt2){
                var car = document.getElementById("player1");
                var car1 = document.getElementById("player2");
                car.style.marginLeft=10+"px"
                car1.style.marginLeft=10+"px"
                 notice2.innerHTML=mess1
                }
        }
    }
}
// 让paramBlock右移动
function move(paramBlock){
    var car = document.getElementById(paramBlock);
    let dis=car.style.marginLeft
    console.log(dis);
    if(paramBlock==="player1"){
        if(b1MarginLeft===undefined){
            b1MarginLeft=10;
            car.style.marginLeft=b1MarginLeft+"px";
        }else{
            b1MarginLeft+=10;
            car.style.marginLeft=b1MarginLeft+"px";
        }
    }
    else if(paramBlock==="player2"){
        if(b2MarginLeft===undefined){
            b2MarginLeft=10;
            car.style.marginLeft=b2MarginLeft+"px";
        }else{
            b2MarginLeft+=10;
            car.style.marginLeft=b2MarginLeft+"px";
        }
    }
};
// 让paramBlock左移动
function move1(paramBlock){
    var car = document.getElementById(paramBlock);
    let dis=car.style.marginLeft
    if(paramBlock==="player1"){
        if(b1MarginLeft===undefined){
            b1MarginLeft=10;
            car.style.marginLeft=b1MarginLeft+"px";
        }else{
            b1MarginLeft-=10;
            car.style.marginLeft=b1MarginLeft+"px";
        }
    }
    else if(paramBlock==="player2"){
        if(b2MarginLeft===undefined){
            b2MarginLeft=10;
            car.style.marginLeft=b2MarginLeft+"px";
        }else{
            b2MarginLeft-=10;
            car.style.marginLeft=b2MarginLeft+"px";
        }
    }
}
