import numpy as np

from   benchmark import time, parse_cmd_line

def np_summarize_0(arr):
    fin = arr[np.isfinite(arr)]
    return dict(
        length      =len(arr),
        numNan      =np.isnan(arr).sum(),
        numFinite   =len(fin),
        min         =fin.min(),
        max         =fin.max(),
        sum         =fin.sum(),
        sum2        =(fin * fin).sum(),
    )

def do(length):
    arr0 = np.random.random(length)
    result = time(np_summarize_0, arr0)
    result.update(
        operation   ="summarize",
        name        ="np_summarize_0", 
        type        ="f64", 
        length      =length, 
        mem_size    =length * 8
    )
    return result


def main():
    args = parse_cmd_line()
    args.output( do(l) for l in args.lengths )


if __name__ == "__main__":
    main()


