var ldbData_box = document.getElementById("ldb_data_box").value.split('//');
ldbData_box.pop();
var ldbData_boxList = [];
ldbData_box.forEach(ro =>
	ldbData_boxList.push(ro.split(',').map(function(x) { return parseFloat(x); })));
var categoryLenList = [];
for(var i = 0; i < ldbData_boxList.length; i++) {
	categoryLenList.push(String(i+1));
}

var ld_line = document.getElementById("acq").value;
ld_line = JSON.parse(ld_line);


Highcharts.chart('accuracy_chart', {

    title: {
        text: ''
    },

    yAxis: {
        title: {
            text: ''
        }
    },
    
    credits: {
        enabled: false
    },
    exporting: {
        enabled: false	
    },

    xAxis: {
        categories: categoryLenList,
        title: {
		text: ''
        }
    },

    legend: {
		enabled: false
    },

    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
        }
    },

    series: [{
        name: 'Test Accuracy',
        data: ld_line
    }],

    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }

});
