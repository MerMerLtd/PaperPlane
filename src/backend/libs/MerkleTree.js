const path = require('path');
const keccak256 = require('keccak256');
const Utils = require(path.resolve(__dirname, 'Utils.js'));

class Node {
  constructor(value) {
    this.value = value;
    this._ = {};
  }
  set parent(node) {
    if(node instanceof Node) {
      this._.parent = node;
    }
  }
  get parent() {
    return this._.parent;
  }
  set left(node) {
    if(node instanceof Node) {
      this._.left = node;
      node.parent = this;
    }
  }
  get left() {
    return this._.left;
  }
  set right(node) {
    if(node instanceof Node) {
      this._.right = node;
      node.parent = this;
    }
  }
  get right() {
    return this._.right;
  }
  get root() {
    if(node instanceof this.parent) {
      return this.parent.root;
    } else {
      return this;
    }
  }
  toArray() {
    let result = [this.value]
      .concat(this.left.toArray())
      .concat(this.right.toArray());
  }
}

class MerkleTree {
  static caculateMerkleTree(data) {
    if(!Array.isArray(data)) {
      return data;
    }
    if(data.length == 1) {
      return data[0];
    } else {
      const sortData = data.sort();
      const leafCount = 2 ** Math.ceil(Math.log(sortData.length) / Math.log(2));
      const leafNodes = new Array(leafCount).fill(0).map((v, i) => {
        return sortData[i] instanceof Node ? sortData[i] : new Node(sortData[i] || '');
      });
      const parents = [];
      for(let i = 0; i < leafCount; i += 2) {
        let hash = keccak256(leafNodes[i].value + leafNodes[i + 1].value).toString('hex');
        let newNode = new Node(hash);
        newNode.left = leafNodes[i];
        newNode.right = leafNodes[i + 1];
        parents.push(newNode);
      }
      return this.caculateMerkleTree(parents);
    }
  }

  static caculateMerkleRoot(data) {
    const merkleTree = this.caculateMerkleTree(data);
    return merkleTree.value;
  }

  static checkMerkleRoot({ data, rootHash }) {
    return this.caculateMerkleRoot({ data }) == rootHash;
  }
}

module.exports = MerkleTree;