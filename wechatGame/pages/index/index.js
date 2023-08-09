// index.js
// 获取应用实例

var app=getApp();
var ws;
var Gname;
Page({
  data:{
    inputName: '',
    inputRoomId: ''
  },
  onLoad(params){
   
  },
  butt: function(){
    console.log('函数执行')
    wx.redirectTo({
      url: '/pages/game/game',
    })
  },
  inputName:function(e){
    this.setData({
      inputName:e.detail.value
    })
    console.log(this.data.inputName)
  },
  inputRoomId:function(e){
    this.setData({
      inputRoomId: e.detail.value
    })
    console.log(this.data.inputRoomId)
  },
  backToMain:function(){
    wx.redirectTo({
      url: '/pages/main/main',
    })
  },
  createRoom: function(){
    // 定义一个全局的websocket连接
    app.globalData.ws = wx.connectSocket({
      url: 'ws://localhost:8282',
    })
    ws=app.globalData.ws;
    let inputName=this.data.inputName;
    let inputRoomId=this.data.inputRoomId;
    ws.onOpen(function () {
      console.log("creating...");
      // 发送消息给服务器端
      ws.send({
        // 外层data不能改变变量名
        data: JSON.stringify({
          name: inputName,
          roomId: inputRoomId
        })
      })
    })
    ws.onMessage(function (res) {
      var status=JSON.parse(res.data).status
      var room=JSON.parse(res.data).roomList
      if(status===null){
        var opt1=room.player1.opt;        
        var opt2=room.player2.opt;
        // 分别解析opt1和opt2的操作 (有先后性)
      }else{
        console.log(status)
        if(status==='created') {}
        else if(status==='join successed'){
          wx.navigateTo({
            url: '/pages/game/game?name='+inputName+'&room='+inputRoomId,
          })
        }
      }
    })
    setTimeout(() => {
      ws.close()
    }, 500000);
  }
})
