//app.js

App({
  onLaunch: function() {
    //wx.setStorageSync('stuInfo', null)
    wx.setStorageSync('task', null)
    //console.log(wx.getStorageSync('stuInfo'))
    //console.log(wx.getStorageSync('task'))
    //this.getMyData()
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
              var loginInfo = wx.getStorageSync('loginInfo')
              if (loginInfo != null && loginInfo != undefined && loginInfo != '') {
                this.getStuInfo()
                wx.switchTab({
                  url: '../index/index'
                })
              } else {
                this.getMyData()
                wx.redirectTo({
                  url: '../login/login'
                })
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
    url: 'http://172.16.162.170/hmw/weixin/',
    userInfo: null, //微信基本信息(昵称，头像)
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
        wx.setStorageSync('terms', terms)
        //console.log(_this.globalData.terms)
        _this.myRequest2('curriculum', {}, null, function(result) {
          var curriculum = result.data
          var courses = []
          if (result.statusCode == '200') {
            for (var obj in curriculum) {
              courses.push(curriculum[obj].name)
            }

            _this.globalData.courses = courses
            wx.setStorageSync('courses', courses)
            _this.myRequest2('tbclassAll', {}, null, function(result) {
              var tbclass = result.data
              var classes = []
              if (result.statusCode == '200') {
                for (var obj in tbclass) {
                  classes.push(tbclass[obj].name)
                }

                _this.globalData.classes = classes
                wx.setStorageSync('classes', classes)

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
    var myClass = wx.getStorageSync('loginInfo').myClass
    //没有，创建
    if (list == undefined || list == null || list == '') {
      console.log('开始创建stuInfo')
      _this.myRequest('studentAll', {
        tbclass: myClass
      }, null, function(result) {
        if (result.statusCode == '200') {
          var stuInfo = []
          var obj = {
            myClass: myClass,
            stuList: result.data
          }
          stuInfo.push(obj)
          wx.setStorageSync('stuInfo', stuInfo)
        }
      })
      //没有当前班级记录 创建
    } else {
      var stu = _this.getMyClass(myClass)
      if (stu == null || stu == undefined || stu == '') {
        console.log('开始添加stuInfo')

        _this.myRequest('studentAll', {
          tbclass: myClass
        }, null, function(result) {
          if (result.statusCode == '200') {
            var obj = {
              myClass: myClass,
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
  },
  /**
   * 获取当前时间
   */
  getCurrentDate: function() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    if (month < 10) {
      month = "0" + month;
    }
    if (day < 10) {
      day = "0" + day;
    }
    var nowDate = year + "-" + month + "-" + day;
    return nowDate
  },

  /**
   * 作业工具
   */
  taskUtils: {
    /**
     * 创建一个uuid
     */
    creatorUUID: function() {
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";

      var uuid = s.join("");
      return uuid;
    },
    /**
     * 初始化数据
     */
    init: function() {
      var task = wx.getStorageSync('task')
      if (task == null || task == undefined || task == '') {
        wx.showModal({
          title: '提示',
          content: '还没有作业，请先添加',
          showCancel: false
        })
        return null
      }
      return task
    },
    /**
     * 根据id查找task作业
     */
    findById: function(id) {
      var task = this.init()

      for (var i in task) {
        if (task[i].id == id) {
          return task[i]
        }
      }
      return null
    },
    /**
     * 根据userId查找task作业(查找该老师所有作业记录)
     */
    findByUserid: function(userId) {
      var task = this.init()
      var flag = []
      for (var i in task) {
        if (task[i].userId == userId) {
          flag.push(task[i])
        }
      }
      return flag
    },
    /**
     * 根据课程查找task作业
     */
    findByCourse: function(course) {
      var task = this.init()
      for (var i in task) {
        if (task[i].course == course) {
          return task[i]
        }
      }
      return null
    },
    /**
     * 根据班级和课程查找task作业
     */
    findByClassAndCourse: function(myClass, course) {
      var task = this.init()
      var result = []
      for (var i in task) {
        if ((task[i].course == course) && (task[i].classInfo.myClass == myClass)) {
          result.push(task[i])
        }
      }
      return result
    },
    /**
     * 根据班级和课程查找task作业(待保存的)
     */
    findByClassAndCourseAndState: function(myClass, course) {
      var task = this.init()
      var result = []
      for (var i in task) {
        if ((task[i].course == course) && (task[i].classInfo.myClass == myClass) && (task[i].state == '待保存')) {
          result.push(task[i])
        }
      }
      return result
    },
    /**
     * 根据班级和课程查找某老师task作业(待保存的)
     */
    findByClassAndCourseAndStateAndUserId: function(myClass, course) {
      var task = this.init()
      var userModel = wx.getStorageSync('userModel')
      var result = []
      for (var i in task) {
        if ((task[i].course == course) && (task[i].classInfo.myClass == myClass) && (task[i].state == '待保存') && (task[i].userId == userModel.id)) {
          result.push(task[i])
        }
      }
      return result
    },



    /**
     * 根据班级查找task作业
     */
    findByClass: function(myClass) {
      var task = this.init()
      var result = []
      for (var i in task) {
        if (task[i].classInfo.myClass == myClass) {
          result.push(task[i])
        }
      }
      return result
    },
    /**
     * 根据作业查找task作业
     */
    findByTask: function(task) {
      var task = this.init()
      for (var i in task) {
        if (task[i] == task) {
          return task[i]
        }
      }
      return null
    },
    /**
     * 删除列表内的指定学号学生
     * stuList 学生列表
     * stuNum 要删除的学号
     */
    removeStu: function(stuList, stuNum) {
      for (var i in stuList) {
        if (stuList[i].studentNum == stuNum) {
          stuList.splice(i, 1)
          return stuList
        }
      }
      return null
    },
    /**
     * 删除列表内的指定学号学生
     * stuList 学生列表
     * stuNum 要删除的学号
     */
    removeStu: function(stuList, stuNum) {
      for (var i in stuList) {
        if (stuList[i].studentNum == stuNum) {
          stuList.splice(i, 1)
          return stuList
        }
      }
      return stuList
    },
    /**
     * 确认某班级中是否存在某学生
     * myClass 班级
     * stuNum 学号
     * return boolean true存在
     */
    confirmStu: function(myClass, stuNum) {
      var stuList = getApp().getMyClass(myClass).stuList
      //console.log(stuInfo)
      for (var i in stuList) {
        if (stuList[i].studentNum == stuNum) {
          return true
        }
      }
      return false
    },
    /**
     * 修改task作业信息
     */
    updateTask: function(data) {
      var task = this.init()
      for (var i in task) {
        if (task[i].id == data.id) {
          task.splice(i, 1, data)
          wx, wx.setStorageSync('task', task)
          return
        }
      }
      return
    },
    /**
     * 同步数据
     */
    synchronization: function(data) {
      var task = wx.getStorageSync('task')
      if (task == null || task == undefined || task == '') {
        task = []
      }

      for (var i in data) {
        if (task.length > 0) {
          for (var j in task) {
            //存在相同数据，覆盖(其实不管更好..)
            if (data[i].id == task[j].id) {
              console.log('数据重复 覆盖')
              task = task.splice(j, 1, data[i])
              //本地没有，添加
            } else {
              task.push(data[i])
            }
          }
        } else {
          task.push(data[i])
        }

      }
      wx.setStorageSync('task', task)
    }
  }
})