import argparse
import datetime
import json
import os
import sys

import aslib.timing
import fixfmt
import fixfmt.tbl

def output_json(results):
    for result in results:
        print(json.dumps(result))


TABLE = fixfmt.tbl.BoxTable((
    ("length"       , fixfmt.Number(9)),
    ("time"         , fixfmt.Number(3, 6)),
    ("rate"         , fixfmt.Number(4, 1, scale="Mi")),
    ("bandwidth"    , fixfmt.Number(5, 1, scale="Mi")),
))

def output_table(results):
    TABLE.print((
        (
            res["length"],
            res["time"],
            res["length"] / res["time"],
            res["mem_size"] / res["time"],
        )
        for res in results
    ))


def parse_cmd_line():
    parser = argparse.ArgumentParser()
    parser.set_defaults(output=output_table)
    parser.add_argument(
        "--json", action="store_const", dest="output", const=output_json)
    parser.add_argument(
        "min", type=int)
    parser.add_argument(
        "max", type=int, nargs="?", default=None)
    cmd_args = parser.parse_args()

    if cmd_args.max is None:
        lengths = [1 << cmd_args.min]
    else:
        lengths = [ 1 << s for s in range(cmd_args.min, cmd_args.max) ]

    class Args: pass
    args = Args()
    args.lengths = lengths
    args.output = cmd_args.output
    return args


def get_env_info():
    now = format(datetime.datetime.utcnow(), "%Y-%m-%dT%H:%M:%SZ")
    uname = os.uname()
    return {
        "timestamp"     : now,
        "language"      : "python",
        "language_ver"  : ".".join( str(v) for v in sys.version_info[:3] ),
        "os"            : uname.sysname,
        "os_ver"        : uname.release,
        "arch"          : uname.machine,
        "host"          : uname.nodename,
    }


TIMER = aslib.timing.call_timer(samples=100)

def _get_len(obj):
    try:
        return len(obj)
    except:
        return None


def time(fn, *args, **kw_args):
    result = TIMER(fn, *args, **kw_args)
    result.update(get_env_info())
    return result


