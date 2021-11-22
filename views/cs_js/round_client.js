var cci_round_data = document.getElementById("cci_round").value;
cci_round_data = cci_round_data.split(',');
cci_round_data.pop();
var cci_client_data = document.getElementById("cci_client").value;
cci_client_data = JSON.parse(cci_client_data);

Highcharts.chart('round_clients', {
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
	legend: {
		enabled: false
	},
    xAxis: {
        categories: cci_round_data,
        crosshair: true,
    },
    yAxis: {
        min: 0,
		title: {
			text: ''
		},
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y} clients</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            pointPadding: 0.2,
            borderWidth: 0
        }
    },
    series: [{
        name: 'Number of clients',
        data: cci_client_data
    }]
});
