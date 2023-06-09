import domdiff from 'domdiff';
import {State} from 'js-framework-benchmark-utils';
import {getRow} from './utils.js';

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
