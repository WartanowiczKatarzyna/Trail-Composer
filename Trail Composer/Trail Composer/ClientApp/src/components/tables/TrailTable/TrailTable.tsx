import React, { useContext } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { ColumnDef, Row } from '@tanstack/react-table'

import { TrailRowData } from './TrailRowData';
import { AppContext, AppContextValueType } from '../../../App';
import { LocalTable } from '../LocalTable/LocalTable';
import { ColumnVisibility } from '../LocalTable/ColumnVisibility';

export  function TrailTable({
  data,
  onDelete,
  onEdit,
  onRowSelect,
  onMoveUp,
  onMoveDown,
  showColumns
} : {
  data: TrailRowData[],
  onDelete?: (row: Row<TrailRowData>) => void | null,
  onEdit?: (row: Row<TrailRowData>) => void | null,
  onRowSelect?: (row: Row<TrailRowData>) => void | null,
  onMoveUp?: (row: Row<TrailRowData>) => void | null,
  onMoveDown?: (row: Row<TrailRowData>) => void | null,
  showColumns?: ColumnVisibility
}) {
  const appData = useContext<AppContextValueType>(AppContext);

  const columns = React.useMemo<ColumnDef<TrailRowData>[]>(
    () => [
      {
        accessorKey: 'id',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Id</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'name',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Nazwa</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'username',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Autor</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'totalLength',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Długość</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'level',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Poziom trudności</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'countries',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Kraje</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'pathTypes',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Typ trasy</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'actions',
        cell: ({row}) => (
          <div style={{display: 'inline-flex'}}>
            { !!onMoveUp && (
              <IconButton
                onClick={(e) => { e.stopPropagation(); onMoveUp(row); }}
                aria-label="move up">
                <ArrowDropUpIcon />
              </IconButton>) }
            { !!onMoveDown && (
              <IconButton
                onClick={(e) => { e.stopPropagation(); onMoveDown(row); }}
                aria-label="move down">
                <ArrowDropDownIcon />
              </IconButton>) }
            { !!onEdit && (
              <IconButton
                onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                aria-label="edit"><EditIcon />
              </IconButton>) }
            { !!onDelete && (
            <IconButton
              onClick={(e) => { e.stopPropagation(); onDelete(row); }}
              aria-label="delete"><DeleteIcon />
            </IconButton>) }
          </div>
        ) ,
        header: () => <span></span>,
      }
    ],
    [appData]
  );

  return (<LocalTable<TrailRowData> {...{ data, columns, onRowSelect, showColumns }} />)
}
