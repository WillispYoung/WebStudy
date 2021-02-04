import copy
import json
import math
import itertools
from matplotlib import pyplot
from sklearn import linear_model

import numpy
import pandas
import statsmodels.formula.api as formula


def mean(array):
    return sum(array) / len(array)


# This equals to the R-Squared value of a linear regression.
def explainable_variance(origin, prediction):
    m1 = mean(origin)
    m2 = mean(prediction)
    var1 = sum([(v-m1)**2 for v in origin])
    var2 = sum([(v-m2)**2 for v in prediction])
    return var2 / var1


# Predictor data form: [[list for variable X1], [list for variable X2], ...]
# Criterion data form: [y1, y2, ... , yn]
# A fitting equation is explainable, only when all the variables have (1) positive coefficients
# and (2) p-values that are smaller than 0.05; the significance of an equation is characterized by
# r-squared value (the greater the better) and condition number (the smaller the better).
def OLS(y, x1, x2, x3, x4, x5, x6):
    data_frame = pandas.DataFrame({'Y': y, 'X1': x1, 'X2': x2, 'X3': x3, 'X4': x4, 'X5': x5, 'X6': x6})
    # result = formula.ols(formula='Y ~ X1 + X2 + X6', data=data_frame).fit()
    # print(result.summary())
    # print(list(result.params))
    # print(result.summary().tables[0].as_csv())
    # print(result.summary().tables[1].as_csv())
    # print(result.summary().tables[2].as_csv())
    # https://www.statsmodels.org/devel/generated/statsmodels.regression.linear_model.RegressionResults.html
    # print(result.condition_number, result.rsquared, list(result.pvalues), list(result.tvalues))

    variables = ['X1', 'X2', 'X3', 'X4', 'X5', 'X6']
    combinations = []
    for i in range(len(variables)-1):
        subset = itertools.combinations(variables, i+1)
        for vs in subset:
            combinations.append(list(vs))

    overall_results = []
    for vc in combinations:
        rightside_formula = ''
        for i in range(len(vc)):
            if i > 0:
                rightside_formula = rightside_formula + ' + '
            rightside_formula = rightside_formula + vc[i]
        result = formula.ols(formula='Y ~ ' + rightside_formula, data=data_frame).fit()
        overall_results.append([vc, list(result.params), list(result.pvalues), result.rsquared, result.condition_number])
    
    def equation_filter(res):
        for i in range(1, len(res[1])):
            if res[1][i] < 0:
                return False
        for i in range(1, len(res[2])):
            if res[2][i] > 0.05:
                return False
        return True

    explainable_equations = list(filter(equation_filter, overall_results))
    explainable_equations.sort(key=lambda l: l[3], reverse=True)      # sort by r-squared value.

    for ee in explainable_equations:
        print(ee)


# Predictor data form: [[x11, x21, x31, ...], ... , [x1n, x2n, x3n, ...]]
# Criterion data form: [y1, y2, ... , yn]
def linear_regression_remove_10_percent_outliers(predictors, criterion):
    lr = linear_model.LinearRegression()
    lr.fit(predictors, criterion)
    output = lr.predict(predictors)

    residual = [(abs(criterion[i] - output[i]), i) for i in range(len(output))]
    residual.sort(key=lambda v: v[0])
    # remove 10% data points with highest residual
    residual = residual[:int(len(residual) * 0.9)]

    predictors_ = [predictors[v[1]] for v in residual]
    criterion_ = [criterion[v[1]] for v in residual]

    x1 = [v[0] for v in predictors_]
    x2 = [v[1] for v in predictors_]
    x3 = [v[2] for v in predictors_]
    x4 = [v[3] for v in predictors_]
    x5 = [v[4] for v in predictors_]
    x6 = [v[5] for v in predictors_]

    OLS(criterion_, x1, x2, x3, x4, x5, x6)


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


