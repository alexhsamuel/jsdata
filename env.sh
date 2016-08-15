NODE_DIR=$(echo $HOME/sw/node-v6.3.1-*)
PATH=$NODE_DIR/bin:$PATH

function node() {
    $NODE_DIR/bin/node --allow-natives-syntax "$@";
}

