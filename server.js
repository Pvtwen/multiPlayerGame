let room={}
var WebSocket=require('ws')
var WebSocketServer = require('ws').Server,
wss = new WebSocketServer({ port: 3000 });
wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('message', function (message) {
        // console.log(JSON.parse(message).funcCode)
        let mess=JSON.parse(message)
        let funcCode=mess.funcCode
        if(funcCode==="1"){
          let roomNo=mess.roomNo
          let name=mess.name
          // 如果第一个用户进入  新建房间
        // room.roomNo定义roomNo属性 room: {roomNo:{}}
        // room[roomNo]定义  room: {'1': {}}
        if(room[roomNo]===undefined){
          room[roomNo]={}
          room[roomNo][name]={}
          room[roomNo].tot=1;
          room[roomNo][name].block="player1"
          // funcCode=0 代表发送给用户其操纵的角色
          var obj={
            funcCode: "0",
            block: "player1",
            tot: 1,
            userName: name
          }
          ws.send(JSON.stringify(obj))
       }else if(room[roomNo].tot===1){
        if(room[roomNo][name]===undefined){
          room[roomNo][name]={}
          room[roomNo][name].block="player2"
          room[roomNo].tot=2;
          var obj={
            funcCode: "0",
            block: "player2",
            tot: 2,
            userName: name
          }
          ws.send(JSON.stringify(obj))
          
        }
        // 不能存在相同用户名的玩家 向客户端发送404状态码
        else{
          var obj={
            funcCode: "404"
          }
          ws.send(JSON.stringify(obj))
        }
       }else if(room[roomNo].tot===2){
        // 房间已经满了
        var obj={
          funcCode: "405"
        }
        ws.send(JSON.stringify(obj))
       }
        console.log(room);
      }
      //如果状态码为0 用户离开
      else if(funcCode==="0"){
        let roomNo=mess.roomNo
        let name=mess.name
        if(roomNo===undefined) console.log("undefined roomoNo")
        room[roomNo][name]=undefined
        room[roomNo].tot--;
        if(room[roomNo].tot===0) room[roomNo]=undefined
      }
      // 如果状态码为right,用户发送一个右移请求
      else if(funcCode==="right"){
        let userName=mess.userName
        let block=mess.block
        let roomNo=mess.roomNo
        var obj={
          funcCode: "right",
          userName: userName,
          roomNo: roomNo,
          block: block
        }
        let i=1;
        wss.clients.forEach(function each(client){
            // console.log(client)
            console.log("向玩家"+i+"发送右移指令")
            i++;
            if(client.readyState===WebSocket.OPEN){
              client.send(JSON.stringify(obj));
            }
          })
      }
      else if(funcCode==="left"){
        let userName=mess.userName
        let block=mess.block
        let roomNo=mess.roomNo
        var obj={
          funcCode: "left",
          userName: userName,
          roomNo: roomNo,
          block: block
        }
        wss.clients.forEach(function each(client){
            // console.log(client)
            if(client.readyState===WebSocket.OPEN){
              client.send(JSON.stringify(obj));
            }
          })
      }
      // 发送玩家进入房间的消息
      else if(funcCode==="2"){
        let message=mess.message
        let roomNo=mess.roomNo
        var obj={
          funcCode:"message",
          roomNo: roomNo,
          message: message
        }
        wss.clients.forEach(function each(client){
          // console.log(client)
          if(client.readyState===WebSocket.OPEN){
            client.send(JSON.stringify(obj));
          }
        })
      }
    });
    // 如何检测异常断开
    ws.on("close", res => {
      console.log(res)
      console.log('Server is now closed');
  })
  ws.on('error', function(err) {
      console.log('Error occurred:', err.message);
  });
});