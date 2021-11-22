const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
var idb = new sqlite3.Database("../FederatedLearning-gRPC/server/dashboard_db/index.db", sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	} else {
		console.log("Connected to the index database.");
	}
});
var cdb = new sqlite3.Database("../FederatedLearning-gRPC/server/dashboard_db/learning.db", sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		} else {
			console.log("Connected to the core database.");
		}
});

// db query
const clientCountQuery = `SELECT COUNT(clientname) AS Ccn FROM ClientID`;
const StatusQuery = `SELECT * FROM NowStatus ORDER BY round DESC LIMIT 1`;
const TrainingQuery = `SELECT (SUM(avg_acc)/COUNT(avg_acc)) AS racc, (SUM(avg_loss)/COUNT(avg_loss)) AS rloss FROM (SELECT (SUM(accuracy)/COUNT(clientid)) AS avg_acc, (SUM(loss)/COUNT(clientid)) AS avg_loss FROM LearningTrain GROUP BY round)`;
const TrainingtimeQuery = `SELECT (SUM(RTA)/COUNT(RTA)) AS avg_tt FROM (SELECT SUM(trainingtime)/COUNT(trainingtime) AS RTA FROM LearningTrain GROUP BY round)`;
const RoundListQuery = `SELECT DISTINCT round FROM LearningTrain`;
const AccLossListQuery = `SELECT (SUM(accuracy)/COUNT(clientid)) AS avg_acc, (SUM(loss)/COUNT(clientid)) AS avg_loss FROM LearningTrain GROUP BY round`;
const TrainingTimeListQuery = `SELECT SUM(trainingtime) AS avg_tt FROM LearningTrain GROUP BY round`;
const DataClassSizeQuery = `SELECT datasize FROM LearningRound`;
const CurrRadarChartQuery = `SELECT LR.clientid, LR.datasize, LR.classsize FROM (LearningRound) AS LR, (SELECT DISTINCT round AS DR FROM LearningRound ORDER BY round DESC LIMIT 1) AS LRD WHERE LRD.DR=LR.round`;
const PrevRadarChartQuery = `SELECT LR.clientid, LR.datasize, LR.classsize FROM (LearningRound) AS LR, (SELECT DISTINCT round AS DR FROM LearningRound ORDER BY round DESC LIMIT 1) AS LRD WHERE LRD.DR-1=LR.round`;
const RoundClientCountQuery = `SELECT COUNT(clientid) AS Cclient FROM LearningTrain GROUP BY round`;
const UploadTimeListQuery = `SELECT round, (SUM(uploadendtime)-SUM(uploadstarttime)) AS uploadtime FROM LearningTime GROUP BY round`;
const UploadTimeAvgQuery = `SELECT ((SUM(uploadendtime)-SUM(uploadstarttime))/COUNT(uploadstarttime)) AS avg_uploadtime FROM LearningTime`;
const InfoLearningQuery = `SELECT (LT.cr / LI.mr) AS avg_mr
							FROM (SELECT max_round AS mr FROM LearningInfo) AS LI,
								 (SELECT COUNT(DISTINCT round) AS cr FROM LearningTrain) AS LT`;
const ServerTimeQuery = `SELECT round, SUM(aggregationtime) AS sum_aggtime, SUM(distributiontime) AS sum_distime FROM ServerTime GROUP BY round`;
const ServerTimeAvgQuery = `SELECT (SUM(aggregationtime)/COUNT(DISTINCT round)) AS avg_agg, (SUM(distributiontime)/COUNT(DISTINCT round)) AS avg_dis FROM ServerTime`;
const DataSizebyClient = `select DISTINCT clientid, datasize, classsize from LearningRound ORDER BY clientid asc`;
const CurrentRoundQuery = `select round from LearningRound ORDER BY round desc LIMIT 1`;
const ParticipantClientQuery = `SELECT COUNT(clientid) AS ci FROM LearningRound GROUP BY round ORDER BY round desc LIMIT 2`;

app.set('view engine', 'jade');
app.set('views', './views');

app.use(express.static(path.join(__dirname, '/')));

app.get('/', (req, res) => {
	res.redirect('/FLDashboard');
});

async function idb_result(query) {
	let idbresult = null;
	idbresult = await new Promise((resolve) => {
		idb.serialize(() => {
			idb.all(query, [], (err, row) => {
				resolve(row);
			});
		});
	});
	return idbresult;
}
async function cdb_result(query) {
	let cdbresult = null;
	cdbresult = await new Promise((resolve) => {
		cdb.serialize(() => {
			cdb.all(query, [], (err, row) => {
				resolve(row);
			});
		});
	});
	return cdbresult;
}

