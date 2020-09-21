import json
from sklearn import linear_model
from matplotlib import pyplot


raw_data = json.loads(open('res.json', 'r').read())['finalResult']

tag = ['latency', 'bandwidth', 'nodeCount', 'imageCount',
       'textCount', 'cssCount', 'cssRuleCount', 'usedCssCount']

predictor = []
criterion = []

for entry in raw_data:
    v = []
    for i in range(len(tag)):
        v.append(entry[tag[i]])
    predictor.append(v)
    criterion.append(sum(entry['top5Layout']))

lr = linear_model.LinearRegression()
lr.fit(predictor, criterion)

coef = lr.coef_
for i in range(len(tag)):
    print('{} {:.4f}'.format(tag[i], coef[i]))

predicted = lr.predict(predictor)
deviation = [criterion[i] - predicted[i] for i in range(len(criterion))]

pyplot.hist(deviation, bins=100)
pyplot.show()
