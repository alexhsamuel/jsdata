import json
import numpy as np
import sys

from   benchmark import time, parse_cmd_line

MIN = 0.1
MAX = 0.3

def np_filter_sum(arr):
    return arr[(MIN <= arr) & (arr <= MAX)].sum()

def main():
    args = parse_cmd_line()

    for length in args.lengths:
        arr0 = np.random.random(length)
        result = time(np_filter_sum, arr0)
        result.update(
            operation="filter-sum",
            name="np_filter_sum", 
            type="f64", 
            length=length, 
            mem_size=length * 8)
        print(json.dumps(result))


if __name__ == "__main__":
    main()