app.get('/get_db', async(req, res) => {
	await cpu_ram_monitoring();
});

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

async function dataclasssize_chart() {
	let dataclasssizelist = await cdb_result(DataClassSizeQuery);
	let chartdataclasssizelist = [];
	dataclasssizelist.forEach(ro =>
		chartdataclasssizelist.push(ro['datasize'].split(',')));
	let sum_datasize = 0; let reducer = (accumulator, currentValue) => parseInt(accumulator) + parseInt(currentValue);
	chartdataclasssizelist.forEach(ro =>
		sum_datasize += ro.reduce(reducer));
	let classsize = chartdataclasssizelist[0].length;
	
	let curr_radarchart = await cdb_result(CurrRadarChartQuery);
	let curr_chartdata = [];
	curr_radarchart.forEach(ro =>
		curr_chartdata.push(ro['datasize'].split(',')));
	let curr_radarchartlist = new Array(classsize).fill(0);
	for(var i = 0; i < curr_chartdata.length; i++) {
		for(var j = 0; j < classsize; j++) {
			curr_radarchartlist[j] += parseInt(curr_chartdata[i][j], 10);
		}
	}
	let prev_radarchart = await cdb_result(PrevRadarChartQuery);
	let prev_chartdata = [];
	prev_radarchart.forEach(ro =>
		prev_chartdata.push(ro['datasize'].split(',')));
	let prev_radarchartlist = new Array(classsize).fill(0);
	for(var i = 0; i < prev_chartdata.length; i++) {
		for(var j = 0; j < classsize; j++) {
			prev_radarchartlist[j] += parseInt(prev_chartdata[i][j], 10);
		}
	}

	let classname = curr_radarchart[0]['classsize'].split(',');

	// heterogeneous data
	let clientcount = await idb_result(clientCountQuery);

	let het_data = new Array(classsize).fill(0);
	let get_data = new Array(classsize).fill(0);
	for(var i = 0; i < curr_chartdata.length; i++) {
		for(var j = 0; j < classsize; j++) {
			let avg_data = curr_radarchartlist[j]/clientcount[0]['Ccn'];
			if(curr_chartdata[i][j] <= avg_data) {
				het_data[j] += 1
			}

			if(curr_chartdata[i][j] != 0) {
				get_data[j] += 1
			}
		}
	}

	let max_datasize = Math.max(...curr_radarchartlist);
	let max_predatasize = Math.max(...prev_radarchartlist);

	return [sum_datasize, classsize, classname, curr_radarchartlist, prev_radarchartlist, het_data, max_datasize, get_data, max_predatasize]
}
async function acc_loss_chart() {
	let roundlist = await cdb_result(RoundListQuery);
	let chartroundlist = [];
	roundlist.forEach(ro =>
		chartroundlist.push(ro['round']));

	let acclosslist = await cdb_result(AccLossListQuery);
	let chartacclist = []; let chartlosslist = [];
	acclosslist.forEach(ro =>
		chartacclist.push(ro['avg_acc']));
	acclosslist.forEach(ro =>
		chartlosslist.push(ro['avg_loss']));
	return [chartroundlist, chartacclist, chartlosslist];
}
async function training_time_chart() {
	let trainingtimelist = await cdb_result(TrainingTimeListQuery);
	let charttrainingtimelist = [];
	trainingtimelist.forEach(ro =>
		charttrainingtimelist.push(ro['avg_tt']));
	return charttrainingtimelist;
}
async function upload_time_chart() {
	let uploadtimelist = await cdb_result(UploadTimeListQuery);
	let chartuploadtimelist = [];
	uploadtimelist.forEach(ro =>
		chartuploadtimelist.push(ro['uploadtime']));
	let avg_uploadtime = await cdb_result(UploadTimeAvgQuery);

	return [chartuploadtimelist, avg_uploadtime];
}
async function round_clinetcount_chart() {
	let rclientcountlist = await cdb_result(RoundClientCountQuery);
	let chartrclientcountlist = [];
	rclientcountlist.forEach(ro =>
		chartrclientcountlist.push(ro['Cclient']));
	return chartrclientcountlist;
}

