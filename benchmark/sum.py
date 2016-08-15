import json
import numpy as np
import sys

from   benchmark import time

def main():
    if len(sys.argv) == 2:
        lengths = [1 << int(sys.argv[1])]
    elif len(sys.argv) == 3:
        lo, hi = sys.argv[1 :]
        lengths = [ 1 << s for s in range(int(lo), int(hi)) ]
    else:
        print("usage: {} SIZE [ SIZE1 ]", file=sys.stderr)
        raise SystemExit(2)

    for length in lengths:
        arr0 = np.random.random(length)
        result = time(np.sum, arr0)
        result.update(
            operation="sum",
            name="numpy.sum", 
            type="f64", 
            length=length, 
            mem_size=length * 8)
        print(json.dumps(result))


if __name__ == "__main__":
    main()


