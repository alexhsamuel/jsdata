NODE_DIR=$HOME/sw/node-v6.3.1-darwin-x64
PATH=$NODE_DIR/bin:$PATH

function node() {
    $NODE_DIR/bin/node --allow-natives-syntax "$@";
}


