// pages/add/add.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: null
  },
  nameChangeHander: function(e) {
    //console.log(e.detail.value)
    this.setData({
      name: e.detail.value
    })
  },
  startHander: function(e) {
    var name = this.data.name
    if (name == null) {
      wx.showToast({
        title: '请输入作业名称'
      })
      return
    }
    var task = wx.getStorageSync('task')
    if (task == null || task == undefined) {
      task = []
    }

    var loginInfo = wx.getStorageSync('loginInfo')

    var classInfo = app.getMyClass(loginInfo.myClass)
    //console.log(classInfo)
    // if (classInfo == null || classInfo == undefined ||classInfo == '') {
    //   app.getStuInfo()
    // }
    var id = app.taskUtils.creatorUUID()
    var time = app.getCurrentDate()
    var userModel = wx.getStorageSync('userModel')
    task.push({
      id: id,
      userId: userModel.id,
      state: '待保存',
      name: name,
      term: loginInfo.term,
      course: loginInfo.course,
      time: time,
      classInfo: classInfo
    })
    wx.setStorageSync('task', task)
    wx.switchTab({
      url: '../index/index'
    })
    wx.showToast({
      title: '完成',
      duration: 2500
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})