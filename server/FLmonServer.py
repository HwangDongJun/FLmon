from os import spawnl
import grpc
import concurrent
from concurrent import futures

import time
import json
import math
import sqlite3
import argparse
import itertools

import FLmon_pb2
import FLmon_pb2_grpc

def accuracy_line_data():
    cur_learning.execute('''SELECT round, sum(loss)/count(loss) AS loss, sum(tloss)/count(tloss) AS tloss FROM LearningTrain GROUP BY round ORDER BY round ASC''')
    alq = cur_learning.fetchall()
    cur_learning.execute('''SELECT round, sum(accuracy)/count(accuracy) AS acc FROM LearningTrain GROUP BY round ORDER BY round ASC''')
    acq = cur_learning.fetchall()
    
    loss_list = list(); tloss_list = list()
    for al in alq:
        loss_list.append(al[1])
        tloss_list.append(al[2])
    
    acc_list = list()
    for ac in acq:
        acc_list.append(ac[1])

    return loss_list, tloss_list, acc_list

def func_round_client():
    cur_learning.execute('''SELECT round, (COUNT(clientid)) AS cci FROM LearningRound GROUP BY round''')
    crq = cur_learning.fetchall()
    round_str = ""; round_client_list = list()
    for cr in crq:
        round_str += str(cr[0]) + ","; 
        round_client_list.append(cr[1])

    return round_str, round_client_list

def class_entropy():
    cur_learning.execute('''SELECT * FROM LearningRound''')
    efd = cur_learning.fetchall()
    cur_learning.execute('''SELECT COUNT(round) AS cr FROM LearningRound''')
    alr = cur_learning.fetchall()[0][0]
    class_count = len(efd[0][3].split(','))

    round_entropy = dict()
    class_str_list = ["" for i in range(class_count)]
    round_datasize = [0 for i in range(class_count)]
    previous_round = '1'
    for index, ef in enumerate(efd):
        if previous_round != ef[0]:
            class_entropy = list()
            for ri in range(len(round_datasize)):
                entropy_value = 0; one_temp = class_str_list[ri].split(',')
                one_temp.pop()
                one_class_str = list(map(int, one_temp))
                for oi in range(len(one_class_str)):
                    per_value = one_class_str[oi]/round_datasize[ri]
                    if per_value != 0:
                        entropy_value += per_value * math.log(1/per_value)
                    else:
                        entropy_value += 0
                class_entropy.append(entropy_value)
            round_entropy[previous_round] = class_entropy

            class_str_list = ["" for i in range(class_count)]
            round_datasize = [0 for i in range(class_count)]
        
        ds = ef[2].split(',')
        for di in range(len(ds)):
            round_datasize[di] += int(ds[di])
            class_str_list[di] += str(ds[di]) + ","
        
        previous_round = ef[0]

        if index == alr-1:
            class_entropy = list()
            for ri in range(len(round_datasize)):
                entropy_value = 0; one_temp = class_str_list[ri].split(',')
                one_temp.pop()
                one_class_str = list(map(int, one_temp))
                for oi in range(len(one_class_str)):
                    per_value = one_class_str[oi]/round_datasize[ri]
                    if per_value != 0:
                        entropy_value += per_value * math.log(1/per_value)
                    else:
                        entropy_value += 0
                class_entropy.append(entropy_value)
            round_entropy[previous_round] = class_entropy
    
    return round_entropy

def class_time():
    # training time
    cur_learning.execute('''SELECT SUM(trainingtime) AS avg_tt FROM LearningTrain GROUP BY round''')
    trainingtimelist = cur_learning.fetchall()
    charttrainingtime = list()
    for ttl in trainingtimelist:
        charttrainingtime.append(ttl[0])
    
    # upload time
    cur_learning.execute('''SELECT round, (SUM(uploadendtime)-SUM(uploadstarttime)) AS uploadtime FROM LearningTime GROUP BY round''')
    uploadtimelist = cur_learning.fetchall()
    cur_learning.execute('''SELECT ((SUM(uploadendtime)-SUM(uploadstarttime))/COUNT(uploadstarttime)) AS avg_uploadtime FROM LearningTime''')
    avg_uploadtime = cur_learning.fetchall()

    chartuploadtimelist = list()
    for utl in uploadtimelist:
        chartuploadtimelist.append(utl[1])
    
    # distribution & aggregation time
    cur_learning.execute('''SELECT SUM(distributiontime) AS avg_dis FROM DistributionTime GROUP BY round''')
    dtq = cur_learning.fetchall()
    cur_learning.execute('''SELECT SUM(aggregationtime) AS aggre FROM AggregationTime GROUP BY round''')
    atq = cur_learning.fetchall()
    dtq_list = list(); atq_list = list()
    for dt in dtq:
        dtq_list.append(dt[0])
    for at in atq:
        atq_list.append(at[0])

    return charttrainingtime, chartuploadtimelist, avg_uploadtime, dtq_list, atq_list

