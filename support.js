const net=require('net');
var obj;
// 这里socket.emit无法使用， 2023/5/30
process.on('message',function(m,server){
    if (m === 'server') {
        server.on('connection', (socket) => {
          socket.end('handled by child');
        });
      }
})

setTimeout(function(){
    process.exit(1);
},1000000)
