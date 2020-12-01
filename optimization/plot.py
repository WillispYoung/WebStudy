import copy
import json
import numpy
from math import log, sqrt, exp, pi
from matplotlib import pyplot


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
pyplot.plot([mean-2*stdd, mean-2*stdd], [0, 10], linewidth='4', color='red')
pyplot.plot([mean-stdd, mean-stdd], [0, 44], linewidth='4', color='red')
pyplot.plot([mean, mean], [0, 70], linewidth='4', color='red')
pyplot.plot([mean+stdd, mean+stdd], [0, 44], linewidth='4', color='red')
pyplot.plot([mean+2*stdd, mean+2*stdd], [0, 10], linewidth='4', color='red')
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
