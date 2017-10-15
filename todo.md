
# Benchmarking

See [Rigorous Benchmarking in Reasonable Time](https://kar.kent.ac.uk/33611/7/paper.pdf).

- shuffle samples?
- combine samples across multiple runs?
- only store environment metadata once, not once per sample
- move analytics out of timing libraries; don't summarize times

- look at stability: lag and autocorrleation plots

- run on an AWS node
- run nice and with process-core affinity

- split out into a separate multi-language benchmarking repo
