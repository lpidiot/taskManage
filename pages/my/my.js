const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: {},
    current: '',
    name: '',
    options: [{
        icon: '../../images/setting_200.png',
        data: '测试',
        key: 'aaa'
      },
      {
        icon: '../../images/setting_200.png',
        data: '测试',
        key: 'bbb'
      },
      {
        icon: '../../images/setting_200.png',
        data: '测试',
        key: 'ccc'
      }
    ]
  },
  clickHander: function(e) {
    var key = e.currentTarget.dataset.key

    switch (key) {
      case 'aaa':
        console.log('aaaaa')
        break
      case 'setting':
        wx.navigateTo({
          url: '../setting/setting'
        })
        break
    }
  },
  logoutHander: function(e) {
    wx.showModal({
      title: '提示',
      content: '是否退出登录？退出不会影响本地数据',
      success: function(res) {
        if (res.confirm) {
          //删除相关记录
          wx.setStorageSync('userModel', null)

          wx.redirectTo({
            url: '../login/login?logout=true'
          })
        }
      }
    })
  },

  synchronization: function(e) {
    wx.showModal({
      title: '警告',
      content: '同步后',
      success: function(res) {
        var userModel = wx.getStorageSync('userModel')
        if (res.confirm) {
          app.myRequest2('getTask', {
            userId: userModel.id
          }, null, function(result) {
            if (result.statusCode == 200) {
              var data = result.data
              //拼装数据
              for (var i in data) {
                var classInfo = {}
                classInfo.myClass = data[i].myClass
                classInfo.stuList = data[i].stuList
                data[i].classInfo = classInfo
              }
              //console.log(data)
              //同步
              app.taskUtils.synchronization(data)

              wx.showToast({
                title: '同步成功'
              })
            } else {
              wx.showModal({
                title: '提示',
                content: '获取数据异常，请尝试重试',
                showCancel: false
              })
            }

          }, function(result) {
            wx.showModal({
              title: '提示',
              content: '连接异常',
              showCancel: false
            })
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }

    var loginInfo = wx.getStorageSync('loginInfo')

    this.setData({
      current: '当前：' + loginInfo.term + '-' + loginInfo.course + '-' + loginInfo.myClass,
      name: ''
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