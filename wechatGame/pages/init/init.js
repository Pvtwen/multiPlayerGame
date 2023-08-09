// pages/init/init.js
var ws;
var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    initial: '123'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(JSON.parse(options.name));
    console.log(app.globalData.ws)
  },
  socketButtonClick1: function () {
    wx.sendSocketMessage({
      data: JSON.stringify({
        data: "clientData2"
      }),
    })
  },

  socketButtonClick: function () {
    let initial=this.data.initial;
    ws = wx.connectSocket({
      url: 'ws://localhost:8282',
    })
    ws.onMessage(function (res) {
      console.log("onMessage", res)
    })
    ws.onOpen(function () {
      // 发送消息给服务器端
      ws.send({
        data: JSON.stringify({
          data: initial,
        })
      })
    })
    setTimeout(() => {
      ws.close()
    }, 50000);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})