async function round_learning_chart() {
	let maxround = await cdb_result(InfoLearningQuery);
	return maxround;
}
/*
async function insert_db_client_selection(req, cur_round) {
	let udt = req.query.updatetime == "" ? 1 : 0;
	let ult = req.query.uploadtime == "" ? 1 : 0;
	let agt = req.query.aggregationtime == "on" ? 1 : 0;
	let dit = req.query.distribution == "on" ? 1 : 0;
	let clv = req.query.classvolume == "on" ? 1 : 0;
	let dav = req.query.datavolume == "on" ? 1 : 0;
	let acc = req.query.acc == "on" ? 1 : 0;
	let los = req.query.loss == "on" ? 1 : 0;
	let cpu = req.query.cpu == "on" ? 1 : 0;
	let mem = req.query.memory == "on" ? 1 : 0;

	if(udt+ult+agt+dit+clv+dav+acc+los+cpu+mem > 0) {
		let res = await cdb_result("INSERT INTO ClientSelection VALUES ("+cur_round+", "+udt+", "+ult+", "+agt+", "+dit+", "+clv+", "+dav+", "+acc+", "+los+", "+cpu+", "+mem+")");
	}
}
*/

async function server_time_chart() {
	let ser_timelist = await cdb_result(ServerTimeQuery);
	let ser_aggtimelist = [];
	let ser_distimelist = [];
	ser_timelist.forEach(ro =>
		ser_aggtimelist.push(ro['sum_aggtime']));
	ser_timelist.forEach(ro =>
		ser_distimelist.push(ro['sum_distime']));
	let avg_agg_dis_time = await cdb_result(ServerTimeAvgQuery);

	return [ser_aggtimelist, ser_distimelist, avg_agg_dis_time]
}

async function datasize_by_client() {
	let dsbc = await cdb_result(DataSizebyClient);
	let clientsize_str = "";
	for(var i = 0; i < dsbc.length; i++) {
		if(i == dsbc.length-1) {
			clientsize_str += dsbc[i]['clientid'];
		} else {
			clientsize_str += dsbc[i]['clientid'] + ",";
		}
	}
	let datasize_str = "";
	for(var i = 0; i < dsbc.length; i++) {
		if(i == dsbc.length-1) {
			datasize_str += dsbc[i]['datasize'];
		} else {
			datasize_str += dsbc[i]['datasize'] + "/";
		}
	}
	
	return [clientsize_str, datasize_str]
}

app.get('/dashboard', async(req, res) => {
	let res_cc = await idb_result(clientCountQuery);
	let res_ss = await cdb_result(StatusQuery);
	let res_al = await cdb_result(TrainingQuery);
	let res_tt = await cdb_result(TrainingtimeQuery);
	// acc_loss chart
	let alc = await acc_loss_chart();
	// trainingtime chart / uploadtime chart
	let ttc = await training_time_chart();
	let utc = await upload_time_chart();
	// datasize, classsize radar chart
	let dcc = await dataclasssize_chart();
	// clients by round
	let res_cr = await round_clinetcount_chart();
	// curr round / max round
	let mr = await round_learning_chart();
	// check client selection
	//await insert_db_client_selection(req, res_ss[0]['round']);
	// server time list (aggregation, distribution)
	let stl = await server_time_chart();
	// datasize by client
	let dbc = await datasize_by_client();
	// current round
	let cur = await cdb_result(CurrentRoundQuery);
	// participant client
	let pcr = await cdb_result(ParticipantClientQuery);

	res.render('dashboard_main', {cCount: res_cc[0]['Ccn'], cRound: res_ss[0]['round'], ston: res_ss[0]['status_on'], stoff: res_ss[0]['status_off'], acc: String(Math.round((res_al[0]['racc']+Number.EPSILON)*10000)/100)+'%', loss: Math.round((res_al[0]['rloss']+Number.EPSILON)*100)/100, Tt: String(new Date(res_tt[0]['avg_tt']*1000).toISOString().substr(11, 8)), alc_round: alc[0], alc_acc: alc[1], alc_loss: alc[2], at_tt: ttc, at_ut: utc[0], Tu: String(new Date(utc[1][0]['avg_uploadtime']*1000).toISOString().substr(11, 8)), dcc_ds: dcc[0], dcc_cs: dcc[1], dcc_rcs: dcc[2], dcc_cur: dcc[3], dcc_pre: dcc[4], hete: dcc[5], mds: dcc[6], getdata: dcc[7], pds: dcc[8], cbr: res_cr, mcr: mr[0]['avg_mr']*100, aggtime: stl[0], distime: stl[1], Ta: String(new Date(stl[2][0]['avg_agg']*1000).toISOString().substr(11, 8)), Td: String(new Date(stl[2][0]['avg_dis']*1000).toISOString().substr(11, 8)), dbc_class: dbc[0], dbc_data: dbc[1], ccr:cur[0]['round'], curpar:pcr[0]['ci'], prepar:pcr[1]['ci']});
});

