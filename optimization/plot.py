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
    # print(mean, stdd)
    nd = normal_distribution(maximum_element_quantity)
    max1 = 70
    max2 = max(nd)
    nd = [max1 * v / max2 for v in nd]
    pyplot.hist(maximum_element_quantity, bins=60, color='lightblue')
    pyplot.plot(maximum_element_quantity, nd, linewidth='2', color='steelblue')
    pyplot.plot([mean-2*stdd, mean-2*stdd], [0, 10], linewidth='2', color='red', linestyle='--')
    pyplot.plot([mean-stdd, mean-stdd], [0, 43], linewidth='2', color='red', linestyle='--')
    pyplot.plot([mean, mean], [0, 70], linewidth='2', color='red', linestyle='--')
    pyplot.plot([mean+stdd, mean+stdd], [0, 43], linewidth='2', color='red', linestyle='--')
    pyplot.plot([mean+2*stdd, mean+2*stdd], [0, 10], linewidth='2', color='red', linestyle='--')
    # pyplot.title('Maximum Element Quantity')
    # pyplot.xlabel('单类元素最大数量的对数值')
    # pyplot.ylabel('网页频次')
    # pyplot.legend(['Normal Distribution', 'Standard Deviation'])
    pyplot.text(mean+2*stdd, 60, r'$\mu=3.39$')
    pyplot.text(mean+2*stdd, 55, r'$\sigma=1.07$')
    pyplot.xticks([mean-2*stdd, mean-stdd, mean, mean+stdd, mean+2*stdd], 
        [r'$\mu-2\sigma$', r'$\mu-\sigma (10)$', r'$\mu (29)$', r'$\mu+\sigma (86)$', r'$\mu+2\sigma$'])
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
    sltd = [
        [401, 374, 323, 277, 295],
        [367, 377, 412, 377, 377],
        [227, 221, 219, 222, 216]
    ]

    more = [[521, 268]]

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


def layout_model_41():
    ticks = ['PH', 'PASS', 'ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['FlexBox', 'Inline-Block', 'Float']
    timepoints = [[9500, 200, 300, 16000, 300, 100, 600, 300],
                [8000, 220, 320, 16200, 350, 120, 620, 320],
                [6100, 210, 310, 16300, 340, 130, 610, 310]]
    axis_font = {'fontname':'Arial', 'size':'16'}
    markers = ['x', '^', '+']

    for i in range(3):
        pyplot.scatter(range(8), timepoints[i], marker=markers[i])
    
    pyplot.legend(legends, prop={'size': 16})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(8), ticks, **axis_font)
    pyplot.yticks([0, 4000, 8000, 12000, 16000], **axis_font)
    pyplot.show()


def css_selector_42():
    ticks = ['PH', 'PASS', 'ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', 'Nth-child', 'In Tag']
    timepoints = [[1000, 100, 13500, 22000, 200, 150, 220, 170],
                [1100, 90, 14000, 24000, 210, 160, 210, 180],
                [1200, 110, 13000, 23500, 190, 140, 200, 190]]
    axis_font = {'fontname':'Arial', 'size':'16'}
    markers = ['x', '^', '+']

    for i in range(3):
        pyplot.scatter(range(8), timepoints[i], marker=markers[i])
    
    pyplot.legend(legends, prop={'size': 16})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(8), ticks, **axis_font)
    pyplot.yticks([0, 5000, 10000, 15000, 20000, 25000], **axis_font)
    pyplot.show()


def image_count_431():
    ticks = ['ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', '1 img', '2 imgs', '3 imgs', '4 imgs']
    timepoints = [[100, 100, 200, 150, 100, 200],
                [110, 200, 210, 170, 120, 250],
                [120, 9500, 220, 190, 130, 270],
                [130, 9600, 230, 210, 140, 290],
                [140, 9900, 240, 230, 250, 310]]
    axis_font = {'fontname':'Arial', 'size':'18'}
    markers = ['x', '^', '+', 'v', 'o']

    for i in range(5):
        pyplot.scatter(range(6), timepoints[i], marker=markers[i], s=40)
    
    pyplot.legend(legends, prop={'size': 18})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(6), ticks, **axis_font)
    pyplot.yticks([0, 5000, 10000], **axis_font)
    pyplot.show()


def image_size_432():
    ticks = ['ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', '23k', '886k', '1908k']
    timepoints = [[10, 10, 100, 40, 30, 180],
                [90, 420, 190, 40, 100, 350],
                [120, 430, 290, 180, 100, 570],
                [130, 490, 280, 250, 110, 550]]
    axis_font = {'fontname':'Arial', 'size':'18'}
    markers = ['x', '^', '+', 'v', 'o']

    for i in range(4):
        pyplot.scatter(range(6), timepoints[i], marker=markers[i], s=40)
    
    pyplot.legend(legends, prop={'size': 18})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(6), ticks, **axis_font)
    pyplot.yticks([0, 300, 600], **axis_font)
    pyplot.show()