def get_class_data():
    cur_learning.execute('''SELECT datasize FROM LearningRound WHERE round=(SELECT round FROM AggregationTime ORDER BY round desc LIMIT 1)''')
    ro_data = cur_learning.fetchall()
    cur_learning.execute('''SELECT classsize FROM LearningRound LIMIT 1''')
    cl_data = cur_learning.fetchall()
    res_list = list()
    for cd in cl_data:
        classsize_list = cd[0].split(',')
        for cli in range(len(classsize_list)):
            res_list.append([classsize_list[cli], 0])
    for rd in ro_data:
        datasize_list = rd[0].split(',')
        for dli in range(len(datasize_list)):
            res_list[dli][1] += 1

    return res_list

def get_predictions():
    cur_learning.execute('''SELECT round, max(prediction) AS predictions FROM Predictions GROUP BY round''')
    pre_data = cur_learning.fetchall()
    pre_list = list(); pre_round = list()
    for pd in pre_data:
        pre_list.append(pd[1])
        pre_round.append(pd[0])

    return pre_list, pre_round

def summary_data(rentropy, tra_time, upl_list, dtq_list, atq_list):
    # current round, accuracy
    cur_learning.execute('''SELECT round FROM LearningRound ORDER BY round desc LIMIT 1''')
    curr_data = cur_learning.fetchone()[0]
    cur_learning.execute('''SELECT (SUM(accuracy)/COUNT(accuracy)) AS avg_acc FROM LearningTrain GROUP BY round ORDER BY round desc LIMIT 1''')
    curr_avg_acc = cur_learning.fetchone()[0]
    # current low entropy
    round_min_entropy = rentropy[curr_data].index(min(rentropy[curr_data]))
    # time
    round_ltime = tra_time[curr_data-1] + upl_list[curr_data-1] + dtq_list[curr_data-1] + atq_list[curr_data-1]
    round_ltime = round(round_ltime, 1)
    # cpu
    rcpu = '0'

    return [curr_data, curr_avg_acc, round_min_entropy, round_ltime, rcpu]

