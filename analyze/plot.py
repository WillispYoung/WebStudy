import json
import math
from matplotlib import pyplot
from sklearn import linear_model


def plot_ilc_to_ltd():
    numerical_data = json.loads(open('data2.json', 'r').read())['data']
    ilc = []
    ltd = []
    for item in numerical_data:
        ilc.append(item['ilc'])
        layout_ = []
        for entry in item['tds']:
            layout_.append((entry[4] + entry[5])/1000)
        layout_.sort(reverse=True)
        ltd.append(sum(layout_[:5]))
    
    pyplot.subplot(241)
    pyplot.hist(ilc, bins=30)
    pyplot.title('Distribution of In-Layout Node Quantity')

    pyplot.subplot(242)
    pyplot.hist(ltd, bins=30)
    pyplot.title('Distribution of Layout Task Duration')

    pyplot.subplot(243)
    pyplot.scatter(ilc, ltd, s=1)
    pyplot.title('Scatter Plot between ILC and LTD')

    ilc_log = [math.log(v) for v in ilc]
    pyplot.subplot(244)
    pyplot.scatter(ilc_log, ltd, s=1)
    pyplot.title('Log(ILC) - LTD')

    ilc_nlogn = [math.log(v) * v for v in ilc]
    pyplot.subplot(245)
    pyplot.scatter(ilc_nlogn, ltd, s=1)
    pyplot.title('ILC*Log(ILC) - LTD')

    ilc_log3 = [math.log(v)**3 for v in ilc]
    pyplot.subplot(246)
    pyplot.scatter(ilc_log3, ltd, s=1)
    pyplot.title(r'$Log(ILC)^3$ - LTD')

    

    pyplot.show()

plot_ilc_to_ltd()
