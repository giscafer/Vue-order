/**
 * orders.html脚本
 */
  $(document).ready(function() {
      $('#queryDate').datetimepicker({
          language: 'zh-CN', //汉化 
          todayBtn: 1,
          autoclose: true,
          todayHighlight: 1,
          startView: 2,
          minView: 'month',
          forceParse: 0
      }).on('changeDate', function(ev) {
          var queryDate = $.formatDate(new Date(ev.date.valueOf()), "yyyy-MM-dd");
          EventProxy.fire('getOrders', queryDate);
      });
      $('#orderForm').bootstrapValidator({
          message: 'This value is not valid',
          feedbackIcons: {
              valid: 'glyphicon glyphicon-ok',
              invalid: 'glyphicon glyphicon-remove',
              validating: 'glyphicon glyphicon-refresh'
          },
          fields: {
              dish_name: {
                  validators: {
                      notEmpty: {
                          message: '菜名不能为空'
                      },
                      stringLength: {
                          min: 2,
                          max: 40,
                          message: '菜名字符个数为2~40'
                      }
                  }
              },
              dish_price: {
                  validators: {
                      notEmpty: {
                          message: '价格不能为空'
                      },
                      numeric: {
                          message: '只能输入数字'
                      },
                      between: {
                          min: 1,
                          max: 100,
                          message: '价格只能在1~100之间'
                      }
                  }
              }
          }
      });
  });
  var EventProxy = new EventProxy();
  var orderVue = new Vue({
      el: '#VueAapp',
      ready: function() {
          var mean = JSON.parse(localStorage.getItem("mean"));
          console.log(mean);
          var that = this;
          that.mean = mean;
          var queryDate = $.formatDate(new Date(), "yyyy-MM-dd");
          $("#queryDateValue").val(queryDate);

          function getOrders(queryDate) {
              $.get(Config.hostUrl + '/orders/' + queryDate + '/query', function(res) {
                  that.$set('orders', res.data);
              }).error(function(data, status, request) {
                  console.log('fail' + status + "," + request);
              });
          }
          EventProxy.on('getOrders', getOrders);
          EventProxy.fire('getOrders', queryDate);
      },
      data: {
          date: '2016-01-02',
          sortparam: '',
          order: {
              dish_name: '',
              dish_price: '',
              ispack: ''
          },
          mean: null,
          meanName: localStorage.meanName,
          orders: ''
      },
      computed: {
          sum: function() {
              var result = 0;
              for (var i = 0; i < this.orders.length; i++) {
                  result = Number(this.orders[i].dish_price) + result;
              }
              return result;
          },
          count: function() {
              return this.orders.length;
          }
      },

      methods: {
          todayQuery: function() {
              var queryDate = $.formatDate(new Date(), "yyyy-MM-dd");
              $("#queryDateValue").val(queryDate);
              EventProxy.fire('getOrders', queryDate);
          },
          copyTheOrder: function() {
              var orders = this.$get('orders');
              var str = "老板，订餐：";
              var len = orders.length;
              for (var i = 0; i < len; i++) {
                  if (orders[i].ispack === true) {
                      str += orders[i].dish_name + "（打包）";
                  } else {
                      str += orders[i].dish_name;
                  }
                  str += "、";
              }
              str = str.substring(0, str.length - 1);
              str += "；共" + len + "份！";
              console.log(str);
              confirm(str);
          },
          addOrder: function(name, price) {
              if (name) {
                  var data = {
                      dish_name: name,
                      dish_price: price,
                      ispack: false
                  }
                  $.ajax({
                      url: Config.hostUrl + '/orders/create',
                      type: "post",
                      data: data,
                      success: function(data) {
                           window.location.href='./orders';
                      },
                      error: function(err, result) {
                          if (err && err.status) {
                              if (err.status == '403') {
                                  location.href = '/signin';
                              }
                          }
                      }
                  })
              } else {
                  if ($('#orderForm').data('bootstrapValidator').isValid()) {
                      // $('#orderForm').submit();
                      document.getElementById("orderForm").submit();
                  }
              }
          },
          delOrder: function(order) {
              var that = this;
              BootstrapDialog.show({
                  title: '提示',
                  type: BootstrapDialog.TYPE_SUCCESS,
                  draggable: true,
                  message: '是否确定删除该记录？',
                  buttons: [{

                      label: '删除',
                      action: function(dialog) {
                          //删除记录
                          $.get(Config.hostUrl + '/orders/' + order._id + '/del', function(res) {
                              console.log(res);
                              if (!res.success) {
                                  dialog.close();
                                  alert(res.message);
                              } else {
                                  that.orders.$remove(order);
                                  dialog.close();
                              }
                          }).error(function(data, status, request) {
                              console.log('fail' + status + "," + request);
                          }).fail(function(xhr) {
                              if (xhr.status === 403) {
                                  alert('您没有权限删除该记录，' + xhr.statusText);
                              }
                          });
                      }
                  }, {
                      label: '取消',
                      action: function(dialog) {
                          dialog.close();
                      }
                  }]
              });
              //未知的两个遮罩层
              setTimeout(function() {
                  $('.modal-backdrop.fade.in').css('z-index', '0');
              }, 300);

          },
          editOrder: function(_id) {
              var that = this;
              $.get(Config.hostUrl + '/orders/' + _id + '/edit', function(res) {
                  console.log(res);
                  if (res.success === 1) {
                      that.orders.$remove(order);
                      dialog.close();
                  }
              }).error(function(data, status, request) {
                  console.log('fail' + status + "," + request);
              });
          },
          sortBy: function(sortparam) {

              this.sortparam = sortparam;
          }
      }
  });
  //过滤器，格式化日期
  Vue.filter('dateformat', function(value) {
      return $.formatDate(new Date(value), "yyyy-MM-dd HH:mm:ss");
  });
  Vue.nextTick(function() {
      var widget = $('.tabs-vertical');
      var tabs = widget.find('ul a'),
          content = widget.find('.tabs-content-placeholder > div');
      tabs.on('click', function(e) {
          e.preventDefault();
          var index = $(this).data('index');
          tabs.removeClass('tab-active');
          content.removeClass('tab-content-active');
          $(this).addClass('tab-active');
          content.eq(index).addClass('tab-content-active');
      });
  })
