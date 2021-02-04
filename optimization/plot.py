import copy
import json
import numpy
from math import log, sqrt, exp, pi
from matplotlib import pyplot
from decimal import Decimal


def plot_des():

    def normal_distribution(arr):
        mu = numpy.mean(arr)
        sigma = numpy.std(arr)
        output = [exp(-((v-mu)/sigma)**2/2)/(sigma * sqrt(2*pi)) for v in arr]
        return output

    data = json.loads(open('des.json', 'r').read())['data']

    VIEWPORT_SIZE = 1600 * 900

    cluster_quantity = []
    maximum_element_quantity = []
    maximum_cluster_area = []
    minimum_cluster_area = []

    for entry in data:
        if len(entry['eq']) > 0:
            cluster_quantity.append(log(len(entry['eq'])))
            maximum_element_quantity.append(log(max(entry['eq'])))
            maximum_cluster_area.append(log(max(entry['tca']) / VIEWPORT_SIZE))
            minimum_cluster_area.append(log(min(entry['tca']) / VIEWPORT_SIZE))

    # pyplot.subplot(231)
    # pyplot.hist(cluster_quantity, bins=60)
    # pyplot.title('Cluster Quantity')

    # pyplot.subplot(232)
    maximum_element_quantity.sort()
    mean = numpy.mean(maximum_element_quantity)
    stdd = numpy.std(maximum_element_quantity)
    nd = normal_distribution(maximum_element_quantity)
    max1 = 70
    max2 = max(nd)
    nd = [max1 * v / max2 for v in nd]
    pyplot.hist(maximum_element_quantity, bins=60, color='gray')
    pyplot.plot(maximum_element_quantity, nd, linewidth='2')
    pyplot.plot([mean-2*stdd, mean-2*stdd],
                [0, 10], linewidth='4', color='red')
    pyplot.plot([mean-stdd, mean-stdd], [0, 44], linewidth='4', color='red')
    pyplot.plot([mean, mean], [0, 70], linewidth='4', color='red')
    pyplot.plot([mean+stdd, mean+stdd], [0, 44], linewidth='4', color='red')
    pyplot.plot([mean+2*stdd, mean+2*stdd],
                [0, 10], linewidth='4', color='red')
    # pyplot.title('Maximum Element Quantity')
    # pyplot.xlabel('单类元素最大数量的对数值')
    # pyplot.ylabel('网页频次')
    pyplot.show()

    # pyplot.subplot(233)
    # maximum_cluster_area.sort()
    # nd = normal_distribution(maximum_cluster_area)
    # max1 = 80
    # max2 = max(nd)
    # nd = [max1 * v / max2 for v in nd]
    # pyplot.hist(maximum_cluster_area, bins=60)
    # pyplot.plot(maximum_cluster_area, nd)
    # pyplot.hist(minimum_cluster_area, bins=60)
    # pyplot.title('Cluster Area')
    # pyplot.show()

    # pyplot.subplot(234)
    # pyplot.scatter(cluster_quantity, maximum_element_quantity, s=1)
    # pyplot.title('CQ - MEQ')

    # pyplot.subplot(235)
    # pyplot.scatter(cluster_quantity, maximum_cluster_area, s=1)
    # pyplot.title('CQ - MCA')

    # pyplot.show()

    # Fit the element quantity distribution using normal distribution.
    mean = numpy.mean(maximum_element_quantity)
    stdd = numpy.std(maximum_element_quantity)
    print('Element quantity')
    print(mean, stdd)
    print(exp(mean-2*stdd), exp(mean-stdd),
          exp(mean), exp(mean+stdd), exp(mean+2*stdd))
    print()

    mean = numpy.mean(maximum_cluster_area)
    stdd = numpy.std(maximum_cluster_area)
    print('Cluster area:')
    print(mean, stdd)
    print(exp(mean-2*stdd), exp(mean-stdd),
          exp(mean), exp(mean+stdd), exp(mean+2*stdd))


def plot_ccn():
    data = json.loads(open('ccn.json', 'r', encoding='utf-8').read())['data']

    max_quantity = []
    max_coverage = []

    for entry in data:
        quantity = []
        coverage = []
        for i in range(len(entry['allClassNames'])):
            quantity.append(len(entry['simpleClusters'][i]))
            area = 0
            for node in entry['simpleClusters'][i]:
                area += node['bounds'][2] * node['bounds'][3]
            area /= 1600 * 900
            coverage.append(area)
        quantity.sort()
        coverage.sort()
        max_quantity.append(log(quantity[-1]))
        max_coverage.append(log(coverage[-1]))

    mean = numpy.mean(max_quantity)
    sigma = numpy.std(max_quantity)

    print('Mean:', int(exp(mean)), ', Sigma:', int(exp(sigma)))
    print(int(exp(mean-2*sigma)), int(exp(mean-sigma)),
          int(exp(mean)), int(exp(mean+sigma)), int(exp(mean+2*sigma)))


def plot_opt_result():
    before = [
        [1174, 1242, 1002, 1030, 1027],
        [931, 897, 834, 853, 838],
        [1984, 2045, 1791, 1747, 1821],
        [666, 625, 656, 661, 605],
        [1300, 1207, 1177, 1288, 1184],
        [397, 390, 392, 396, 402],
        [2858, 2598, 2642, 2864, 2568],
        [1301, 1179, 1332, 1159, 1205],
        [1576, 1531, 1577, 1710, 1543],
        [890, 773, 804, 899, 911]
    ]
    after = [
        [935, 903, 918, 930, 914],
        [860, 756, 728, 744, 744],
        [1625, 1677, 1593, 1588, 1581],
        [521, 481, 484, 521, 504],
        [693, 760, 775, 745, 732],
        [298, 266, 261, 261, 265],
        [1254, 1650, 1332, 1712, 1333],
        [937, 967, 1000, 982, 978],
        [1145, 1295, 1090, 1326, 1019],
        [558, 554, 592, 553, 515]
    ]
    rdc1 = []
    rdc2 = []
    for i in range(len(before)):
        avg_before = numpy.mean(before[i])
        avg_after = numpy.mean(after[i])
        rdc1.append(avg_before - avg_after)
        rdc2.append(round(Decimal(1 - avg_after / avg_before), 2))
    rdc1.sort()
    rdc2.sort()
    print('Reduction by value:', rdc1[1], rdc1[-2])
    print('Reduction by percentage:', rdc2[1], rdc2[-2])


plot_opt_result()
