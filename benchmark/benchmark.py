import datetime
import os
import sys

import aslib.timing


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


