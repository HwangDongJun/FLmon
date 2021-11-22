var entropy_data = document.getElementById("re_data").value;
entropy_data = JSON.parse(entropy_data);
var class_dataDict = {};
for(var round in Object.keys(entropy_data)) {
	let cr_round = parseInt(round)+1;
	for(var i = 0; i <= entropy_data[cr_round].length-1; i++) {
		if(Object.keys(class_dataDict).includes(String(i))) {
			let temp_list = class_dataDict[i];
			temp_list.push(entropy_data[cr_round][i]);
			class_dataDict[i] = temp_list;
		} else {
			class_dataDict[i] = [entropy_data[cr_round][i]];
		}
	}
}

var categoryLenList = [];
for(var i = 0; i < entropy_data.length; i++) {
	categoryLenList.push(String(i+1));
}

var series_data = [];
for(var i = 0; i < Object.keys(class_dataDict).length; i++) {
	series_data.push({'name': i, 'data': class_dataDict[i]});
}

Highcharts.chart('entropy_chart', {

    title: {
		text: ''
    },

	credits: {
		enabled: false
	},
	exporting: {
		enabled: false
	},

    yAxis: {
        title: {
            text: ''
        }
    },

    xAxis: {
		categories: categoryLenList,
		title: {
			text: ''
		}
    },

    legend: {
        align: 'right',
        verticalAlign: 'top',
    },

    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 1
        }
    },

    series: series_data,

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
