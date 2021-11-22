var ldbData_box = document.getElementById("ldb_data_box").value.split('//');
ldbData_box.pop();
var ldbData_boxList = [];
ldbData_box.forEach(ro =>
	ldbData_boxList.push(ro.split(',').map(function(x) { return parseFloat(x); })));
var categoryLenList = [];
for(var i = 0; i < ldbData_boxList.length; i++) {
	categoryLenList.push(String(i+1));
}

var ldbData_out = document.getElementById("ldb_data_out").value.split('//');
var ldbData_outList = [];
if(ldbData_out.length > 1) {
	ldbData_out.pop();
	
	for(var i = 0; i < ldbData_out.length; i++) {
		var temp_outList = ldbData_out[i].split(',');
		temp_outList[0] = parseInt(temp_outList[0]);
		temp_outList[1] = parseFloat(temp_outList[1]);

		ldbData_outList.push(temp_outList);
	}
}

Highcharts.chart('loss_chart', {

    chart: {
        type: 'boxplot'
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
		name: 'Loss',
		data: ldbData_boxList,
	}]

});
