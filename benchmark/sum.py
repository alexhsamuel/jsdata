import json
import numpy as np
import sys

from   benchmark import time

def main():
    if len(sys.argv) == 2:
        sizes = [1 << int(sys.argv[1])]
    elif len(sys.argv) == 3:
        sizes = [ 1 << s for s in range(int(sys.argv[1]), int(sys.argv[2])) ]
    else:
        print("usage: {} SIZE [ SIZE1 ]", file=sys.stderr)
        raise SystemExit(2)

    for size in sizes:
        arr0 = np.random.random(size)
        result = time(np.sum, arr0)
        result["size"] = result["total_size"] = size
        print(json.dumps(result))


if __name__ == "__main__":
    main()


