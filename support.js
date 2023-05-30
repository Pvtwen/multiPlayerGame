const net=require('net');
var obj;
// 这里socket.emit无法使用， 2023/5/30
process.on('message',function(m){
    let data=JSON.parse(m);
    let userName=data.name
    let roomNo=data.roomNo
    let block=data.block
    let action=data.action
    for(let i=0;i<action.length;i++){
      let obj;
      if(action[i]==='1'){
        obj={
          funcCode: "left",
          userName: userName,
          roomNo: roomNo,
          block: block
        }
        process.send(JSON.stringify(obj))
      }else if(action[i]==='2'){
        obj={
          funcCode: "right",
          userName: userName,
          roomNo: roomNo,
          block: block
        }
        process.send(JSON.stringify(obj))
      }
    }
})

setTimeout(function(){
    process.exit(1);
},1000000)