def client_ranking():
    all_data = 0; client_dict = {'1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0,
                                 '7': 0, '8': 8, '9': 0, '10': 0}
    cur_learning.execute('''SELECT datasize FROM LearningRound WHERE round=1''')
    pa1 = cur_learning.fetchall()
    for pa in pa1:
        data_split = pa[0].split(',')
        for i, ds in enumerate(data_split):
            client_dict[str(i+1)] += int(ds)
            all_data += int(ds)
    for cdk in client_dict.keys():
        client_dict[cdk] = client_dict[cdk] / all_data
    cur_learning.execute('''SELECT (ca.sum/aa.sum) AS caaa
                            FROM
                            (SELECT SUM(accuracy) AS sum FROM LearningTrain GROUP BY clientid) AS ca,
                            (SELECT SUM(accuracy) AS sum FROM LearningTrain) AS aa''')
    pa2 = cur_learning.fetchall()
    for index, pa in enumerate(pa2):
        client_dict[str(index+1)] = client_dict[str(index+1)] + pa[0]
    cur_learning.execute('''SELECT (cl.sum/al.sum) AS clal
						    FROM
						    (SELECT SUM(loss) AS sum FROM LearningTrain GROUP BY clientid) AS cl,
						    (SELECT SUM(loss) AS sum FROM LearningTrain) AS al''')
    pa3 = cur_learning.fetchall()
    for index, pa in enumerate(pa3):
        client_dict[str(index+1)] = client_dict[str(index+1)] + pa[0]
    cur_learning.execute('''SELECT (trt.sum/tll.sum) AS trtll
							FROM
							(SELECT SUM(trainingtime) AS sum FROM LearningTrain GROUP BY clientid) AS trt,
							(SELECT SUM(trainingtime) AS sum FROM LearningTrain) AS tll''')
    let1 = cur_learning.fetchall()
    for index, le in enumerate(let1):
        client_dict[str(index+1)] = client_dict[str(index+1)] + le[0]
    cur_learning.execute('''SELECT (ult.sum/ull.sum) as ultll
							FROM
							(SELECT SUM(-uploadendtime+uploadstarttime) AS sum FROM LearningTime GROUP BY clientid) AS ult,
							(SELECT SUM(-uploadendtime+uploadstarttime) AS sum FROM LearningTime) AS ull''')
    let2 = cur_learning.fetchall()
    for index, le in enumerate(let2):
        client_dict[str(index+1)] = client_dict[str(index+1)] + le[0]
    cur_learning.execute('''SELECT (cr.sum/cll.sum) as crcll
							FROM
							(SELECT SUM(cpu) AS sum FROM CPURAMMonitoring GROUP BY clientid) AS cr,
							(SELECT SUM(cpu) AS sum FROM CPURAMMonitoring) AS cll''')
    po1 = cur_learning.fetchall()
    for index, po in enumerate(po1):
        client_dict[str(index+1)] = client_dict[str(index+1)] + le[0]

    res = sorted(client_dict.items(), key=(lambda x: x[1]), reverse=True)
    return_index = list(); return_val = list()
    for re in res:
        return_index.append(re[0])
        return_val.append(round(re[1], 4))

    return [return_index, return_val]

# global variable collection
data_q = delete_client_list = list()
for_loss_select_client = datasize_client = wrong_pred_client = set()
del_par_cli = 0

