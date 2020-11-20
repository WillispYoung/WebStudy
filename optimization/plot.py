import json
from math import log
from matplotlib import pyplot


data = json.loads(open('des.json', 'r').read())['data']

VIEWPORT_SIZE = 1600 * 900

cluster_quantity = []
maximum_element_quantity = []
minimum_element_quantity = []
maximum_cluster_area = []
minimum_cluster_area = []

for entry in data:
    if len(entry['eq']) > 0:
        cluster_quantity.append(log(len(entry['eq'])))
        maximum_element_quantity.append(log(max(entry['eq'])))
        # minimum_element_quantity.append(min(entry['eq']))
        maximum_cluster_area.append(log(max(entry['tca']) / VIEWPORT_SIZE))
        minimum_cluster_area.append(log(min(entry['tca']) / VIEWPORT_SIZE))

pyplot.subplot(231)
pyplot.hist(cluster_quantity, bins=60)
pyplot.title('Cluster Quantity')

pyplot.subplot(232)
pyplot.hist(maximum_element_quantity, bins=60)
pyplot.title('Maximum Element Quantity')

pyplot.subplot(233)
pyplot.hist(maximum_cluster_area, bins=60)
pyplot.hist(minimum_cluster_area, bins=60)
pyplot.title('Cluster Area')

pyplot.subplot(234)
pyplot.scatter(cluster_quantity, maximum_element_quantity, s=1)
pyplot.title('CQ - MEQ')

pyplot.subplot(235)
pyplot.scatter(cluster_quantity, maximum_cluster_area, s=1)
pyplot.title('CQ - MCA')

pyplot.show()