# Optimization

The `v8-native` package wraps some `%` V8 native functions. See [this](https://github.com/Nathanaela/v8-Natives/blob/master/lib/v8-native-calls.js) for its list.  Invoke node with `--allow-natives-syntax` to enable.

Invoke node with `--trace_opt` and `--trace_deopt` to see the JIT optimizer at work.

Invoke with `--print-code --print-opt-code --code-comments` to see disassembly dumps.


# Timings

For,

- js = node 6.3.1 (v8 5.0.71.57)
- c++ = Apple LLVM 7.0.2 with -O3
- py3 = Python 3.5.1 + numpy 1.10.4 + mkl 11.3.1

## Vector add

Elementwise addition of two f64 arrays into a third. [ops0.js](benchmark/ops0.js) and [ops0.py](benchmark/ops0.py)

For 16 Mi elements = 128 MiB per array: (timing error is ~10 ms?)

| platform | alloc? | time |
|:---------|:-------|-----:|
| js  | yes | 130 ms |
| js  | no  |  65 ms |
| c++ | yes |  90 ms |
| c++ | no  |  35 ms |
| py3 | yes |  90 ms |
| py3 | no  |  30 ms |

`alloc?` means allocate a fresh output array on each iteration; otherwise, we reuse the same one on every iteration.  The allocation is close to free; the 60 ms "allocation" time seems to be in writing one byte to each 4 kiB page.  That's 3.5 ns per f64 or about 0.5 sec/GiB.

## CSV reader

For this CSV file, 1Mi rows,

```
index,id,name,normal,uniform
0,5,RWQRTIRF,0.3178490220415918,0.7304568407944317
1,8,ZDWFVVTY,1.1279855475232836,0.1613744720875585
```

our naïve CSV reader takes 8.6 s, while `pd.read_csv()` takes 1.6 s.

