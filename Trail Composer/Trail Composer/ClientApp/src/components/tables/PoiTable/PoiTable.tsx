import React, { useContext } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import { ColumnDef, Row } from '@tanstack/react-table'

import { PoiRowData } from './PoiRowData';
import { AppContext, AppContextValueType } from '../../../App';
import { LocalTable } from '../LocalTable/LocalTable';
import { ColumnVisibility } from '../LocalTable/ColumnVisibility';

export function PoiTable({
  data,
  onDelete,
  onEdit,
  onRowSelect,
  onMoveUp,
  onMoveDown,
  showColumns
} : {
  data: PoiRowData[],
  onDelete?: (row: Row<PoiRowData>) => void | null,
  onEdit?: (row: Row<PoiRowData>) => void | null,
  onRowSelect?: (row: Row<PoiRowData>) => void | null,
  onMoveUp?: (row: Row<PoiRowData>) => void | null,
  onMoveDown?: (row: Row<PoiRowData>) => void | null,
  showColumns?: ColumnVisibility
}) {
  const appData = useContext<AppContextValueType>(AppContext);

  const columns = React.useMemo<ColumnDef<PoiRowData>[]>(
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
        accessorKey: 'latitude',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Szerokość geograficzna</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'longitude',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Długość geograficzna</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'country',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Kraj</span>,
        footer: (props: { column: { id: any; }; }) => props.column.id,
      },
      {
        accessorKey: 'poiTypes',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Typy POI</span>,
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

  return (<LocalTable<PoiRowData> {...{ data, columns, onRowSelect, showColumns }} />)
}