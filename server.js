const fs=require('fs');
const child_process=require('child_process');

// 子进程传递handle
const net=require('net')

let room={}
var WebSocket=require('ws');
const { secureHeapUsed, checkPrime } = require('crypto');
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
          // 为每个玩家存储其名字 方便后续创建多线程好根据序号进行查找其操作
          room[roomNo]["first"]=name
          room[roomNo][name]={}
          room[roomNo].tot=1;
          room[roomNo][name].action=undefined
          room[roomNo][name].block="player1"
          // funcCode=0 代表发送给用户其操纵的角色
          var obj={
            funcCode: "0",
            block: "player1",
            tot: 1,
            userName: name
          }
          ws.send(JSON.stringify(obj))
          //如果是第二个进入房间的人
       }else if(room[roomNo].tot===1){
        if(room[roomNo][name]===undefined){
          room[roomNo][name]={}
          room[roomNo]["second"]=name;
          room[roomNo][name].block="player2"
          room[roomNo][name].action=undefined
          room[roomNo].tot=2;
          // 已经发送操作的用户数量
          room[roomNo].actionReady=0;
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
      // 操作序列发送
      else if(funcCode==="opt"){
        let action=mess.action;
        let roomNo=mess.roomNo;
        let userName=mess.userName
        let block=mess.block
        var obj={
            action: action,
            funcCode: "actionChecking",
            roomNo: roomNo,
            userName: userName
          }
        ws.send(JSON.stringify(obj));
        // 多线程
        // room[roomNo].actionReady=1
        if(room[roomNo].actionReady===0){
          room[roomNo].actionReady=1;
          room[roomNo][userName].action=action
          // 为玩家创建线程
          var worker_process=child_process.fork("support.js");
          worker_process.on('close',function(code){
            console.log('子进程退出,退出码为 '+code);
          });
          // 这里可以把server传过去，但是在support.js中解析中不能server.on('connection')，目前不知道解决办法  2023/5/30
          const server=net.createServer();
          var obj={
            name: userName,
            roomNo, roomNo,
            block: block,
            action: action,
          }
          worker_process.on('message',function(data){
            wss.clients.forEach(function each(client){
              // console.log(client)
              if(client.readyState===WebSocket.OPEN){
                client.send(data);
              }
            })
          })
          // 休眠 直到第二个玩家发送其操作才被唤醒 两者一起发送
          worker_process.send(JSON.stringify(obj))
          
          // 第二个玩家创建的操作
        }else if(room[roomNo].actionReady===1){
          room[roomNo].actionReady=2;
          room[roomNo][userName].action=action
          console.log(room)
          // multithread
            var worker_process=child_process.fork("support.js");
            worker_process.on('close',function(code){
              console.log('子进程退出,退出码为 '+code);
            });
            // 这里可以把server传过去，但是在support.js中解析中不能server.on('connection')，目前不知道解决办法  2023/5/30
            const server=net.createServer();
            worker_process.on('message',function(data){
              wss.clients.forEach(function each(client){
                // console.log(client)
                if(client.readyState===WebSocket.OPEN){
                  client.send(data);
                }
              })
            })
            var obj={
            name: userName,
              roomNo, roomNo,
              block: block,
              action: action,
            }
            // 唤醒另一个休眠的线程 一起发送
            worker_process.send(JSON.stringify(obj))
        }
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
async function transmit(worker_process,obj){

}
function wait(ms) {
  return new Promise(resolve =>setTimeout(() =>resolve(), ms));
};