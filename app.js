//app.js

App({
  onLaunch: function() {
    // wx.setStorageSync('stuInfo', null)
    this.getMyData()
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        } else {
          console.log('没有授权')
          wx.redirectTo({
            url: '../getUserinfo/getUserinfo'
          })
        }
      }
    })


  },
  globalData: {
    //url: 'http://192.168.52.84/hmw/weixin/',
    url: 'http://192.168.52.57/hmw/weixin/',
    userInfo: null, //微信基本信息(昵称，头像)
    loginInfo: null, //登录信息
    userModel: null, //后台用户对象
    terms: [],
    courses: [],
    classes: []
  },
  myRequest: function(url, data, type, success) {
    if (type == '' || type == null) {
      type = 'JSON'
    }
    wx.request({
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      url: this.globalData.url + url,
      data: data,
      type: type,
      success: success
    })
  },
  myRequest2: function(url, data, type, success, fail) {
    if (type == '' || type == null) {
      type = 'JSON'
    }
    wx.request({
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      url: this.globalData.url + url,
      data: data,
      type: type,
      success: success,
      fail: fail
    })
  },

  //获取学年等信息
  getMyData: function() {
    const _this = this
    _this.myRequest2('xnxq', {}, null, function(result) {
      var xnxq = result.data
      var terms = []
      if (result.statusCode == '200') {
        for (var obj in xnxq) {
          terms.push(xnxq[obj].xnxq)
        }
        _this.globalData.terms = terms
        //console.log(_this.globalData.terms)
        _this.myRequest2('curriculum', {}, null, function(result) {
          var curriculum = result.data
          var courses = []
          if (result.statusCode == '200') {
            for (var obj in curriculum) {
              courses.push(curriculum[obj].name)
            }

            _this.globalData.courses = courses
            _this.myRequest2('tbclassAll', {}, null, function(result) {
              var tbclass = result.data
              var classes = []
              if (result.statusCode == '200') {
                for (var obj in tbclass) {
                  classes.push(tbclass[obj].name)
                }

                _this.globalData.classes = classes

              } else {
                wx.showModal({
                  title: '连接失败',
                  content: '获取信息失败，请尝试重连',
                  showCancel: false,
                  confirmText: '重新连接',
                  success: function(res) {
                    if (res.confirm) {
                      _this.getMyData()
                    }
                  }
                })
              }
            }, function(result) {
              wx.showModal({
                title: '连接失败',
                content: '获取信息失败，请尝试重连',
                showCancel: false,
                confirmText: '重新连接',
                success: function(res) {
                  if (res.confirm) {
                    _this.getMyData()
                  }
                }
              })
            })



          } else {
            wx.showModal({
              title: '连接失败',
              content: '获取信息失败，请尝试重连',
              showCancel: false,
              confirmText: '重新连接',
              success: function(res) {
                if (res.confirm) {
                  _this.getMyData()
                }
              }
            })
          }
        }, function(result) {
          wx.showModal({
            title: '连接失败',
            content: '获取信息失败，请尝试重连',
            showCancel: false,
            confirmText: '重新连接',
            success: function(res) {
              if (res.confirm) {
                _this.getMyData()
              }
            }
          })
        })

      } else {
        wx.showModal({
          title: '连接失败',
          content: '获取信息失败，请尝试重连',
          showCancel: false,
          confirmText: '重新连接',
          success: function(res) {
            if (res.confirm) {
              _this.getMyData()
            }
          }
        })
      }
    }, function(result) {
      wx.showModal({
        title: '连接失败',
        content: '获取信息失败，请尝试重连',
        showCancel: false,
        confirmText: '重新连接',
        success: function(res) {
          if (res.confirm) {
            _this.getMyData()
          }
        }
      })
    })
  },
  /**
   * 根据班级取出本地记录
   */
  getMyClass: function(myClass) {
    var info = wx.getStorageSync('stuInfo')

    if (info != null && info != undefined && info != '') {
      for (var obj in info) {
        if (info[obj].myClass == myClass) {
          return info[obj]
        }
      }
    } else {
      return null
    }
  },
  /**
   * 获取本地记录 没有则创建
   */
  getStuInfo: function() {
    const _this = this
    var list = wx.getStorageSync('stuInfo')
    //没有，创建
    if (list == undefined || list == null || list == '') {
      console.log('开始创建stuInfo')
      _this.myRequest('studentAll', {
        tbclass: _this.globalData.loginInfo.myClass
      }, null, function(result) {
        if (result.statusCode == '200') {
          var stuInfo = []
          var obj = {
            myClass: _this.globalData.loginInfo.myClass,
            stuList: result.data
          }
          stuInfo.push(obj)
          wx.setStorageSync('stuInfo', stuInfo)
        }
      })
      //没有当前班级记录 创建
    } else {
      console.log('开始添加stuInfo')
      var stu = _this.getMyClass(_this.globalData.loginInfo.myClass)
      if (stu == null || stu == undefined || stu == '') {
        _this.myRequest('studentAll', {
          tbclass: _this.globalData.loginInfo.myClass
        }, null, function(result) {
          if (result.statusCode == '200') {
            var obj = {
              myClass: _this.globalData.loginInfo.myClass,
              stuList: result.data
            }
            list.push(obj)
            wx.setStorageSync('stuInfo', list)
          }
        })
      }
    }
  },
  updateStuInfo: function(myClass, obj) {
    var stuInfo = wx.getStorageSync('stuInfo')
    if (stuInfo == null) {
      return
    }
    for (var i in stuInfo) {
      if (stuInfo[i].myClass == myClass) {
        var flag = {
          myClass: myClass,
          stuList: obj
        }
        stuInfo.splice(i, 1, flag)
        wx.setStorageSync('stuInfo', stuInfo)
        return
      }
    }
  },
  deleteStuInfo: function(myClass) {
    var stuInfo = wx.getStorageSync('stuInfo')
    if (stuInfo == null) {
      return
    }
    for (var i in stuInfo) {
      if (stuInfo[i].myClass == myClass) {
        stuInfo.splice(i, 1)
        wx.setStorageSync('stuInfo', stuInfo)
        return
      }
    }
  },
  /**
   * 取出学期，课程，班级对应的序号==
   */
  getSerial: function(term, course, myClass) {
    const _this = this
    var flag = []
    var terms = _this.globalData.terms
    var courses = _this.globalData.courses
    var classes = _this.globalData.classes
    for (var i in terms) {
      if (terms[i] == term) {
        flag.push(i)
      }
    }
    for (var i in courses) {
      if (courses[i] == course) {
        flag.push(i)
      }
    }
    for (var i in classes) {
      if (classes[i] == myClass) {
        flag.push(i)
      }
    }
    return flag
  }
})