var at_round = document.getElementById("acc_loss_round").value.split(',');
var at_tt = document.getElementById("at_tt").value.split(',');
var at_ut = document.getElementById("at_ut").value.split(',');
var aggtime = document.getElementById("aggtime").value.split(',');
var distime = document.getElementById("distime").value.split(',');
var cli_rou_count = document.getElementById("client_round_count").value.split(',');

var barOptions_stacked = {
	responsive: false,
    tooltips: {
        enabled: false
    },
    hover :{
        animationDuration:0
    },
    scales: {
        xAxes: [{
            ticks: {
                beginAtZero:true,
                fontFamily: "'Open Sans Bold', sans-serif",
                fontSize:12
            },
            gridLines: {
            }, 
            stacked: true,
			position: 'bottom'
        }],
        yAxes: [{
			id: 'y',
            gridLines: {
                display:false,
                color: "#fff",
                zeroLineColor: "#fff",
                zeroLineWidth: 0
            },
            ticks: {
                fontFamily: "'Open Sans Bold', sans-serif",
                fontSize:12
            },
            stacked: true,
			position: 'left'
        }, {
			id: 'y1',
			ticks: {
				beginAtZero:true,
				fontSize:12
			},
			position: 'right'
		}]
    },
    legend:{
        display:true,
		position: 'right'
    },
    
    pointLabelFontFamily : "Quadon Extra Bold",
    scaleFontFamily : "Quadon Extra Bold",
};
var barOptions_stacked2 = {
	responsive: false,
    tooltips: {
        enabled: false
    },
    hover :{
        animationDuration:0
    },
    scales: {
        xAxes: [{
            ticks: {
                beginAtZero:true,
                fontFamily: "'Open Sans Bold', sans-serif",
                fontSize:12
            },
            scaleLabel:{
                display:true,
				labelString: "Rounds"
            },
            gridLines: {
            }, 
            stacked: true,
			position: 'bottom'
        }],
        yAxes: [{
            gridLines: {
                display:false,
                color: "#fff",
                zeroLineColor: "#fff",
                zeroLineWidth: 0
            },
            ticks: {
                fontFamily: "'Open Sans Bold', sans-serif",
                fontSize:12
            },
            stacked: true
        }]
    },
    legend:{
        display:true,
		position: 'right'
    },
    
    pointLabelFontFamily : "Quadon Extra Bold",
    scaleFontFamily : "Quadon Extra Bold",
};



var ctx = document.getElementById("Chart1");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: at_round,
        
        datasets: [{
			data: cli_rou_count,
			borderColor: "#E8471F",
			backgroundColor: "rgb(232,71,31,0.6)",
			label: "Clients (right)",
			type: "line",
			fill: false,
			yAxisID: 'y1'
		}, {
            data: at_tt,
            backgroundColor: "rgba(163,103,126,1)",
            hoverBackgroundColor: "rgba(140,85,100,1)",
			label: "Update time",
			yAxisID: 'y'
        }]
    },

    options: barOptions_stacked,
});

var ctx2 = document.getElementById("othertime");
var myChart2 = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: at_round,
        
        datasets: [{
            data: distime,
            backgroundColor: "rgba(63,103,126,1)",
            hoverBackgroundColor: "rgba(50,90,100,1)",
			label: "Distribution time"
        },{
            data: at_ut,
            backgroundColor: "rgba(63,203,226,1)",
            hoverBackgroundColor: "rgba(46,185,235,1)",
			label: "Upload time"
        },{
			data: aggtime,
			backgroundColor: "rgba(51,120,126,1)",
			hoverBackgroundColor: "rgba(31,172,235,1)",
			label: "Aggregation time"
		}]
    },

    options: barOptions_stacked2,
});
