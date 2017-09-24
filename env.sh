NODE_DIR=$(echo $HOME/sw/node-v8*)
path P ++ $NODE_DIR/bin
path JS ++ $(dirname $BASH_SOURCE)

# function node() {
#     $NODE_DIR/bin/node --allow-natives-syntax "$@";
# }

export PYTHONPATH=$HOME/dev/aslib/python:$HOME/dev/fixfmt/python
