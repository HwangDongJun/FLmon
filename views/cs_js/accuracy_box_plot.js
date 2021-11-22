var adbData_box = document.getElementById("adb_data_box").value.split('//');
adbData_box.pop();
var adbData_boxList = [];
adbData_box.forEach(ro =>
	adbData_boxList.push(ro.split(',').map(function(x) { return parseFloat(x); })));
var categoryLenList = [];
for(var i = 0; i < adbData_boxList.length; i++) {
	categoryLenList.push(String(i+1));
}

var adbData_out = document.getElementById("adb_data_out").value.split('//');
var adbData_outList = [];
if(adbData_out.length > 1) {
	adbData_out.pop();
	
	for(var i = 0; i < adbData_out.length; i++) {
		var temp_outList = adbData_out[i].split(',');
		temp_outList[0] = String(temp_outList[0]);
		temp_outList[1] = parseFloat(temp_outList[1]);

		adbData_outList.push(temp_outList);
	}
}

Highcharts.chart('accuracy_chart', {

    chart: {
        type: 'boxplot'
    },

	credits: {
		enabled: false
	},
	exporting: {
		enabled: false
	},

    title: {
		text: ''
    },

    legend: {
        enabled: false
    },

    xAxis: {
        categories: categoryLenList,
        title: {
            text: ''
        }
    },

    yAxis: {
        title: {
            text: ''
        }
    },

    series: [{
        name: 'Accuracy',
        data: adbData_boxList,
    }, {
        name: 'Outliers',
        color: Highcharts.getOptions().colors[0],
        type: 'scatter',
        data: adbData_outList,
        marker: {
            fillColor: 'white',
            lineWidth: 1,
            lineColor: Highcharts.getOptions().colors[0]
        },
        tooltip: {
            pointFormat: 'Observation: {point.y}'
        }
    }]

});
