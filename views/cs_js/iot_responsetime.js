Highcharts.chart('responsetime', {

    chart: {
        type: 'column'
    },

    title: {
        text: ''
    },
    credits: {
    	enabled: false
    },
    exporting: {
    	enabled: false
    },

    xAxis: {
        categories: ['ON', 'OFF']
    },

    yAxis: {
        allowDecimals: false,
        min: 0,
        title: {
            text: 'Response time (s)'
        }
    },

    tooltip: {
        formatter: function () {
            return '<b>' + this.x + '</b><br/>' +
                this.series.name + ': ' + this.y + '<br/>' +
                'Total: ' + this.point.stackTotal;
        }
    },

    plotOptions: {
        column: {
            stacking: 'normal'
        }
    },

    series: [{
        name: 'IoT control time',
        data: [0.06, 0.1],
        stack: 'time'
    }, {
        name: 'Activity classification time',
        data: [0.42, 0.47],
        stack: 'time'
    }, {
        name: 'Image capturing time',
        data: [0.32, 0.38],
        stack: 'time'
    }]
});
