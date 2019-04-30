// pages/detail/detail.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    name: '', //作业名称
    num: 0, //总人数
    flagNum: 0, //目标人数(未交人数)
    myClass: '',
    hiddenList: true,
    wjData: {}
  },
  showHander: function(e) {
    this.setData({
      hiddenList: !this.data.hiddenList
    })
  },
  nameChangeHander: function(e) {
    //console.log(e.detail.value)
    this.setData({
      name: e.detail.value
    })
  },
  submit: function() {
    wx.showLoading({
      title: '保存中'
    })
    const _this = this
    var name = this.data.name

    var stuList = app.getMyClass(app.globalData.loginInfo.myClass).stuList
    if (stuList == null || stuList == undefined) {
      //本地没有记录
      return
    }
    var flagNum = stuList.length
    if (stuList.length == 0) {
      //没有未交的名单
      return
    } else {
      for (var i in stuList) {
        app.myRequest2('zuoyejc', {
          curriculum: app.globalData.loginInfo.course,
          xnxq: app.globalData.loginInfo.term,
          studentNum: stuList[i].studentNum,
          name: name
        }, null, function(result) {
          if (result.statusCode == '200') {}
        }, function(result) {
          wx.showModal({
            title: '连接失败',
            content: '同步失败，请尝试重连',
            confirmText: '重新连接',
            success: function(res) {
              if (res.confirm) {
                _this.submit()
              }
            }
          })
        })
      }

      //全部提交完成时保存一个日志
      app.deleteStuInfo(app.globalData.loginInfo.myClass)
      app.myRequest2('zuoyeSave', {
        zuoyemc: name,
        wjrs: flagNum,
        tbclass: app.globalData.loginInfo.myClass
      }, null, function(result) {
        wx.switchTab({
          url: '../index/index'
        })
        wx.showToast({
          title: '操作成功',
          icon: 'none',
          duration: 2000
        })

      }, function(result) {

      })

    }
    wx.hideLoading()

  },
  startHander: function(e) {
    const _this = this
    var name = this.data.name
    if (name == null || name == '') {
      wx.showToast({
        title: '请先输入此次作业名称',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '操作提示',
      content: '确认提交？',
      success: function(res) {
        if (res.confirm) {
          _this.submit()
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    const _this = this
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
    this.setData({
      myClass: app.globalData.loginInfo.myClass
    })
    const _this = this
    //准备数据
    app.myRequest('studentAll', {
      tbclass: app.globalData.loginInfo.myClass
    }, null, function(result) {
      if (result.statusCode == '200') {

        if (result.data.length == 0) {
          wx.showModal({
            title: '提示',
            content: '云端没有学生数据，请先联系添加',
            showCancel: false
          })
        } else {
          //console.log(app.globalData.loginInfo.myClass)
          var stuList = app.getMyClass(app.globalData.loginInfo.myClass).stuList

          //console.log(stuList)
          _this.setData({
            num: result.data.length,
            flagNum: stuList.length
          })
        }
      } else {
        wx.showModal({
          title: '提示',
          content: '连接错误',
          showCancel: false,
          confirmText: '重试',
          success: function(res) {
            if (res.confirm) {
              _this.onShow()
            }
          }
        })
      }
    })

    //填入未交名单
    var list = app.getMyClass(app.globalData.loginInfo.myClass).stuList

    this.setData({
      wjData: list
    })


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