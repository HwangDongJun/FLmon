var cr_round_data = document.getElementById("cr_round").value;
cr_round_data = cr_round_data.split(',');
cr_round_data.pop();
var cr_cpu_data = document.getElementById("cr_cpu").value;
cr_cpu_data = JSON.parse(cr_cpu_data);
var cr_ram_data = document.getElementById("cr_ram").value;
cr_ram_data = JSON.parse(cr_ram_data);

cr_cpu_data_list = []; cr_ram_data_list = [];
for(var i = 0; i < cr_cpu_data.length; i++) {
	cr_cpu_data_list.push(cr_cpu_data[i]);
	cr_ram_data_list.push(cr_ram_data[i]);
}

Highcharts.chart('cpu_ram_chart', {
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
        categories: cr_round_data,
        crosshair: true,
		title: {
			text: 'Rounds'
		}
    },
    yAxis: {
        min: 0,
        title: {
            text: 'System Resource Usage Percent (%)'
        }
    },
    legend: {
        align: 'right',
        x: -30,
        verticalAlign: 'top',
        y: -10,
        floating: true,
        backgroundColor:
            Highcharts.defaultOptions.legend.backgroundColor || 'white',
        borderColor: '#CCC',
        borderWidth: 1,
        shadow: false
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} %</b></td></tr>',
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
        name: 'CPU',
        data: cr_cpu_data_list
    }, {
		name: 'RAM',
		data: cr_ram_data_list
	}]
});
