const RESOLUTION = 800;

let canvas;
let ctxt;
let graph;

window.onload = () => {
    canvas = document.getElementById("canvas");
    canvas.width = RESOLUTION;
    canvas.height = RESOLUTION;
    ctxt = canvas.getContext("2d");


    graph = new Graph(5, 3);

    loop();
}

function loop() {
    ctxt.clearRect(0, 0, canvas.width, canvas.height);

    ctxt.save();
    ctxt.setTransform(RESOLUTION, 0, 0, RESOLUTION, 0, 0);

    graph.render(ctxt);

    ctxt.restore();

    // requestAnimationFrame(loop);
}

class Graph {
    constructor(n, crossConnectionCount) {
        this.nodes = [];

        for (let i = 0; i < n; i++) {
            let parentIndex = Math.floor(Math.random() * (this.nodes.length + 1)) - 1;
            this.nodes.push(new GraphNode(this.nodes[parentIndex]));
        }

        for (let i = 0; i < crossConnectionCount; i++) {
            let index1 = Math.floor(Math.random() * this.nodes.length);
            let index2 = Math.floor(Math.random() * this.nodes.length);

            if (index1 >= index2) {
                continue;
            }

            let node1 = this.nodes[index1];
            let node2 = this.nodes[index2];

            if (node1.hasChild(node2) || node2.hasChild(node1)) {
                continue;
            }

            node1.crossConnect(node2);
        }

        this.computeNumbering()
    }

    computeNumbering() {
        // bottom up
        let queue = this.nodes.filter((n) => n.children.length === 0);
        let visited = new Set();

        let number = this.nodes.length - 1;
        while (queue.length > 0) {
            let next = queue.shift();
            next.number = number;
            number--;

            for (let node of next.parents) {
                if (visited.has(node)) {
                    continue;
                }

                queue.push(node);
                visited.add(node);
            }
        }

        // top down
        queue = this.nodes.filter((n) => n.parents.length === 0);
        while (queue.length > 0) {
            // TODO
            break
        }
    }

    render(ctxt) {
        let nodes = this.nodes.slice();
        let added = [];
        let levels = [];
        while (nodes.length > 0) {
            let level = [];

            for (let i = nodes.length - 1; i >= 0; i--) {
                if (nodes[i].parents.every((p) => added.includes(p))) {
                    level.push(nodes.splice(i, 1)[0]);
                }
            }

            levels.push(level);
            added = added.concat(level);
        }

        let height = levels.length;
        let width = levels.reduce((w, l) => Math.max(w, l.length), 0);
        let size = Math.max(width, height);
        let offsetX = (size - width) / 2;
        let offsetY = (size - height) / 2;

        for (let y = 0; y < levels.length; y++) {
            for (let x = 0; x < levels[y].length; x++) {
                levels[y][x].x = x + 0.5 + offsetX;
                levels[y][x].y = y + 0.5 + offsetY;
            }
        }

        ctxt.transform(1 / size, 0, 0, 1 / size, 0, 0);

        ctxt.lineWidth = 0.01;
        for (let node of this.nodes) {
            node.renderConnection(ctxt);
        }
        for (let node of this.nodes) {
            node.renderNode(ctxt);
        }
    }
}

class GraphNode {
    constructor(parent) {
        if (parent) {
            this.parents = [parent];
            parent.addChild(this);
        } else {
            this.parents = [];
        }
        this.children = [];
        this.number = -1;
        this.x = NaN;
        this.y = NaN;
    }

    crossConnect(child) {
        this.children.push(child);
        child.parents.push(this);
    }

    addChild(child) {
        this.children.push(child);
    }

    hasChild(child) {
        return this.children.includes(child);
    }

    renderConnection(ctxt) {
        for (let child of this.children) {
            ctxt.beginPath();
            ctxt.moveTo(this.x, this.y);
            ctxt.lineTo(child.x, child.y);
            ctxt.stroke();
        }
    }

    renderNode(ctxt) {
        ctxt.fillStyle = "#000";
        ctxt.beginPath();
        ctxt.arc(this.x, this.y, 0.075, 0, 2 * Math.PI);
        ctxt.fill();

        ctxt.fillStyle = "#FFF";
        ctxt.font = "0.1px arial";
        ctxt.textAlign = "center";
        ctxt.textBaseline = "middle";
        ctxt.fillText(`${this.number}`, this.x, this.y);
    }
}
