function colIdMap(dataTab) {
  const m = new Map();
  dataTab.forEach((row, index) => {
    m.set(row.id.toString(), index);
  });

  return m;
}

function move(dataTab, index, newIndex) {
  const rowTemporary = dataTab[newIndex];
  dataTab[newIndex] = dataTab[index];
  dataTab[index] = rowTemporary;
}

export function moveUp(dataTab, row) {
  console.info(`click onMoveUp`, row);

  const index = colIdMap(dataTab).get(row.id);
  if(typeof index === 'undefined' || index <= 0) 
    return dataTab;

  const  newIndex =  index - 1 ;
  move(dataTab, index, newIndex);

  return [...dataTab];
}

export function moveDown(dataTab,row) {
  console.info(`click onMoveDown`, row);

  const index = colIdMap(dataTab).get(row.id);
  if(typeof index === 'undefined' || index >= dataTab.length - 1) 
    return dataTab;

  const  newIndex =  index + 1 ;
  move(dataTab, index, newIndex);

  return [...dataTab];
}

export function addRow(dataTab, row) {
  const index = colIdMap(dataTab).get(row.id);
  if(typeof index === 'undefined')
    return [...dataTab, row.original];
  else
    return dataTab;
}

export function deleteRow(dataTab, row) {
  const index = colIdMap(dataTab).get(row.id);
  if(typeof index === 'undefined')
    return dataTab;
  else
  return [...dataTab.slice(0, index), ...dataTab.slice(index + 1)];
}
