import copy
import json
import itertools
from correlation import explainable_variance


raw_data = json.loads(open('res.json', 'r').read())['finalResult']

tag = ['latency', 'bandwidth', 'nodeCount', 'imageCount',
       'textCount', 'cssRuleCount', 'usedCssCount']

predictor = [[] for i in range(len(tag))]
criterion = []

for entry in raw_data:
    for i in range(len(tag)):
        predictor[i].append(entry[tag[i]])
    criterion.append(max(entry['top5Layout']))

# Dominance Analysis (DA)
# Given all subset of predictors, if predictor A contributes more than predictor B, then A *completely* dominates B.
# Predictor's contribution is characterized by the augment of explainable variance.

# Step 1: Generate all subsets of predictors.
complete_set = set(range(len(tag)))
all_subsets = []

for i in range(len(tag)-1):
    fix_sized_subsets = itertools.combinations(complete_set, i+1)
    for subset in fix_sized_subsets:
        all_subsets.append(list(subset))


def format_predictor(data, idx):
    sample_size = len(data[0])
    fp = []
    for i in range(sample_size):
        entry = []
        for v in idx:
            entry.append(data[v][i])
        fp.append(entry)
    return fp


output = open('da.txt', 'w')

# Step 2: Calculate predictors' additional contribution (AC).
for i in range(len(tag)-1):
    for j in range(i+1, len(tag)):
        output.write('Predictor: {}, {}\n'.format(tag[i], tag[j]))

        # First, compare predictors' additional contribution to empty set.
        # Which equals to the explainable variance of the regression on the predictor and criterion alone.
        ac_i = explainable_variance(format_predictor(predictor, [i]), criterion)
        ac_j = explainable_variance(format_predictor(predictor, [j]), criterion)
        output.write('{} {}\n'.format(ac_i, ac_j))

        # Then, compare predictors' additional contribution across all non-empty sets that they are not included.
        # The ordering of predictors are not considered yet.
        for subset in all_subsets:
            if (not i in subset) and (not j in subset):
                original = explainable_variance(format_predictor(predictor, subset), criterion)

                ss = copy.deepcopy(subset)
                ss.append(i)
                ac_i = explainable_variance(format_predictor(predictor, ss), criterion)

                ss = copy.deepcopy(subset)
                ss.append(j)
                ac_j = explainable_variance(format_predictor(predictor, ss), criterion)

                output.write('{} {} {}\n'.format(original, ac_i, ac_j))
        
        output.write('\n')
