//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    //轮播图
    images: [{
        url: '../../images/b1.jpg'
      },
      {
        url: '../../images/b2.jpg'
      }
    ],
    //工具栏
    toolBar: [{
        image: '../../images/add.png',
        text: '添加作业',
        key: 'add'
      },
      {
        image: '../../images/submit.png',
        text: '提交作业',
        key: 'submit'
      },
      {
        image: '../../images/record.png',
        text: '记录',
        key: 'record'
      }
    ]
  },
  onLoad: function() {

  },

  setZy: function(stuNum) {
    app.myRequest('zuoyejc', {
      curriculum: app.globalData.loginInfo.course,
      xnxq: app.globalData.loginInfo.term,
      studentNum: stuNum

    }, null, function(result) {

      if (result) {
        console.log(result)
        wx.showToast({
          title: '成功'
        })
      } else {
        wx.showModal({
          title: '错误',
          content: '请尝试重试',
          showCancel: false
        })
      }
    })


  },

  /**
   * 工具栏事件处理
   */
  toolBarHander: function(e) {
    const _this = this
    switch (e.currentTarget.dataset.key) {
      case 'QRcode':
        var tit = ''
        wx.scanCode({
          success: (res) => {
            var stuNum = res.result
            app.myRequest('studentNum', {
              studentNum: stuNum,
              tbclassname: app.globalData.loginInfo.myClass
            }, null, function(status) {


              //本班存在该学号的学生，记录作业
              if (status.data) {
                //_this.setZy(stuNum)
                app.getStuInfo()
                var stuList = app.getMyClass(app.globalData.loginInfo.myClass).stuList
                //每次提交作业就从学生列表删除该学生
                for (var i in stuList) {
                  if (stuList[i].studentNum == stuNum) {
                    stuList.splice(i, 1)
                  }
                }
                app.updateStuInfo(app.globalData.loginInfo.myClass, stuList)
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
            })

          },
          fail: (res) => {

          }
        })
        break

      case 'submit':
        wx.navigateTo({
          url: '../submit/submit'
        })
        break

      case 'record':
        wx.navigateTo({
          url: '../info/info'
        })
        break

      case 'add':
        wx.navigateTo({
          url: '../add/add'
        })
        break

    }
  }
})