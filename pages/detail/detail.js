// pages/detail/detail.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskId: 0,
    hiddenList: true,
    zyData: {},
    wjData: {},
    num: 0,
    viewText: '保存到云端',
    viewDisable: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var id = options.id
    this.data.taskId = id
    var task = app.taskUtils.findById(id)
    var list = app.getMyClass(wx.getStorageSync('loginInfo').myClass).stuList
    this.setData({
      zyData: task,
      wjData: task.classInfo.stuList,
      num: list.length
    })
    if (task.state == '已保存') {
      this.setData({
        viewText: '已保存',
        viewDisable: true
      })
    }
  },
  showHander: function(e) {

    this.setData({
      hiddenList: !this.data.hiddenList
    })
  },
  saveHander: function(e) {
    const self = this
    var id = this.data.taskId
    var select = app.taskUtils.findById(id)
    //console.log(select)
    wx.showModal({
      title: '提示',
      content: '是否确认提交？',
      success: function(res) {
        if (res.confirm) {
          var strs = ''
          var stuList = select.classInfo.stuList
          for (var i in stuList) {
            strs += stuList[i].studentNum + ','
          }
          var flagStrs = strs.substring(0, strs.length - 1)

          app.myRequest2('saveTask', {
            id: select.id,
            name: select.name,
            term: select.term,
            course: select.course,
            myClass: select.classInfo.myClass,
            time: select.time,
            num: self.data.num,
            flagNum: self.data.zyData.classInfo.stuList.length,
            flagStrs: flagStrs
          }, null, function(result) {
            if (result.statusCode == 200) {
              if (result) {
                //保存成功后更新下本地记录
                select.state = '已保存'

                app.taskUtils.updateTask(select)

                wx.switchTab({
                  url: '../info/info'
                })
                wx.showToast({
                  title: '保存成功'
                })
              } else {
                wx.showModal({
                  title: '提示',
                  content: '操作失败,请尝试重新',
                  showCancel: false
                })
              }
            } else {
              wx.showModal({
                title: '提示',
                content: '操作失败,请尝试重新',
                showCancel: false
              })
            }
          }, function(result) {
            wx.showModal({
              title: '提示',
              content: '连接服务器失败',
              showCancel: false
            })
          })
        }
      }
    })

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