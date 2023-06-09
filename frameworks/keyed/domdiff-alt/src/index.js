import {State} from 'js-framework-benchmark-utils';
import {getRow} from './utils.js';

function domdiff(
  parentNode, // where changes happen
  currentNodes = parentNode.childNodes, // Array of current items/nodes
  futureNodes = [], // Array of future items/nodes
) {
  // fast path for full replacement of content
  let atLeastOneMatch = false;
  for (let i = 0, len = Math.min(currentNodes.length, futureNodes.length); i < len; i++) {
    if (currentNodes[i] === futureNodes[i]) {
      atLeastOneMatch = true;
      break;
    }
  }
  if (!atLeastOneMatch) {
    parentNode.replaceChildren(...futureNodes);
    return;
  }

  // remove all nodes not in futureNodes
  const futureNodesIndexMap = new Map();
  futureNodes.forEach((node, index) => futureNodesIndexMap.set(node, index));
  // remove in reverse order, so that live child nodes removal doesn't affect iteration.
  for (let i = currentNodes.length - 1; i >= 0; i--) {
    let node = currentNodes[i];
    if (!futureNodesIndexMap.has(node)) {
      parentNode.removeChild(node);
    }
  }

  // Optimize for swaps
  let childNodes = parentNode.childNodes;
  if (childNodes.length === futureNodes.length) {
    // if lists are equal, then no need to waste memory
    if (futureNodes.every((node, index) => node === childNodes[index])) return;
    let currentNodesIndexMap = new Map();
    for (let i = 0; i < childNodes.length - 1; i++) {
      currentNodesIndexMap.set(childNodes[i], i);
    }
    let swaps = [];
    let swapLookup = new Set();
    for (let i = 0; i < childNodes.length - 1; i++) {
      let currentNode = childNodes[i];
      let futureNode = futureNodes[i];
      if (currentNode == futureNode || swapLookup.has(futureNode)) continue;
      let finalIndexOfCurrentNode = futureNodesIndexMap.get(currentNode);
      let currentIndexOfFutureNode = currentNodesIndexMap.get(futureNode);
      if (
        finalIndexOfCurrentNode === currentIndexOfFutureNode
        && finalIndexOfCurrentNode > -1
        && currentIndexOfFutureNode > -1
      ) {
        swaps.push([currentNode, futureNode, i]);
      }
    }

    swaps.forEach(([currentNode, futureNode, currentNodeIndex]) => {
      parentNode.insertBefore(currentNode, futureNode);
      parentNode.insertBefore(futureNode, childNodes[currentNodeIndex]);
    });
  }

  // insert the future nodes into position
  futureNodes.forEach((node, index) => {
    let nodeAtPosition = parentNode.childNodes[index];
    if (nodeAtPosition !== node) {
      parentNode.insertBefore(node, nodeAtPosition);
    }
  });
}

const tbody = document.querySelector('tbody');
let rows = [].slice.call(tbody.childNodes);
const state = State(({data, selected, select, remove}) => {
  rows = domdiff(
    tbody,
    rows,
    data.map(item => {
      const {id, label} = item;
      const info = getRow(data, select, remove, id, label);
      const {row, selector, td} = info;
      if (info.id !== id)
        td.textContent = (row.id = (info.id = id));
      if (info.label !== label)
        selector.textContent = (info.label = label);
      const danger = id === selected;
      if (info.danger !== danger)
        row.classList.toggle('danger', (info.danger = danger));
      return row;
    })
  );
});

Object.keys(state).forEach(id => {
  const button = document.querySelector(`#${id.toLowerCase()}`);
  if (button)
    button.addEventListener('click', () => state[id]());
});
