#!/usr/bin/env python3

import os
import sys

# For shame!
sys.path.append(os.path.expanduser("~/dev/aslib/python"))

import aslib.pandas.random as rnd

gen = rnd.dataframe(
    id      =rnd.cumsum(rnd.uniform_int(1, 10)),
    name    =rnd.word(8, upper=True),
    normal  =rnd.normal(),
    uniform =rnd.uniform(),
)

len = int(sys.argv[1])
df = gen(len)
df.index.name = "index"
df.to_csv(sys.stdout)

