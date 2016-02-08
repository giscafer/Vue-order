/**
 * 图表统计
 * 使用的是highcharts
 */
var ChartsUtil = {
    /**
     * 饼状图
     */
    createPie: function (options) {
        $('#' + options.divId).highcharts({
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },
            title: {
                text: options.title
            },
            tooltip: {
                pointFormat: '订单次数：<b>{point.y}</b><br>{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: true,
                        format: '{point.name}'
                    }
                }
            },
            series: [{
                type: 'pie',
                name: '占比',
                data: options.dataItems
            }]
        });
    },
    /** 
     * 创建柱状图
     * @parm divId
     * @parm title
     * @parm xAxis
     * @parm ytitle
     * @parm yunit
     * @parm series
     */
    createColumn: function (options) {
        $('#' + options.divId).highcharts({
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            // exporting: {
            //     enabled: true,
            //     url: Config.highcharUrl
            // },
            title: {
                text: options.title
            },
            xAxis: {
                categories: options.xAxis,
                max: options.xAxis.length < 6 ? options.xAxis.length - 1 : 5
            },
            yAxis: {
                min: 0,
                title: {
                    text: options.ytitle
                },
                allowDecimals: false //是否允许刻度有小数
            },
            tooltip: {
                borderWidth: 0,
                backgroundColor: 'rgba(219,219,216,0.8)',
                shadow: false,
                formatter: function () {
                    return '<b style="color:{series.color};padding:0">' + this.key + '</b>' +
                        '<br/>' + '<b style="color:{series.color};padding:0">' + this.series.name + ': ' + this.y + this.series.userOptions.danwei + '</b>';
                }
            },
            plotOptions: {
                column: {
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true
                    },
                    candlestick: {
                        lineColor: '#404048'
                    },
                    /* events: {
                         click: function(e) {

                             var drilldown = e.point.category;
                             ceshi1(drilldown);
                         }
                     },*/
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: options.series,
            scrollbar: {
                enabled: true
            },
            // General
            background2: '#F0F0EA'
        });
    },
    /**
     * 创建双Y的柱状图
     * @author giscafer
     * @version 1.0
     * @date    2016-01-12T14:25:20+0800
     */
    createTwoYColumn: function (options) {
        $('#' + options.divId).highcharts({
            chart: {
                zoomType: 'xy'
            },
            // exporting: {
            //     enabled: true,
            //     url: Config.highcharUrl
            // },
            title: {
                text: options.title
            },
            xAxis: {
                categories: options.xAxis,
                max: options.xAxis.length < options.xLength ? options.xAxis.length - 1 : (options.xLength - 1)
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} h',
                    style: {
                        color: '#89A54E'
                    }
                },
                title: {
                    text: options.pytitle,
                    style: {
                        color: '#89A54E'
                    }
                }
            }, { // Secondary yAxis
                    title: {
                        text: options.sytitle,
                        style: {
                            color: '#4572A7'
                        }
                    },
                    labels: {
                        format: '{value} km',
                        style: {
                            color: '#4572A7'
                        }
                    },
                    opposite: true
                }],
            tooltip: {
                shared: true
            },
            /* legend: {
                 layout: 'vertical',
                 align: 'left',
                 x: 120,
                 verticalAlign: 'top',
                 y: 100,
                 floating: true,
                 backgroundColor: '#FFFFFF'
             },*/
            series: options.series,
            scrollbar: {
                enabled: true
            }
        });
    }
}