# TODO
# 1. max or sum of top-5? [DONE]
# 2. compute r-value for LR. [DONE]
# 3. understand values. [DONE]
def separated_nonlinear_fitting():
    numerical_data = json.loads(open('data-trace.json', 'r').read())['data']

    image = []
    text = []
    char = []
    ilc = []
    ult = []        # UpdateLayoutTree.
    layout = []

    for item in numerical_data:
        if len(item['tds']) > 0:
            ilc.append(item['ilc'])
            image.append(item['image'])
            text.append(item['text'])
            char.append(item['char'])
            list_ult = []
            list_layout = []
            for arr in item['tds']:
                list_ult.append(arr[4] / 1000)
                list_layout.append(arr[5] / 1000)
            list_ult.sort(reverse=True)
            list_layout.sort(reverse=True)
            ult.append(sum(list_ult[:10]))
            layout.append(sum(list_layout[:10]))

    ilc_log = [math.log(v) for v in ilc]
    ilc_nlogn = [v * math.log(v) for v in ilc]

    predictors = [[ilc[i], ilc_log[i], ilc_nlogn[i], image[i], text[i], char[i]]
                  for i in range(len(ilc))]
    
    layout_sum = [ult[i] + layout[i] for i in range(len(ult))]
    linear_regression_remove_10_percent_outliers(predictors, layout_sum)
    # linear_regression_remove_10_percent_outliers(predictors, layout)


def statistics():
    raw_data = json.loads(open('data-trace.json', 'r').read())['data']
    js = []
    layout = []
    pipeline = []
    render_delay = []
    for entry in raw_data:
        entry_js = []
        entry_layout = []
        entry_pipeline = []
        rd = 0
        for arr in entry['tds']:
            entry_js.append(arr[2] + arr[3])
            entry_layout.append(arr[4] + arr[5])
            entry_pipeline.append(sum(arr[4:]))
            rd += sum(arr)
        js.append(int(sum(entry_js)/1000))
        layout.append(int(sum(entry_layout)/1000))
        pipeline.append(int(sum(entry_pipeline)/1000))
        render_delay.append(int(rd/1000))

    length = len(raw_data)
    rev_count = 0
    layout_percentage = []
    js_percentage_ = []
    layout_percentage_ = []
    pipeline_percentage_ = []
    for i in range(length):
        layout_percentage.append(layout[i] / pipeline[i] if pipeline[i] > 0 else 0)
        js_percentage_.append(js[i] / render_delay[i] if render_delay[i] > 0 else 0)
        layout_percentage_.append(layout[i] / render_delay[i] if render_delay[i] > 0 else 0)
        pipeline_percentage_.append(pipeline[i] / render_delay[i] if render_delay[i] > 0 else 0)
        if js[i] <= pipeline[i]:
            rev_count += 1
    
    print('Cases when pipeline > JS:', rev_count , '/', length, ',', rev_count / length)

    js.sort()
    pipeline.sort()
    layout_percentage.sort()
    layout_percentage_.sort()
    pipeline_percentage_.sort()

    print('JavaScript maximum:', max(js), ',90 percentile:', js[int(length*0.9)], ', median:', js[int(length/2)], ', avg:', numpy.mean(js))
    print('Pipeline maximum:', max(pipeline), ',90 percentile:', pipeline[int(length*0.9)], ', median:', pipeline[int(length/2)], ', avg:', numpy.mean(pipeline))
    print('Layout percentage maximum:', max(layout_percentage), ', median:', layout_percentage[int(length/2)], ', avg:', numpy.mean(layout_percentage))
    print('JS percentage in RD: AVG:', numpy.mean(js_percentage_), ', median:', js_percentage_[int(length/2)])
    print('Layout percentage in RD: AVG:', numpy.mean(layout_percentage_), ', median:', layout_percentage_[int(length/2)])
    print('Pipeline percentage in RD: AVG:', numpy.mean(pipeline_percentage_), ', median:', pipeline_percentage_[int(length/2)])

separated_nonlinear_fitting()
# statistics()
