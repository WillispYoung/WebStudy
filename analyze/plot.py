import copy
import json
import math
from matplotlib import pyplot
from sklearn import linear_model

import pandas
import statsmodels.formula.api as formula

def mean(array):
    return sum(array) / len(array)


# R-Squared value for linear regression.
def explainable_variance(origin, prediction):
    m1 = mean(origin)
    m2 = mean(prediction)
    var1 = sum([(v-m1)**2 for v in origin])
    var2 = sum([(v-m2)**2 for v in prediction])
    return var2 / var1


# Predictor data form: [[x11, x12, ... , x1n], [x21, x22, ... , x2n], ...]
# Criterion data form: [y1, y2, ... , yn]
def OLS(y, x1, x2):
    data_frame = pandas.DataFrame({'Y': y, 'X1': x1, 'X2': x2})
    result = formula.ols(formula='Y ~ X1 + X2', data=data_frame).fit()
    print(result.summary())


# Predictor data form: [[x11, x21, x31, ...], ... , [x1n, x2n, x3n, ...]]
# Criterion data form: [y1, y2, ... , yn]
def lr_remove_10percent_outliers(predictors, criterion):
    lr = linear_model.LinearRegression()
    lr.fit(predictors, criterion)
    output = [lr.predict([v])[0] for v in predictors]

    residual = [(abs(criterion[i] - output[i]), i)
                for i in range(len(criterion))]
    residual.sort(key=lambda v: v[0])
    # remove 10% data points with highest residual
    residual = residual[:int(len(residual) * 0.9)]

    predictors_ = [predictors[v[1]] for v in residual]
    criterion_ = [criterion[v[1]] for v in residual]
    lr.fit(predictors_, criterion_)
    output_ = [lr.predict([v])[0] for v in predictors_]

    print('Explainable Variance:', explainable_variance(criterion_, output_))


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

    # ilc_n2 = [v**2 for v in ilc]
    ilc_log = [math.log(v) for v in ilc]
    # ilc_log2 = [math.log(v)**2 for v in ilc]
    ilc_log3 = [math.log(v)**3 for v in ilc]
    ilc_nlogn = [v * math.log(v) for v in ilc]
    # ilc_nlogn2 = [v * math.log(v)**2 for v in ilc]
    # ilc_n2logn = [v**2 * math.log(v) for v in ilc]
    # ilc_n2logn2 = [v**2 * math.log(v)**2 for v in ilc]

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
    predictors = [[ilc_log[i], ilc_nlogn[i]] for i in range(len(ilc))]
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


# TODO
# 1. max or sum of top-5?
# 2. compute r-value for LR.
# 3. understand values.
def separated_nonlinear_fitting():
    numerical_data = json.loads(open('data-trace.json', 'r').read())['data']
    ilc = []
    ult = []        # UpdateLayoutTree.
    layout = []
    for item in numerical_data:
        if len(item['tds']) > 0:
            ilc.append(item['ilc'])
            list_ult = []
            list_layout = []
            for arr in item['tds']:
                list_ult.append(arr[4] / 1000)
                list_layout.append(arr[5] / 1000)
            ult.append(max(list_ult))
            layout.append(max(list_layout))

    ilc_log = [math.log(v) for v in ilc]
    ilc_nlogn = [v * math.log(v) for v in ilc]

    pyplot.subplot(241)
    pyplot.scatter(ilc, ult, s=1)
    pyplot.title('n-ULT')

    pyplot.subplot(242)
    pyplot.scatter(ilc_log, ult, s=1)
    pyplot.title('log(n)-ULT')

    pyplot.subplot(243)
    pyplot.scatter(ilc_nlogn, ult, s=1)
    pyplot.title('nlog(n)-ULT')

    pyplot.subplot(244)
    pyplot.scatter(ilc, layout, s=1)
    pyplot.title('n-Layout')

    pyplot.subplot(245)
    pyplot.scatter(ilc_log, layout, s=1)
    pyplot.title('log(n)-Layout')

    pyplot.subplot(246)
    pyplot.scatter(ilc_nlogn, layout, s=1)
    pyplot.title('nlog(n)-Layout')

    pyplot.show()

    # predictors = [[ilc[i], ilc_log[i], ilc_nlogn[i]] for i in range(len(ilc))]
    # lr_remove_10percent_outliers(predictors, ult)
    # lr_remove_10percent_outliers(predictors, layout)
    test(ult, ilc, ilc_log)

separated_nonlinear_fitting()