def client_selection(cur_round, cri, acloss=None, min_entropy=None, pretext=None):
    global data_q; global delete_client_list                                        # list
    global for_loss_select_client; global datasize_client; global wrong_pred_client # set
    global del_par_cli                                                              # int

    if cri == 0:
        if acloss != None:
            sel_class = ""
            if ',' in acloss:
                sel_class = acloss.split(',')
            else:
                sel_class = acloss
        
        select_client = set()
        cur_learning.execute('''SELECT SUM(loss)/COUNT(loss) FROM LearningTrain WHERE round=? GROUP BY round''', (curr_oneround-1,))
        avg_loss = cur_learning.fetchone()[0]
        cur_learning.execute('''SELECT clientid FROM LearningTrain WHERE round=? and loss >= ? ORDER BY loss desc''', (curr_oneround-1, avg_loss,))
        for row in cur_learning:
            client_id = row[0]
            for_loss_select_client.add(client_id)
            
        temp_for_loss_select_client = for_loss_select_client
        for dcl in temp_for_loss_select_client:
            cur_learning.execute('''SELECT datasize FROM LearningRound WHERE round=? and clientid=?''', (curr_oneround-1,dcl,))
            data_list = cur_learning.fetchone()[0].split(',')
            for sc in sel_class:
                if data_list[int(sc)] != "0":
                    for_loss_select_client.discard(dcl)
        if len(for_loss_select_client) >= 2:
            for_loss_select_client = set(itertools.islice(for_loss_select_client, 2))
    elif cri == 1:
        if acloss != None:
            sel_class = ""
            if ',' in acloss:
                sel_class = acloss.split(',')
            else:
                sel_class = acloss
    
        class_data_list = min_entropy.split(',')
        cur_learning.execute('''SELECT clientid, datasize FROM LearningRound WHERE round=?''', (curr_oneround-1,))
        for row in cur_learning:
            client_id = row[0]
            client_data = row[1].split(',')		
            for cdl in class_data_list:
                if client_data[int(cdl)] == "0":
                    datasize_client.add(client_id)
                    
        temp_datasize_client = datasize_client
        for dcl in temp_datasize_client:
            cur_learning.execute('''SELECT datasize FROM LearningRound WHERE round=? and clientid=?''', (curr_oneround-1,dcl,))
            data_list = cur_learning.fetchone()[0].split(',')
            for sc in sel_class:
                if data_list[int(sc)] != "0":
                    datasize_client.discard(dcl)
        if len(datasize_client) >= 2:
            datasize_client = set(itertools.islice(datasize_client, 2))
    elif cri == 2:
        total_start_cs_time = time.time()
        total_cs_time = 0; s_list = list()
        tsd = 0; tsdk = 0; tkul = 0; tkud = 0; seta = 0; taa = 0; temp_cs_time = 0
        del_par_cli += 1
        
        cur_learning.execute('''SELECT clientid FROM LearningRound WHERE round=?''', (cur_round-1,))
        data_q = cur_learning.fetchall()
        
        s_time_dict = dict()
        cs_time = time.time()
        tround = 2000
        for dq in data_q:
            clid = dq[0]
            cur_learning.execute('''SELECT uploadendtime-uploadstarttime AS sdis FROM LearningTime WHERE round=? and clientid=?''', (cur_round-1, clid,))
            tkul = cur_learning.fetchone()[0]
            cur_learning.execute('''SELECT trainingtime AS traint FROM LearningTrain WHERE round=? and clientid=?''', (cur_round-1, clid,))
            tkud = cur_learning.fetchone()[0]
            seta_t = seta + tkul + max(0, tkud - seta)
            
            for s in s_list:
                cur_learning.execute('''SELECT distributiontime AS sdis FROM DistributionTime WHERE round=? and clientid=?''', (cur_round-1, s,))
                tsd += cur_learning.fetchone()[0]
            cur_learning.execute('''SELECT distributiontime AS sdis FROM DistributionTime WHERE round=? and clientid=?''', (cur_round-1, clid,))
            tsdk = tsd + cur_learning.fetchone()[0]
            cur_learning.execute('''SELECT aggregationtime AS sdis FROM AggregationTime WHERE round=?''', (cur_round-1,))
            taa = cur_learning.fetchone()[0]
            t = temp_cs_time + tsdk + seta_t + taa
            
            print(f"[clid]: {clid} -- [seta]: {seta}, [t]: {t}, [tround]: {tround}, [temp_cs_time]: {temp_cs_time}")
            
            if t < tround:
                seta = seta_t
                s_list.append(clid)
            else:
                s_time_dict[clid] = t
            temp_cs_time = time.time() - cs_time
        total_cs_time = time.time() - total_start_cs_time
    elif cri == 3:
        input_pred = pretext.split(',')
        pred_baseline = float(input_pred[0])
        pred_round = int(input_pred[1])
        
        cur_learning.execute('''SELECT clientid FROM Predictions WHERE prediction>=? and round=? ORDER BY prediction DESC''', (pred_baseline, pred_round,))
        for row in cur_learning:
            wrong_pred_client.add(row[0])
            
        if len(wrong_pred_client) >= 2:
            wrong_pred_client = set(itertools.islice(wrong_pred_client, 2))

    if len(select_client) != 0:
        delete_client_list = list(select_client)
    elif len(for_loss_select_client) != 0:
        delete_client_list = list(for_loss_select_client)
        for_loss_select_client = set()
    elif len(datasize_client) != 0:
        delete_client_list = list(datasize_client)
        datasize_client = set()
    elif len(wrong_pred_client) != 0:
        delete_client_list = list(wrong_pred_client)
        wrong_pred_client = set()
    elif len(s_list) != 0:
        for row in cur_index.execute('''SELECT id FROM ClientID'''):
            clid = row[0]
            if clid not in list(set(s_list)):
                delete_client_list.append(clid)
        s_list = list()

        if len(delete_client_list) > 2:
            sort_s_time_dict = sorted(s_time_dict.items(), reverse=True, key=lambda item: item[1])
            delete_client_list = list()
            delete_client_list.append(sort_s_time_dict[0][0])
            delete_client_list.append(sort_s_time_dict[1][0])

    return delete_client_list

