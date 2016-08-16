# Components

- bool series
- `mask(bool series)`
- index series
- `take(index series)`
- array labels

### input

- read CSV
- a nicer text-based format?

### output

- render as text
- render as Markdown table
- render as HTML table (to code? directly to DOM?)


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