// dashboard (new version 2021-10-01)
const accuracy_boxplot_dataQuery = `SELECT round, accuracy FROM LearningTrain ORDER BY round ASC, accuracy ASC`;
const loss_boxplot_dataQuery = `SELECT round, loss FROM LearningTrain ORDER BY round ASC, loss ASC`;
const client_countQuery = `SELECT COUNT(distinct clientid) AS cc FROM LearningTrain`;
async function accuracy_boxplot_data() {
	let cc = await cdb_result(client_countQuery);
	let abd = await cdb_result(accuracy_boxplot_dataQuery);
	let lbd = await cdb_result(loss_boxplot_dataQuery);
	let acc_dict = {}; let loss_dict = {};
	for(var i = 0; i < abd.length; i++) {
		if(!(abd[i]['round'] in acc_dict)) {
			acc_dict[abd[i]['round']] = [abd[i]['accuracy']];
		} else {
			let temp_list = acc_dict[abd[i]['round']];
			temp_list.push(abd[i]['accuracy']);
			acc_dict[abd[i]['round']] = temp_list;
		}

		if(!(lbd[i]['round'] in loss_dict)) {
			loss_dict[lbd[i]['round']] = [lbd[i]['loss']];
		} else {
			let temp_list = loss_dict[lbd[i]['round']];
			temp_list.push(lbd[i]['loss']);
			loss_dict[lbd[i]['round']] = temp_list;
		}
	}

	let box_plot_str = ""; let box_plot_loss_str = "";
	let outlier_str = ""; let outlier_loss_str = "";

	for(var i = 0; i < Object.keys(acc_dict).length; i++) {
		let str_i = String(i+1);

		let q1_index = parseInt(acc_dict[str_i].length * 0.25);
		let q2_index = parseInt(acc_dict[str_i].length * 0.5);
		let q3_index = parseInt(acc_dict[str_i].length * 0.75);
		/*
		let q1 = (acc_dict[str_i].length+1) / 4;
		let q3 = (acc_dict[str_i].length+1) * (3/4);
		let q2 = 0;
		if(acc_dict[str_i].length % 2 != 0) {
			q2 = (acc_dict[str_i].length+1) / 2;
		} else {
			q2 = (acc_dict[str_i][acc_dict[str_i].length/2]+acc_dict[str_i][(acc_dict[str_i].length/2)+1]) / 2;
		}
		*/
		let q1 = 0;
		if(q1_index >= 1) {
			q1 = acc_dict[str_i][q1_index-1];
		}
		let q2 = acc_dict[str_i][q2_index-1];
		let q3 = acc_dict[str_i][q3_index-1];
		let iqr = q3 - q1;
		box_plot_str += String(q1-(1.5*iqr)) + ",";
		box_plot_str += String(q1) + ",";
		box_plot_str += String(q2) + ",";
		box_plot_str += String(q3) + ",";
		box_plot_str += String(q3+(1.5*iqr)) + "//";

		for(var j = 0; j < acc_dict[str_i].length; j++) {
			if(parseFloat(acc_dict[str_i][j]) < q1-(1.5*iqr) || parseFloat(acc_dict[str_i][j]) > q3+(1.5*iqr)) {
				outlier_str += String(i) + "," + String(acc_dict[str_i][j]) + "//";
			}
		}

		let q1_index_loss = parseInt(loss_dict[str_i].length * 0.25);
		let q2_index_loss = parseInt(loss_dict[str_i].length * 0.5);
		let q3_index_loss = parseInt(loss_dict[str_i].length * 0.75);

		let q1_loss = 0;
		if(q1_index_loss >= 1) {
			q1_loss = loss_dict[str_i][q1_index_loss-1];
		}
		let q2_loss = loss_dict[str_i][q2_index_loss-1];
		let q3_loss = loss_dict[str_i][q3_index_loss-1];
		let iqr_loss = q3_loss - q1_loss;
		box_plot_loss_str += String(q1_loss-(1.5*iqr_loss)) + ",";
		box_plot_loss_str += String(q1_loss) + ",";
		box_plot_loss_str += String(q2_loss) + ",";
		box_plot_loss_str += String(q3_loss) + ",";
		box_plot_loss_str += String(q3_loss+(1.5*iqr_loss)) + "//";

		for(var j = 0; j < loss_dict[str_i].length; j++) {
			if(parseFloat(loss_dict[str_i][j]) < parseFloat(q1_loss-(1.5*iqr_loss)) || parseFloat(loss_dict[str_i][j]) > parseFloat(q3_loss+(1.5*iqr_loss))) {
				outlier_loss_str += String(i) + "," + String(loss_dict[str_i][j]) + "//";
			}
		}
	}

	return [box_plot_str, outlier_str, box_plot_loss_str, outlier_loss_str];
}