class FLmonServicer(FLmon_pb2_grpc.FLmonServicer):
    def transportFLmon(self, request, context):
        response = FLmon_pb2.FLmonResponse()

        if request.type == 1: # Monitoring
            print(f"we got request: {request.type}")
            # get performance data
            testloss, trainloss, accuracy = accuracy_line_data()
            round_str, round_client = func_round_client()
            round_entropy = class_entropy()
            tra_time, upl_list, avg_uploadtime, dtq_list, atq_list = class_time()
            class_data_list = get_class_data()
            predictions = get_predictions()
            summary_list = summary_data(round_entropy, tra_time, upl_list, dtq_list, atq_list)
            ranking_list = client_ranking()
            # configuration = dict()
            # configuration['accuracy'] = json.dumps(accuracy)
            # configuration['testloss'] =  json.dumps(testloss)
            # configuration['trainloss'] = json.dumps(trainloss)
            # configuration['round'] = round_str
            # configuration['clientcount'] = json.dumps(round_client)
            # configuration['entropy'] = json.dumps(round_entropy)
            # configuration['trainingtime'] = json.dumps(tra_time)
            # configuration['uploadtime'] = json.dumps(upl_list)
            # configuration['distributiontime'] = json.dumps(dtq_list)
            # configuration['aggregationtime'] = json.dumps(atq_list)
            # configuration['classdata'] = json.dumps(class_data_list)
            # configuration['prediction'] = json.dumps(predictions)
            # configuration = list()
            # configuration.append(json.dumps(accuracy))
            # configuration.append(json.dumps(testloss))
            # configuration.append(json.dumps(trainloss))
            # configuration.append(json.dumps(round_str))
            # configuration.append(json.dumps(round_client))
            # configuration.append(json.dumps(round_entropy))
            # configuration.append(json.dumps(tra_time))
            # configuration.append(json.dumps(upl_list))
            # configuration.append(json.dumps(dtq_list))
            # configuration.append(json.dumps(atq_list))
            # configuration.append(json.dumps(class_data_list))
            # configuration.append(json.dumps(predictions))

            response.acc = json.dumps(accuracy)
            response.tel = json.dumps(testloss)
            response.trl = json.dumps(trainloss)
            response.rou = round_str
            response.clc = json.dumps(round_client)
            response.ent = json.dumps(round_entropy)
            response.trt = json.dumps(tra_time)
            response.upt = json.dumps(upl_list)
            response.dit = json.dumps(dtq_list)
            response.agt = json.dumps(atq_list)
            response.cld = json.dumps(class_data_list)
            response.pre = json.dumps(predictions)
            response.sul = json.dumps(summary_list)
            response.crl = json.dumps(ranking_list)
        else: # management
            print(f"we got request: {request.type}")
            # current round
            cur_learning.execute('''SELECT round FROM LearningTrain ORDER BY round DESC LIMIT 1''')
            cur_round = cur_learning.fetchone()[0]

            res_client_selection = list()
            if request.cri == 0:
                res_client_selection = client_selection(cur_round=cur_round, cri=request.cri, acloss=request.acc_loss)
            elif request.cri == 1:
                info_entropy = class_entropy()
                min_one = min(info_entropy); info_entropy.remove(min_one)
                min_two = min(info_entropy); info_entropy.remove(min_two)

                res_client_selection = client_selection(cur_round=cur_round, cri=request.cri, acloss=request.acc_loss, min_entropy=f"{min_one},{min_two}")
            elif request.cri == 2:
                res_client_selection = client_selection(cur_round=cur_round, cri=request.cri)
            elif request.cri == 3:
                res_client_selection = client_selection(cur_round=cur_round, cri=request.cri, pretext=request.rou_pred)

            cur_learning.execute('''INSERT INTO SelectionClient VALUES (?, ?)''', (cur_round, ','.join(res_client_selection),))
            conn_learning.commit()

        return response

def main():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    FLmon_pb2_grpc.add_FLmonServicer_to_server(FLmonServicer(), server)
    print('Server Started. Listening on port 50051')
    server.add_insecure_port('[::]:50051')
    server.start()
    server.wait_for_termination()

parser = argparse.ArgumentParser(description='Database Path.')
parser.add_argument('--index', type=str, action='store_true', required=True, help='index database path.')
parser.add_argument('--learning', type=str, action='store_true', required=True, help='learning database path.')
flag = parser.parse_args()

conn_index = sqlite3.connect(flag.index, check_same_thread=False)
cur_index = conn_index.cursor()
conn_learning = sqlite3.connect(flag.learning, check_same_thread=False)
cur_learning = conn_learning.cursor()

main()