def ol_image_433():
    ticks = ['ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', '2 items', '3 items', '4 items']
    timepoints = [[100, 100, 120, 100, 90, 130],
                [100, 100, 130, 100, 90, 135],
                [110, 8500, 500, 300, 200, 300],
                [300, 9000, 800, 300, 200, 400]]
    axis_font = {'fontname':'Arial', 'size':'18'}
    markers = ['x', '^', '+', 'v', 'o']

    for i in range(4):
        pyplot.scatter(range(6), timepoints[i], marker=markers[i], s=40)
    
    pyplot.legend(legends, prop={'size': 18})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(6), ticks, **axis_font)
    pyplot.yticks([0, 5000, 10000], **axis_font)
    pyplot.show()


def table_image_434():
    ticks = ['ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', '1X2', '1X4', '2X2', '2X4']
    timepoints = [[10, 10, 100, 60, 30, 150],
                [260, 900, 350, 250, 150, 600],
                [270, 1000, 540, 500, 160, 650],
                [280, 960, 550, 170, 170, 660],
                [300, 1850, 750, 740, 240, 1000]]
    axis_font = {'fontname':'Arial', 'size':'18'}
    markers = ['x', '^', '+', 'v', 'o']

    for i in range(len(legends)):
        pyplot.scatter(range(6), timepoints[i], marker=markers[i], s=40)
    
    pyplot.legend(legends, prop={'size': 18})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(6), ticks, **axis_font)
    pyplot.yticks([0, 1000, 2000], **axis_font)
    pyplot.show()


def word_count_441():
    ticks = ['ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', '100 words', '200 words', '400 words', '800 words']
    timepoints = [[0, 0, 90, 20, 10, 150],
                [0, 0, 220, 130, 10, 210],
                [0, 0, 170, 140, 15, 200],
                [0, 0, 200, 160, 10, 180],
                [0, 0, 320, 270, 20, 240]]
    axis_font = {'fontname':'Arial', 'size':'18'}
    markers = ['x', '^', '+', 'v', 'o']

    for i in range(len(legends)):
        pyplot.scatter(range(6), timepoints[i], marker=markers[i], s=60)
    
    pyplot.legend(legends, prop={'size': 18})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(6), ticks, **axis_font)
    pyplot.yticks([0, 200, 400], **axis_font)
    pyplot.show()


def para_count_442():
    ticks = ['ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', '1 para', '2 paras', '3 paras', '4 paras']
    timepoints = [[0, 0, 100, 30, 20, 150],
                [0, 0, 160, 120, 25, 230],
                [0, 0, 175, 130, 27, 180],
                [0, 0, 180, 155, 30, 183],
                [0, 0, 230, 170, 33, 185]]
    axis_font = {'fontname':'Arial', 'size':'18'}
    markers = ['x', '^', '+', 'v', 'o']

    for i in range(len(legends)):
        pyplot.scatter(range(6), timepoints[i], marker=markers[i], s=60)
    
    pyplot.legend(legends, prop={'size': 18})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(6), ticks, **axis_font)
    pyplot.yticks([0, 100, 200], **axis_font)
    pyplot.show()


def list_text_443():
    ticks = ['ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', '2 items', '3 items', '4 items']
    timepoints = [[0, 0, 100, 30, 20, 150],
                [0, 0, 190, 155, 22, 200],
                [0, 0, 200, 170, 25, 190],
                [0, 0, 290, 260, 30, 230]]
    axis_font = {'fontname':'Arial', 'size':'18'}
    markers = ['x', '^', '+', 'v', 'o']

    for i in range(len(legends)):
        pyplot.scatter(range(6), timepoints[i], marker=markers[i], s=60)
    
    pyplot.legend(legends, prop={'size': 18})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(6), ticks, **axis_font)
    pyplot.yticks([0, 100, 200], **axis_font)
    pyplot.show()


def table_text_444():
    ticks = ['ULT', 'Layout', 'ULrT', 'UL', 'Paint', 'CL']
    legends = ['Baseline', '1X2', '1X4', '2X2', '2X4']
    timepoints = [[0, 0, 100, 30, 20, 150],
                [30, 20, 100, 100, 50, 80],
                [50, 30, 200, 150, 60, 100],
                [90, 3000, 400, 400, 80, 200],
                [110, 6500, 500, 600, 90, 250, ]]
    axis_font = {'fontname':'Arial', 'size':'18'}
    markers = ['x', '^', '+', 'v', 'o']

    for i in range(len(legends)):
        pyplot.scatter(range(6), timepoints[i], marker=markers[i], s=60)
    
    pyplot.legend(legends, prop={'size': 18})
    # pyplot.xlabel(xlabels)
    pyplot.xticks(range(6), ticks, **axis_font)
    pyplot.yticks([0, 2000, 4000, 6000, 8000], **axis_font)
    pyplot.show()


table_text_444()