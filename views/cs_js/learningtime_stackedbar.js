var trainingtime_data = document.getElementById("ttc").value;
var uploadtime_data = document.getElementById("utc").value;
var servertime_data = document.getElementById("stl").value;
trainingtime_data = JSON.parse(trainingtime_data);
uploadtime_data = JSON.parse(uploadtime_data);
servertime_data = JSON.parse(servertime_data);

var categoryLenList = [];
for(var i = 0; i < trainingtime_data.length; i++) {
	categoryLenList.push(String(i+1));
}

// distribution -> update -> upload -> aggregation time

Highcharts.chart('learningtime_chart', {
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
        categories: categoryLenList,
		title: {
			text: ''
		}
    },
	yAxis: {
        min: 0,
        title: {
            text: ''
        }
    },
    legend: {
		width: 400,
		itemWidth: 200,
        align: 'right',
        verticalAlign: 'top',
    },
    tooltip: {
        headerFormat: '<b>{point.x}</b><br/>',
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
        column: {
            stacking: 'normal',
        }
    },
    series: [{
		name: 'Aggregation Time',
		data: servertime_data[1],
		color: '#EA903C'
	}, {
        name: 'Upload Time',
        data: uploadtime_data[0],
		color: '#CD7CEE'
    }, {
        name: 'Update Time',
        data: trainingtime_data,
		color: '#3CABEA'
    }, {
        name: 'Distribution Time',
        data: servertime_data[0],
		color: '#56BA51'
    }]
});
