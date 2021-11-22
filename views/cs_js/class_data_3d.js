var gc_data = document.getElementById("gcdata").value;
gc_data = JSON.parse(gc_data);

Highcharts.chart('class_data', {
    chart: {
        type: 'pie',
        options3d: {
            enabled: true,
            alpha: 45
        }
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
    plotOptions: {
        pie: {
            innerSize: 100,
            depth: 45
        }
    },
    series: [{
        name: 'Number of clients',
        data: gc_data
    }]
});
