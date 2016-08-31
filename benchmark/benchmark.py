import argparse
import datetime
import json
import os
import sys

import aslib.timing

def output_json(results):
    for result in results:
        print(json.dumps(result))


def output_table(results):
    print("length    time       rate        bandwidth    ")
    print("--------- ---------- ----------- -------------")
    for res in results:
        print("{:9d} {:10.6f} {:6.1f} Mi/s {:7.1f} MiB/s".format(
            res["length"],
            res["time"],
            res["length"] / res["time"] / 1048576,
            res["mem_size"] / res["time"] / 1048576,
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


