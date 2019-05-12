// pages/login/login.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    username: '',
    password: '',
    terms: [],
    courses: [],
    term: '',
    course: '',
    classes: [],
    myClass: '',
    value: []
  },
  bindChange(e) {
    const val = e.detail.value
    this.setData({
      term: this.data.terms[val[0]],
      course: this.data.courses[val[1]],
      myClass: this.data.classes[val[2]]
    })
  },
  usernameChangeHander: function(e) {
    this.setData({
      username: e.detail.value
    })
  },
  pwdChangeHander: function(e) {
    this.setData({
      password: e.detail.value
    })
  },
  loginHander: function(e) {
    var username = this.data.username;
    var password = this.data.password
    var term = this.data.term
    var course = this.data.course
    var myClass = this.data.myClass
    if (username == '') {
      wx.showToast({
        title: '用户名为空',
        duration: 2000,
        icon: 'none'
      })
      return false
    }
    if (password == '') {
      wx.showToast({
        title: '密码为空',
        duration: 2000,
        icon: 'none'
      })
      return false
    }

    app.myRequest('weixinlogin', {
      username: username,
      password: password
    }, null, function(result) {
      if (result.statusCode == '200') {
        if (result.data != null && result.data != '') {
          var loginInfo = {
            username: username,
            password: password,
            term: term,
            course: course,
            myClass: myClass
          }
          wx.setStorageSync('loginInfo', loginInfo)
          wx.setStorageSync('userModel', result.data)
          app.getStuInfo()
          wx.switchTab({
            url: '../index/index'
          })
        } else {
          wx.showToast({
            title: '账号或密码错误',
            duration: 2000
          })
        }
      } else {
        wx.showModal({
          title: '提示',
          content: '连接服务器出错，请重试',
          confirmText: '确定',
          showCancel: false
        })
      }

    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    //取出学期等数据
    this.setData({
      terms: app.globalData.terms,
      courses: app.globalData.courses,
      classes: app.globalData.classes
    })

    if (options.logout == 'true') {

      app.getMyData()
      var terms = wx.getStorageSync('terms')
      var courses = wx.getStorageSync('courses')
      var classes = wx.getStorageSync('classes')
      this.setData({
        terms: terms,
        courses: courses,
        classes: classes
      })
    }
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


    //获取之前登录的信息
    var loginInfo = wx.getStorageSync('loginInfo')

    if (loginInfo != null && loginInfo != undefined && loginInfo != '') {
      var value = app.getSerial(loginInfo.term, loginInfo.course, loginInfo.myClass)
      this.setData({
        username: loginInfo.username,
        password: loginInfo.password,
        term: loginInfo.term,
        course: loginInfo.course,
        myClass: loginInfo.myClass,
        value: value
      })
    } else {
      this.setData({
        term: app.globalData.terms[0],
        course: app.globalData.terms[0],
        myClass: app.globalData.classes[0],
        value: [0, 0, 0]
      })
    }



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