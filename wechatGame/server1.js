//创建socket服务器
let roomList={}
let gameMode=0;
let WebSocket=require("ws");
let Ws = WebSocket.Server;
let wss = new Ws({
    port: 8282
});
wss.on("connection", function(ws) {
    console.log("Server has a new connection")
    //接收客户端接收的json数据
    ws.on("message", res => {
        //转成对象
        // console.log("ws.on message");
        let mess=JSON.parse(res);
        // 如果是进入游戏页面发过来的消息  进入if 如果是创建房间发过来的消息 进入else
        if(mess==="video game message"){
          console.log("game mode");
          if(gameMode===0){
            ws.send(JSON.stringify("you the first to get ready"));
            gameMode=1;
          }else{
            wss.clients.forEach(function each(client){
              if(client.readyState===WebSocket.OPEN){
                client.send("1");
              }
            })
          }
        }
        else{
          let name=JSON.parse(res).name;
        let roomId=JSON.parse(res).roomId;
        let opt=JSON.parse(res).opt;
        // 如果没有传入名字 说明已经进入房间 并开始操作
        if(roomId===null){
          // 判断传来消息的是那个玩家
          var flag1=0
          if(name===roomList[roomId].player1.name){
            roomList[roomId].player1.opt=opt;
            if(flag===0) flag=1
            else {
              // 给每个已连接用户广播 各自用户的操作
              wss.clients.forEach(function each(client){
                if(client.readyState===WebSocket.OPEN){
                  client.send(JSON.stringify({
                    roomInfo: roomList[roomId],
                    player1Opt: roomList[roomId].player1.opt,
                    player2Opt: roomList[roomId].player2.opt
                  }))
                }
              })
            }
          }else{
            roomList[roomId].player2.opt=opt;
            if(flag===0) flag=1
            else{
              // 同上
              wss.clients.forEach(function each(client){
                if(client.readyState===WebSocket.OPEN){
                  client.send(JSON.stringify({
                    player1Opt: roomList[roomId].player1.opt,
                    player2Opt: roomList[roomId].player2.opt
                  }))
                }
              })
            }
          }
        }
        // 判断是否已经存在该房间
        // 该房间不存在 给房间号创建一个新的json，设置full属性，player1姓名
        else{
          if(roomList[roomId]===undefined){
            console.log('1')
            roomList[roomId]={};
            roomList[roomId].player1={};
            roomList[roomId].player1.name=name;
            roomList[roomId].player1.opt="";
            roomList[roomId].full=false
            console.log('2')
            ws.send(JSON.stringify({
              status: "created"
          }));
            console.log('3')
          }else{
            // 如果房间full属性false
            if(roomList[roomId].full===false){
              roomList[roomId].player2={};
              roomList[roomId].player2.name=name;
              roomList[roomId].player2.opt="";
              roomList[roomId].full=true; 
              // 对所有已连接用户进行广播
              wss.clients.forEach(function each(client){
                if(client.readyState===WebSocket.OPEN){
                  client.send(JSON.stringify({
                    status:"join successed"
                  }))
                }
              })
              ws.send(JSON.stringify({
                status: "join successed"
            }));
            }else{
              ws.send(JSON.stringify({
                status: "full"
            }));
            }
          }
        }  
        }
              
    })
    ws.on("close", res => {
        console.log('Server is now closed');
        gameMode=0;
    })
    ws.on('error', function(err) {
        console.log('Error occurred:', err.message);
    });
})
