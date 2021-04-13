import json
import numpy
from matplotlib import pyplot

raw_data = json.loads(open('count_invisible_node.json', 'r').read())['ps']

count = [arr[1] for arr in raw_data]
proportion = [arr[2] / arr[1] for arr in raw_data]

count.sort()
proportion.sort()

# print(sum(count) / len(count), numpy.mean(count), count[int(len(count) * 0.7)], count[int(len(count) * 0.8)], count[int(len(count) * 0.9)], count[-1])
# print(sum(proportion) / len(proportion), numpy.mean(proportion), proportion[int(len(proportion) * 0.7)], proportion[int(len(proportion) * 0.8)], proportion[int(len(proportion) * 0.9)], proportion[-1])

print( min(proportion), sum(proportion)/len(proportion), numpy.mean(proportion), max(proportion),)

# output
# 1220 1220 1371 1877 2802 19331
# 0.4957 0.4957 0.6732 0.7407 0.7960 0.9468

count, bins_count = numpy.histogram(proportion, bins=100)
pdf = count / sum(count)
cdf = numpy.cumsum(pdf)

pyplot.plot(pdf)
pyplot.plot(cdf)

pyplot.legend(['PDF', 'CDF'])
pyplot.show()