const avg_lossQuery = `SELECT round, sum(loss)/count(loss) AS loss, sum(tloss)/count(tloss) AS tloss FROM LearningTrain GROUP BY round ORDER BY round ASC`;
const avg_accQuery = `SELECT round, sum(accuracy)/count(accuracy) AS acc FROM LearningTrain GROUP BY round ORDER BY round ASC`;
async function loss_lineplot_data() {
	let alq = await cdb_result(avg_lossQuery);
	let loss_list = []; let tloss_list = [];
	alq.forEach(function(dataset, index) {
		loss_list.push(dataset['loss']);
		tloss_list.push(dataset['tloss']);
	});

	let acq = await cdb_result(avg_accQuery);
	let acc_list = [];
	acq.forEach(function(dataset, index) {
		acc_list.push(dataset['acc']);
	});
	
	return [loss_list, tloss_list, acc_list];
}

const entropyQuery = `SELECT * FROM LearningRound`;
const lastroundQuery = `SELECT COUNT(round) AS cr FROM LearningRound`;
async function class_entropy() {
	let efd = await cdb_result(entropyQuery);
	let alr = await cdb_result(lastroundQuery);
	alr = alr[0]['cr'];
	let class_count = efd[0]['classsize'].split(',').length;

	let round_entropy = {};
	let class_str_list = new Array(class_count).fill("");
	let round_datasize = new Array(class_count).fill(0);
	let previous_round = '1';
	efd.forEach(function(dataset, index) {
		if(previous_round != dataset['round']) {
			let class_entropy = [];
			for(var i = 0; i < round_datasize.length; i++) {
				let entropy_value = 0;
				let one_temp = class_str_list[i].split(',');
				one_temp.pop();
				let one_class_str = one_temp.map(function(x) { return parseInt(x, 10); });
				for(var j = 0; j < one_class_str.length; j++) {
					let per_value = one_class_str[j]/round_datasize[i];
					if(per_value != 0) {
						entropy_value += per_value * Math.log(1/per_value);
					} else {
						entropy_value += 0;
					}
				}
				class_entropy.push(entropy_value);
			}
			round_entropy[previous_round] = class_entropy;
			
			round_datasize = new Array(class_count).fill(0);
			class_str_list = new Array(class_count).fill("");
		}

		let	ds = dataset['datasize'].split(',');
		for(var i = 0; i < ds.length; i++) {
			round_datasize[i] += parseInt(ds[i]);
			class_str_list[i] += String(ds[i]) + ",";
		}

		previous_round = dataset['round'];

		if(index == alr-1) {
			let class_entropy = [];
			for(var i = 0; i < round_datasize.length; i++) {
				let entropy_value = 0;
				let one_temp = class_str_list[i].split(',');
				one_temp.pop();
				let one_class_str = one_temp.map(function(x) { return parseInt(x, 10); });
				for(var j = 0; j < one_class_str.length; j++) {
					let per_value = one_class_str[j]/round_datasize[i];
					if(per_value != 0) {
						entropy_value += per_value * Math.log(1/per_value);
					} else {
						entropy_value += 0;
					}
				}
				class_entropy.push(entropy_value);
			}
			round_entropy[previous_round] = class_entropy;
		}
	});
	
	return round_entropy
}

