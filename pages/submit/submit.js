// pages/detail/detail.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    name: '', //作业名称
    num: '作业未选择', //总人数
    flagNum: '作业未选择', //目标人数(未交人数)
    startBtnDisable: true,
    myClass: '',
    course: '',
    hiddenList: true,
    wjData: {},
    taskText: null,
    taskList: [], //作业列表
    taskObjectList: null, //作业对象
    task_select: null,
    index: []
  },
  taskPickerChange: function(e) {
    var index = e.detail.value
    var taskObjectList = this.data.taskObjectList
    this.data.task_select = taskObjectList[index]
    console.log(this.data.task_select)
    this.data.index = [index]
    var wjData = taskObjectList[index].classInfo.stuList
    this.setData({
      startBtnDisable: false,
      taskText: '当前作业: ' + taskObjectList[index].name,
      flagNum: wjData.length,
      wjData: wjData
    })

  },
  showHander: function(e) {
    var select = this.data.task_select
    if (select == null) {
      wx.showToast({
        title: '请先选择作业',
        icon: 'none'
      })
      return
    }
    this.setData({
      hiddenList: !this.data.hiddenList
    })
  },
  /**
   * 提交作业 (已报废，暂保留)
   */
  submit: function() {
    wx.showLoading({
      title: '保存中'
    })
    const _this = this
    var name = this.data.name

    var stuList = app.getMyClass(app.globalData.loginInfo.myClass).stuList
    //console.log(app.getMyClass(app.globalData.loginInfo.myClass))
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
    var select = this.data.task_select //选择的作业
    if (select == null) {
      wx.showToast({
        title: '请先选择作业',
        icon: 'none',
        duration: 2000
      })
      return
    }
    console.log(select)
    wx.scanCode({
      success: (res) => {
        var stuNum = res.result
        var loginInfo = wx.getStorageSync('loginInfo')
        //本班存在该学号的学生
        if (app.taskUtils.confirmStu(loginInfo.myClass, stuNum)) {
          wx.showLoading({
            title: '操作中'
          })
          //每次提交作业就从学生列表删除该学生
          var stuList = select.classInfo.stuList
          var result = app.taskUtils.removeStu(stuList, stuNum)

          //将修改后的数据回写到本地
          select.classInfo.stuList = result
          app.taskUtils.updateTask(select)

          //刷新页面数据
          this.onShow()

          var index = this.data.index
          var taskObjectList = this.data.taskObjectList
          var wjData = taskObjectList[index].classInfo.stuList
          this.setData({
            flagNum: wjData.length,
            wjData: wjData
          })

          wx.hideLoading()
          wx.showToast({
            title: '完成',
            duration: 2000
          })

        } else {
          wx.showToast({
            title: '该班级没有该学生',
            icon: 'none',
            duration: 2000
          })
        }

      },
      fail: (res) => {
        wx.showToast({
          title: '操作取消',
          icon: 'none',
          duration: 2000
        })
      }
    })

  },
  //保存到服务器
  saveHander: function(e) {
    const self = this
    var select = this.data.task_select
    if (select == null) {
      wx.showToast({
        title: '请先选择作业',
        icon: 'none'
      })
      return
    }
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
          var userModel = wx.getStorageSync('userModel')
          app.myRequest2('saveTask', {
            id: select.id,
            name: select.name,
            term: select.term,
            course: select.course,
            myClass: select.classInfo.myClass,
            time: select.time,
            num: self.data.num,
            flagNum: self.data.flagNum,
            flagStrs: flagStrs,
            userId: userModel.id
          }, null, function(result) {
            if (result.statusCode == 200) {
              if (result) {
                //保存成功后更新下本地记录
                select.state = '已保存'

                app.taskUtils.updateTask(select)

                wx.switchTab({
                  url: '../index/index'
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
    //准备数据
    const _this = this
    var loginInfo = wx.getStorageSync('loginInfo')
    var task = app.taskUtils.findByClassAndCourseAndStateAndUserId(loginInfo.myClass, loginInfo.course)
    //console.log(task)
    if (task == null) {
      return
    }
    var taskList = []
    for (var i in task) {
      var text = task[i].name + '--' + task[i].time
      taskList.push(text)
    }
    var list = app.getMyClass(wx.getStorageSync('loginInfo').myClass).stuList
    this.setData({
      myClass: loginInfo.myClass,
      course: loginInfo.course,
      taskList: taskList,
      taskObjectList: task,
      num: list.length
      //num: stuList.length
      // flagNum: stuList.length
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