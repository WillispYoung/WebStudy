import math
from sklearn import linear_model


# Format: X = []
def sum_of_squares(X):
    l = len(X)
    mx = sum(X) / l
    dx = [v-mx for v in X]
    return sum([v**2 for v in dx])


# Format: 
def pearson_correlation(X, Y):
    l = len(X)
    mx = sum(X)/l       # mean
    my = sum(Y)/l
    dx = [v - mx for v in X]  # deviation
    dy = [v - my for v in Y]
    v1 = sum([dx[i]*dy[i] for i in range(l)])
    v2 = sum([v**2 for v in dx]) * sum([v**2 for v in dy])
    return v1 / math.sqrt(v2)


# Format: 
def partial_correlation(X, Y, Z):
    l = len(X)
    lr = linear_model.LinearRegression()

    lr.fit(Z,X)
    ex = [X[i] - lr.predict([Z[i]])[0] for i in range(l)]

    lr.fit(Z,Y)
    ey = [Y[i] - lr.predict([Z[i]])[0] for i in range(l)]
    return pearson_correlation(ex, ey)


# Format: X = [[]], Y = []
def explainable_variance(X, Y):
    SSY = sum_of_squares(Y)

    lr = linear_model.LinearRegression()
    lr.fit(X, Y)
    Y_ = [lr.predict([v])[0] for v in X]
    SSY_ = sum_of_squares(Y_)

    return SSY_ / SSY
