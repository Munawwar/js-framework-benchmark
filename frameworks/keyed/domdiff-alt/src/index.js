import {State} from 'js-framework-benchmark-utils';
import {getRow} from './utils.js';

function domdiff(
  parentNode, // where changes happen
  currentNodes = parentNode.childNodes, // Array of current items/nodes
  futureNodes = [], // Array of future items/nodes
) {
  // remove all nodes not in futureNodes
  const futureNodesSet = new Set(futureNodes);
  // remove in reverse order, so that live child nodes removal doesn't affect iteration.
  for (let i = currentNodes.length - 1; i >= 0; i--) {
    let node = currentNodes[i];
    if (!futureNodesSet.has(node)) {
      parentNode.removeChild(node);
    }
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
