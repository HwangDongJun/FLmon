var oneround = document.getElementById("curr").value;
oneround = String(parseInt(oneround) + 1);

var entropy_data = document.getElementById("re_data_for_cs").value;
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

let min_curr_entropy = 9999; let cd_class = -1;
for(var ie in Object.keys(class_dataDict)) {
	let cr_round = parseInt(oneround)-2;
	if(class_dataDict[ie][cr_round] < min_curr_entropy) {
		min_curr_entropy = class_dataDict[ie][cr_round];
		cd_class = ie;
	}
}
let min_curr_entropy2 = 9999; let cd_class2 = -1;
for(var ie in Object.keys(class_dataDict)) {
	let cr_round = parseInt(oneround)-2;
	if(class_dataDict[ie][cr_round] > min_curr_entropy && class_dataDict[ie][cr_round] < min_curr_entropy2) {
		min_curr_entropy2 = class_dataDict[ie][cr_round];
		cd_class2 = ie;
	}
}


function writeFile(fileName, content) {
	var blob = new Blob([content], { type: 'text/plain' });
    objURL = window.URL.createObjectURL(blob);

    // 이전에 생성된 메모리 해제
    if (window.__Xr_objURL_forCreatingFile__) {
        window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
    }
    window.__Xr_objURL_forCreatingFile__ = objURL;

    var a = document.createElement('a');
    a.download = fileName;
    a.href = objURL;
    a.click();
}

function _submit(f) {
	var cs_dict = {"loss": 0, "entropy": 0, "dataclass": "", "time": 0, "prediction": 0, "sel_class": "", "prediction_baseline": "", "multicriteria": ""};
	var obj_length = document.getElementsByName('dashboardcriterion').length;

	for(var i = 0; i < obj_length; i++) {
		if(document.getElementsByName('dashboardcriterion')[i].checked == true) {
			if(document.getElementsByName('dashboardcriterion')[i].value == 'overfitting') {
				cs_dict['loss'] = 1;

				let accuracy_class_data = document.getElementsByName('accuracy_class')[0].value;
				cs_dict['sel_class'] += accuracy_class_data;
			}
			if(document.getElementsByName('dashboardcriterion')[i].value == 'hete') {
				cs_dict['entropy'] = 1;
				cs_dict['dataclass'] += String(cd_class) + ",";
				cs_dict['dataclass'] += String(cd_class2);
			}
			if(document.getElementsByName('dashboardcriterion')[i].value == 'time') {
				cs_dict['time'] = 1;
			}
			if(document.getElementsByName('dashboardcriterion')[i].value == 'abnormal') {
				cs_dict['prediction'] = 1;
			}

			let accuracy_class_data = document.getElementsByName('accuracy_class')[0].value;
			cs_dict['sel_class'] += accuracy_class_data;
			let overload_baseline = document.getElementsByName('predicition_text')[0].value;
			cs_dict['prediction_baseline'] = overload_baseline;
		}
	}

	if(cs_dict['loss'] == 1 && cs_dict['entropy'] == 1) {
		cs_dict['multicriteria'] += "loss,entropy,";
	} else if(cs_dict['loss'] == 1 && cs_dict['time'] == 1) {
		cs_dict['multicriteria'] += "loss,time,";
	} else if(cs_dict['loss'] == 1 && cs_dict['abnormal'] == 1) {
		cs_dict['multicriteria'] += "loss,abnormal,";
	} else if(cs_dict['entropy'] == 1 && cs_dict['time'] == 1) {
		cs_dict['multicriteria'] += "entropy,time,";
	} else if(cs_dict['entropy'] == 1 && cs_dict['abnormal'] == 1) {
		cs_dict['multicriteria'] += "entropy,abnormal,";
	} else if(cs_dict['time'] == 1 && cs_dict['abnormal'] == 1) {
		cs_dict['multicriteria'] += "time,abnormal,";
	}


	writeFile("check_list_" + oneround + ".txt", JSON.stringify(cs_dict));
}
