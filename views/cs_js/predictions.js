var pre_round_data = document.getElementById("prrounddata").value;
pre_round_data = JSON.parse(pre_round_data);
var pre_data = document.getElementById("prdata").value;
pre_data = JSON.parse(pre_data);

Highcharts.chart('predict_chart', {

    title: {
        text: ''
    },

    yAxis: {
        title: {
            text: ''
        },
		max: 1
    },
    
    credits: {
        enabled: false
    },
    exporting: {
        enabled: false	
    },

    xAxis: {
        categories: pre_round_data,
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
        name: 'Wrong Predictions',
        data: pre_data
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