async function class_entropy_for_cs() {
	let efd = await cdb_result(entropyQuery);
	let alr = await cdb_result(lastroundQuery);
	alr = alr[0]['cr'];
	let class_count = efd[0]['classsize'].split(',').length;

	let round_entropy = {};
	let class_str_list = new Array(class_count).fill("");
	let round_datasize = new Array(class_count).fill(0);
	let previous_round = '1';
	efd.forEach(function(dataset, index) {
		if(previous_round != dataset['round']) {
			let class_entropy = [];
			for(var i = 0; i < round_datasize.length; i++) {
				let entropy_value = 0;
				let one_temp = class_str_list[i].split(',');
				one_temp.pop();
				let one_class_str = one_temp.map(function(x) { return parseInt(x, 10); });
				for(var j = 0; j < one_class_str.length; j++) {
					let per_value = one_class_str[j]/round_datasize[i];
					if(per_value != 0) {
						entropy_value += per_value * Math.log(1/per_value);
					} else {
						entropy_value += 0;
					}
				}
				class_entropy.push(entropy_value);
			}
			round_entropy[previous_round] = class_entropy;
			
			round_datasize = new Array(class_count).fill(0);
			class_str_list = new Array(class_count).fill("");
		}

		let	ds = dataset['datasize'].split(',');
		for(var i = 0; i < ds.length; i++) {
			round_datasize[i] += parseInt(ds[i]);
			class_str_list[i] += String(ds[i]) + ",";
		}

		previous_round = dataset['round'];
		
		if(index == alr-1) {
			let class_entropy = [];
			for(var i = 0; i < round_datasize.length; i++) {
				let entropy_value = 0;
				let one_temp = class_str_list[i].split(',');
				one_temp.pop();
				let one_class_str = one_temp.map(function(x) { return parseInt(x, 10); });
				for(var j = 0; j < one_class_str.length; j++) {
					let per_value = one_class_str[j]/round_datasize[i];
					if(per_value != 0) {
						entropy_value += per_value * Math.log(1/per_value);
					} else {
						entropy_value += 0;
					}
				}
				class_entropy.push(entropy_value);
			}
			round_entropy[previous_round] = class_entropy;
		}
	});
	
	return round_entropy
}

async function class_information() {
	let efd = await cdb_result(entropyQuery);
	let alr = await cdb_result(lastroundQuery);
	alr = alr[0]['cr'];
	let class_count = efd[0]['classsize'].split(',').length;

	let class_index_count = {};
	let one_class_index_count = new Array(class_count).fill(0);
	let previous_round = '1';
	efd.forEach(function(dataset, index) {
		if(previous_round != dataset['round']) {
			let information_valueList = [];
			let listsum = one_class_index_count.reduce((a, b) => a + b, 0);
			for(var i = 0; i < one_class_index_count.length; i++) {
				information_valueList.push(-Math.log(one_class_index_count[i]/listsum))
			}
			class_index_count[previous_round] = information_valueList;
			one_class_index_count = new Array(class_count).fill(0);
		}

		let ds = dataset['datasize'].split(',');
		for(var i = 0; i < ds.length; i++) {
			if(parseInt(ds[i]) != 0) {
				one_class_index_count[i] += 1
			}
		}

		previous_round = dataset['round'];

		if(index == alr-1) {
			let information_valueList = [];
			let listsum = one_class_index_count.reduce((a, b) => a + b, 0);
			for(var i = 0; i < one_class_index_count.length; i++) {
				information_valueList.push(-Math.log(one_class_index_count[i]/listsum))
			}
			class_index_count[previous_round] = information_valueList;
		}
	});

	return class_index_count
}

let cpu_ram_monitoringQuery = `select round, (SUM(cpu)/COUNT(clientid)) AS avg_cpu, (SUM(ram)/COUNT(clientid)) AS avg_ram FROM CPURAMMonitoring GROUP BY round`;
async function cpu_ram_monitoring() {
	let crm = await cdb_result(cpu_ram_monitoringQuery);
	let round_str = "";
	let cpu_list = []; let ram_list = [];
	crm.forEach(function(dataset, index) {
		round_str += String(dataset['round']) + ",";
		cpu_list.push(dataset['avg_cpu']);
		ram_list.push(dataset['avg_ram']);
	});

	return [round_str, cpu_list, ram_list]
}

let round_clientQuery = `SELECT round, (COUNT(clientid)) AS cci FROM LearningRound GROUP BY round`;
async function round_client() {
	let crq = await cdb_result(round_clientQuery);
	let round_str = "";
	let round_client_list = [];
	crq.forEach(function(dataset, index) {
		round_str += String(dataset['round']) + ",";
		round_client_list.push(dataset['cci']);
	});

	return [round_str, round_client_list]
}

