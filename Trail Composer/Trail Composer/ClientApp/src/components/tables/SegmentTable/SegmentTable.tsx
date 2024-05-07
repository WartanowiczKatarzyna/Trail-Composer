import React, { useContext } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { ColumnDef, Row } from '@tanstack/react-table'

import { SegmentRowData } from './SegmentRowData';
import { AppContext, AppContextValueType } from '../../../App';
import { LocalTable } from '../LocalTable/LocalTable';
import { ColumnVisibility } from '../LocalTable/ColumnVisibility';

export  function SegmentTable({
  data,
  onDelete,
  onEdit,
  onRowSelect,
  onMoveUp,
  onMoveDown,
  showColumns
} : {
  data: SegmentRowData[],
  onDelete?: (row: Row<SegmentRowData>) => void | null,
  onEdit?: (row: Row<SegmentRowData>) => void | null,
  onRowSelect?: (row: Row<SegmentRowData>) => void | null,
  onMoveUp?: (row: Row<SegmentRowData>) => void | null,
  onMoveDown?: (row: Row<SegmentRowData>) => void | null,
  showColumns?: ColumnVisibility
}) {
  const appData = useContext<AppContextValueType>(AppContext);

  const columns = React.useMemo<ColumnDef<SegmentRowData>[]>(
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
        accessorKey: 'length',
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
        accessorKey: 'country',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Kraj</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'pathTypes',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Typ odcinka</span>,
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

  return (<LocalTable<SegmentRowData> {...{ data, columns, onRowSelect, showColumns }} />)
}
