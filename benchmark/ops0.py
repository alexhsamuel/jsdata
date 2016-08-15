import numpy as np
from   aslib.timing import time_it

num = 1 << 24

arr0 = np.random.random(num)
arr1 = np.random.random(num)

print(time_it(lambda: arr0 + arr1, count=1, trials=100))
print()

res = np.empty(num, dtype=float)
print(time_it(lambda: np.add(arr0, arr1, res), count=1, trials=100))