let distribution_timeQuery = `SELECT SUM(distributiontime) AS avg_dis FROM DistributionTime GROUP BY round`;
let aggregation_timeQuery = `SELECT SUM(aggregationtime) AS aggre FROM AggregationTime GROUP BY round`;
async function dis_agg_time() {
	let dtq = await cdb_result(distribution_timeQuery);
	let atq = await cdb_result(aggregation_timeQuery);
	let dtq_list = []; let atq_list = [];
	dtq.forEach(function(dataset, index) {
		dtq_list.push(dataset['avg_dis']);
	});
	atq.forEach(ro =>
		atq_list.push(ro['aggre']));

	return [dtq_list, atq_list]
}

let all_datasizeQuery = `SELECT datasize FROM LearningRound WHERE round=1`;
let client_accQuery = `SELECT (ca.sum/aa.sum) AS caaa
						FROM
						(SELECT SUM(accuracy) AS sum FROM LearningTrain GROUP BY clientid) AS ca,
						(SELECT SUM(accuracy) AS sum FROM LearningTrain) AS aa`;
let client_lossQuery = `SELECT (cl.sum/al.sum) AS clal
						FROM
						(SELECT SUM(loss) AS sum FROM LearningTrain GROUP BY clientid) AS cl,
						(SELECT SUM(loss) AS sum FROM LearningTrain) AS al`;
let client_updateQuery = `SELECT (trt.sum/tll.sum) AS trtll
							FROM
							(SELECT SUM(trainingtime) AS sum FROM LearningTrain GROUP BY clientid) AS trt,
							(SELECT SUM(trainingtime) AS sum FROM LearningTrain) AS tll`;
let client_uploadQuery = `SELECT (ult.sum/ull.sum) as ultll
							FROM
							(SELECT SUM(-uploadendtime+uploadstarttime) AS sum FROM LearningTime GROUP BY clientid) AS ult,
							(SELECT SUM(-uploadendtime+uploadstarttime) AS sum FROM LearningTime) AS ull`;
let client_resourceQuery = `SELECT (cr.sum/cll.sum) as crcll
							FROM
							(SELECT SUM(cpu) AS sum FROM CPURAMMonitoring GROUP BY clientid) AS cr,
							(SELECT SUM(cpu) AS sum FROM CPURAMMonitoring) AS cll`;
async function clientranking() {
	let all_data = 0;
	let client_dict = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, 
					   '11': 0, '12': 0, '13': 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0};
	let pa1 = await cdb_result(all_datasizeQuery);
	pa1.forEach(function(dataset, index) {
		let data_split = dataset['datasize'].split(',');
		data_split.forEach(function(data, i) {
			client_dict[String(i+1)] += parseInt(data);
			all_data += parseInt(data);
		});	
	});
	for(var key in Object.keys(client_dict)) {
		client_dict[String(parseInt(key)+1)] = client_dict[String(parseInt(key)+1)] / all_data;
	}
	let pa2 = await cdb_result(client_accQuery);
	pa2.forEach(function(dataset, index) {
		client_dict[String(index+1)] = client_dict[String(index+1)] + dataset['caaa'];
	});
	let pa3 = await cdb_result(client_lossQuery);
	pa3.forEach(function(dataset, index) {
		client_dict[String(index+1)] = client_dict[String(index+1)] + dataset['clal'];
	});

	let let1 = await cdb_result(client_updateQuery);
	let1.forEach(function(dataset, index) {
		client_dict[String(index+1)] = client_dict[String(index+1)] + dataset['trtll'];
	});
	let let2 = await cdb_result(client_uploadQuery);
	let2.forEach(function(dataset, index) {
		client_dict[String(index+1)] = client_dict[String(index+1)] + dataset['ultll'];
	});
	
	let po1 = await cdb_result(client_resourceQuery);
	po1.forEach(function(dataset, index) {
		client_dict[String(index+1)] = client_dict[String(index+1)] + dataset['crcll'];
	});

	var items = Object.keys(client_dict).map(function(key) {
		return [key, client_dict[key]];
	});
	items.sort(function(first, second) {
		return second[1] - first[1];
	});

	let return_index = []; let return_val = [];
	items.forEach(function(dataset, index) {
		return_index.push(dataset[0]);
		return_val.push((dataset[1].toFixed(4)));
	});

	return [return_index.slice(0,10), return_val.slice(0,10)]
}

