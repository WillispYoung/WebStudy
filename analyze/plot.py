import copy
import json
import math
from matplotlib import pyplot
from sklearn import linear_model


def mean(array):
    return sum(array) / len(array)


def explainable_variance(origin, prediction):
    m1 = mean(origin)
    m2 = mean(prediction)
    var1 = sum([(v-m1)**2 for v in origin])
    var2 = sum([(v-m2)**2 for v in prediction])
    return var2 / var1


def plot_ilc_to_ltd():
    numerical_data = json.loads(open('data-trace.json', 'r').read())['data']
    ilc = []
    ltd = []
    for item in numerical_data:
        ilc.append(item['ilc'])
        layout_ = []
        for entry in item['tds']:
            layout_.append((entry[4] + entry[5])/1000)
        layout_.sort(reverse=True)
        ltd.append(sum(layout_[:5]))

    # ilc_sq = [v**2 for v in ilc]
    ilc_log = [math.log(v) for v in ilc]
    # ilc_log2 = [math.log(v)**2 for v in ilc]
    ilc_log3 = [math.log(v)**3 for v in ilc]
    ilc_nlogn = [math.log(v) * v for v in ilc]

    # Plot data distribution.
    pyplot.subplot(241)
    pyplot.hist(ilc, bins=40)
    pyplot.title('In-Layout Node Quantity')

    pyplot.subplot(242)
    pyplot.hist(ilc_log, bins=40)
    pyplot.title('Log(ILC)')

    pyplot.subplot(243)
    pyplot.hist(ilc_nlogn, bins=40)
    pyplot.title('nlogn for ILC')

    pyplot.subplot(244)
    pyplot.hist(ilc_log3, bins=40)
    pyplot.title(r'$Log(ILC)^3$')

    pyplot.subplot(245)
    pyplot.scatter(ilc, ltd, s=1)
    pyplot.title('ILC - LTD')

    pyplot.subplot(246)
    pyplot.scatter(ilc_log, ltd, s=1)
    pyplot.title('Log(ILC) - LTD')

    pyplot.subplot(247)
    pyplot.scatter(ilc_nlogn, ltd, s=1)
    pyplot.title('ILC*Log(ILC) - LTD')

    pyplot.subplot(248)
    pyplot.scatter(ilc_log3, ltd, s=1)
    pyplot.title(r'$Log(ILC)^3$ - LTD')

    pyplot.show()

    # Non-linear regression.
    predictors = [[ilc[i], ilc_log[i], ilc_nlogn[i]] for i in range(len(ilc))]
    lr = linear_model.LinearRegression()
    lr.fit(predictors, ltd)
    ltd_pre = [lr.predict([v])[0] for v in predictors]

    residual = [[abs(ltd_pre[i] - ltd[i]), i] for i in range(len(ilc))]
    residual.sort(key=lambda v: v[0])
    # remove 10% data points with highest residual
    residual = residual[:int(len(residual) * 0.9)]

    predictors_re = [predictors[v[1]] for v in residual]
    ltd_re = [ltd[v[1]] for v in residual]
    lr.fit(predictors_re, ltd_re)
    ltd_re_pre = [lr.predict([v])[0] for v in predictors_re]

    # Explainable Variance: 0.7582616998205116
    print('Explainable Variance:', explainable_variance(ltd_re, ltd_re_pre))

    # Coefficient: [ 0.42389409 21.72108819 -0.03950713]
    print('Coefficient:', lr.coef_)

    # Intercept: -8.918462665730544 
    print('Intercept:', lr.intercept_)

plot_ilc_to_ltd()
