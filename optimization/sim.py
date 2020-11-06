import copy
import json


class CoordinateNode:
    def __init__(self, dindex, index, bounds):
        self.dindex = dindex
        self.index = index
        self.pivot_x = 0
        self.pivot_y = 0
        self.x = bounds[0]
        self.y = bounds[1]
        self.width = bounds[2]
        self.height = bounds[3]
        self.inner_nodes = []       # index


def determine_element_similarity(doc):
    NODE_COUNT = len(doc['layout']['nodeIndex'])

    nodes = []
    ACTUAL_COUNT = NODE_COUNT
    for i in range(NODE_COUNT):
        dindex = doc['layout']['nodeIndex'][i]
        bounds = doc['layout']['bounds'][i]

        n = CoordinateNode(dindex, i, bounds)
        if n.width > 0 and n.height > 0:
            nodes.append(n)
        else:
            ACTUAL_COUNT -= 1

    def covers(n1, n2):
        return n1.x <= n2.x and \
            n1.y <= n2.y and \
            n1.x + n1.width >= n2.x + n2.width and \
            n1.y + n1.height >= n2.y + n2.height

    coverage = []
    NODE_COUNT = ACTUAL_COUNT
    for i in range(NODE_COUNT):
        coverage.append([])

    for i in range(NODE_COUNT-1):
        for j in range(i+1, NODE_COUNT):
            if covers(nodes[i], nodes[j]):
                coverage[i].append(j)
            elif covers(nodes[j], nodes[i]):
                coverage[j].append(i)

    for i in range(NODE_COUNT):
        arr = coverage[i]
        if len(arr) > 0:
            arr_ = copy.deepcopy(arr)
            for j in arr_:
                arr__ = coverage[j]
                for k in arr__:
                    if k in arr:
                        arr.remove(k)

        nodes[i].inner_nodes = arr
        for v in arr:
            nodes[v].pivot_y = nodes[i].x
            nodes[v].pivot_y = nodes[i].y

    absolute_similarity = []
    relative_similarity = []
    for i in range(NODE_COUNT):
        entry = [0 for j in range(NODE_COUNT)]
        absolute_similarity.append(entry)
        relative_similarity.append(copy.deepcopy(entry))

    MIN_OFFSET = 4

    def close_coordinates(n1, n2):
        same_row = abs(n1.x-n2.x) <= MIN_OFFSET and \
            abs(n1.x + n1.width - n2.x - n2.width) <= MIN_OFFSET
        same_column = abs(n1.y-n2.y) <= MIN_OFFSET and \
            abs(n1.y + n1.height-n2.y-n2.height) <= MIN_OFFSET
        s1 = n1.width * n1.height
        s2 = n2.width * n2.height
        similar_size = (s1 / s2 if s1 < s2 else s2 / s1) >= 0.9
        return (same_row or same_column) and similar_size

    def get_absolute_similarity(i, j):
        if absolute_similarity[i][j] != 0:
            return absolute_similarity[i][j]

        if close_coordinates(nodes[i], nodes[j]):
            if len(nodes[i].inner_nodes) != len(nodes[j].inner_nodes):
                return -1
            if len(nodes[i].inner_nodes) == 0:
                return 1

            target_index = set(nodes[j].inner_nodes)
            for i1 in nodes[i].inner_nodes:
                match_found = False
                for i2 in target_index:
                    rs = get_relative_similarity(i1, i2)
                    relative_similarity[i1][i2] = rs
                    relative_similarity[i2][i1] = rs

                    if rs == 1:
                        match_found = True
                        target_index.remove(i2)
                        break

                if not match_found:
                    return -1
            return 1
        else:
            return -1

    def relative_close_coordinate(n1, n2):
        return abs(n1.x-n1.pivot_x-n2.x+n2.pivot_x) <= MIN_OFFSET and \
            abs(n1.y-n1.pivot_y-n2.y+n2.pivot_y) <= MIN_OFFSET and \
            abs(n1.width-n2.width) <= MIN_OFFSET and \
            abs(n1.height-n2.height) <= MIN_OFFSET

    def get_relative_similarity(i, j):
        if relative_similarity[i][j] != 0:
            return relative_similarity[i][j]
        if absolute_similarity[i][j] == 1:
            return 1

        if relative_close_coordinate(nodes[i], nodes[j]):
            if len(nodes[i].inner_nodes) != len(nodes[j].inner_nodes):
                return -1
            if len(nodes[i].inner_nodes) == 0:
                return 1

            target_index = set(nodes[j].inner_nodes)
            for i1 in nodes[i].inner_nodes:
                match_found = False
                for i2 in target_index:
                    rs = get_relative_similarity(i1, i2)
                    relative_similarity[i1][i2] = rs
                    relative_similarity[i2][i1] = rs

                    if rs == 1:
                        match_found = True
                        target_index.remove(i2)
                        break

                if not match_found:
                    return -1
            return 1
        else:
            return -1

    for i in range(NODE_COUNT-1):
        for j in range(i+1, NODE_COUNT):
            abss = get_absolute_similarity(i, j)
            absolute_similarity[i][j] = abss
            absolute_similarity[j][i] = abss
    print('Similarity computed.')

    # Further check transitivity.
    # Triple loop is very slow!!
    for i in range(NODE_COUNT-1):
        for j in range(i+1, NODE_COUNT):
            for k in range(NODE_COUNT):
                if k != i and k != j and \
                        absolute_similarity[i][k] == 1 and \
                        absolute_similarity[k][j] == 1:
                    absolute_similarity[i][j] = 1
                    absolute_similarity[j][i] = 1
    print('Transitivity checked.')

    # Aggregate similarity information.
    clusters = []
    for i in range(NODE_COUNT-1):
        for j in range(i+1, NODE_COUNT):
            if absolute_similarity[i][j] == 1:
                di1 = nodes[i].dindex
                di2 = nodes[j].dindex
                destination_found = False
                for cs in clusters:
                    if di1 in cs and not di2 in cs:
                        destination_found = True
                        cs.add(di2)
                        break
                    elif di2 in cs and not di1 in cs:
                        destination_found = True
                        cs.add(di1)
                        break
                    elif di1 in cs and di2 in cs:
                        destination_found = True
                        break
                if not destination_found:
                    cs = set()
                    cs.add(di1)
                    cs.add(di2)
                    clusters.append(cs)

    print(clusters)


if __name__ == '__main__':
    data = json.load(open('trace.json', encoding='utf-8'))
    determine_element_similarity(data['documents'][0])