// class_data
let round_datasize = `select datasize from LearningRound where round = (select round from AggregationTime ORDER BY round desc LIMIT 1)`;
let round_classsize = `select classsize from LearningRound LIMIT 1`;
async function get_class_data() {
	let ro_data = await cdb_result(round_datasize);
	let cl_data = await cdb_result(round_classsize);
	let res_list = [];
	cl_data.forEach(function(dataset, index) {
		let classsize_list = dataset['classsize'].split(',');
		for(var i = 0; i < classsize_list.length; i++) {
			res_list.push([classsize_list[i], 0]);
		}
	});

	ro_data.forEach(function(dataset, index) {
		let datasize_list = dataset['datasize'].split(',');
		for(var i = 0; i < datasize_list.length; i++) {
			if(datasize_list[i] != "0") {
				res_list[i][1] += 1;
			}
		}
	});

	return res_list
}

let predictionQuery = `SELECT round, max(prediction) AS predictions FROM Predictions GROUP BY round;`;
async function get_predictions() {
	let pre_data = await cdb_result(predictionQuery);
	let pre_list = []; let pre_round = [];
	pre_data.forEach(function(dataset, index) {
		pre_list.push(dataset['predictions']);
		pre_round.push(dataset['round']);
	});

	return [pre_list, pre_round]
}

let class_dataQuery = `select classsize from LearningRound LIMIT 1`;
let oneroundQuery = `SELECT round FROM LearningRound ORDER BY round desc LIMIT 1`;
let curround_avg_acc = `SELECT (SUM(accuracy)/COUNT(accuracy)) AS avg_acc FROM LearningTrain GROUP BY round ORDER BY round desc LIMIT 1`;
app.get('/FLDashboard', async(req, res) => {
	let abd_data = await accuracy_boxplot_data();
	let re_data = await class_entropy();
	let ci_data = await class_information();

	let loss_tloss_data = await loss_lineplot_data();

	let re_data_for_cs = await class_entropy_for_cs();

	let ttc = await training_time_chart();
	let utc = await upload_time_chart();
	let stl = await dis_agg_time();

	let cr_data = await cpu_ram_monitoring();
	let cl_data = await cdb_result(class_dataQuery);
	cl_data = cl_data[0]['classsize'].split(',');

	let cci_data = await round_client();
	let curr_data = await cdb_result(oneroundQuery);
	let curr_avg_acc = await cdb_result(curround_avg_acc);

	let round_min_entropy = re_data[String(curr_data[0]['round'])].indexOf(Math.min.apply(null, re_data[String(curr_data[0]['round'])]), 0);
	let agg_time = 0;
	if(stl[0][parseInt(curr_data[0]['round'])-1] != undefined) {
		agg_time = stl[0][parseInt(curr_data[0]['round'])-1];
	}
	let round_ltime = ttc[parseInt(curr_data[0]['round'])-1] + utc[0][parseInt(curr_data[0]['round'])-1] + agg_time + stl[1][parseInt(curr_data[0]['round'])-1];
	
	let round_cpu = cr_data[1][parseInt(curr_data[0]['round'])-1];

	let ranking = await clientranking();

	let gc_data = await get_class_data();

	let pred_data = await get_predictions();

	res.render('dashboard', {abdData_box: abd_data[0], abdData_out: abd_data[1], lbdData_box: abd_data[2], lbdData_out: abd_data[3], reData: JSON.stringify(re_data), rmin_entropy: round_min_entropy, reDataForcs: JSON.stringify(re_data_for_cs), ciData: JSON.stringify(ci_data), ttc: JSON.stringify(ttc), utc: JSON.stringify(utc), stl: JSON.stringify(stl), cr_round: cr_data[0], cr_cpu: JSON.stringify(cr_data[1]), cr_ram: JSON.stringify(cr_data[2]), class_data: cl_data, cci_round: cci_data[0], cci_client: JSON.stringify(cci_data[1]), curr: curr_data[0]['round'], curracc: Math.round((parseFloat(curr_avg_acc[0]['avg_acc']*100)+Number.EPSILON)*100)/100, rltime: Math.round(parseFloat(round_ltime)+Number.EPSILON)*100/100, rcpu: Math.round(parseFloat(round_cpu)+Number.EPSILON)*100/100, rank_index: ranking[0], rank_val: ranking[1], gcdata: JSON.stringify(gc_data), ld: JSON.stringify(loss_tloss_data[0]), tld: JSON.stringify(loss_tloss_data[1]), acq: JSON.stringify(loss_tloss_data[2]), prdata: JSON.stringify(pred_data[0]), prrounddata: JSON.stringify(pred_data[1])});
});



// api code
app.get('/new_client', (req, res) => {
	return res.join(success);
});

app.get('/train_done', (req, res) => {
	return res.join(success);
});

let success = [
	{
		'success': 1
	}
]

app.listen(5006);
