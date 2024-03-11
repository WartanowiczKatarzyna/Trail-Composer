import React, { useContext } from 'react';

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender, Column, Row
} from '@tanstack/react-table'

import TablePaginationActions from '../actions';
import { RowData } from './makeData';
import {Table as ReactTable} from "@tanstack/table-core/build/lib/types";
import InputBase from "@mui/material/InputBase";
import { AppContext, AppContextValueType } from '../../../App';

export  function PoiTable({
  data,
  onDelete,
  onEdit,
  onRowSelect,
  onMoveUp,
  onMoveDown
} : {
  data: RowData[],
  onDelete?: (row: Row<RowData>) => void | null,
  onEdit?: (row: Row<RowData>) => void | null,
  onRowSelect?: (row: Row<RowData>) => void | null,
  onMoveUp?: (row: Row<RowData>) => void | null,
  onMoveDown?: (row: Row<RowData>) => void | null
}) {
  const appData = useContext<AppContextValueType>(AppContext);

  const columns = React.useMemo<ColumnDef<RowData>[]>(
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

  return (<LocalTable {...{ data, columns, onRowSelect }} />)
}

function LocalTable({
  data,
  columns,
  onRowSelect
}: {
  data: RowData[]
  columns: ColumnDef<RowData>[],
  onRowSelect?: (row: Row<RowData>) => void | null
}) {
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    // Pipeline
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => row.id.toString(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    //
    debugTable: true,
  })

  const { pageSize, pageIndex } = table.getState().pagination;

  return (
    <div>
      <Box sx={{ width: '100%' }}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableCell key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanFilter() ? (
                              <div>
                                <Filter column={header.column} table={table} />
                              </div>
                            ) : null}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map(row => {
                return (
                  <TableRow key={row.id} 
                  hover = {!!onRowSelect}
                  onClick={() => onRowSelect && onRowSelect(row)}
                  role="checkbox"
                  aria-checked={row.getIsSelected()}
                  tabIndex={-1}
                  selected={row.getIsSelected()}
                  sx={ onRowSelect && { cursor: 'pointer' }}
                  >
                    {row.getVisibleCells().map(cell => {
                      return (
                        <TableCell key={cell.id} align={'center'}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={pageSize}
          page={pageIndex}
          slotProps={{
            select: {
              inputProps: { 'aria-label': 'Liczba widocznych wierszy' },
              native: true,
            },
          }}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
          onRowsPerPageChange={e => {
            const size = e.target.value ? Number(e.target.value) : 10
            table.setPageSize(size)
          }}
          ActionsComponent={TablePaginationActions}
        />
        <pre>{JSON.stringify(table.getState().pagination, null, 2)}</pre>
        <div>
          {Object.keys(rowSelection).length} of{' '}
          {table.getPreFilteredRowModel().rows.length} Total Rows Selected
        </div>
        <div>
          <button
            className="border rounded p-2 mb-2"
            onClick={() =>
              console.info(
                'table.getSelectedRowModel().flatRows',
                table.getSelectedRowModel().flatRows
              )
            }
          >
            Log table.getSelectedRowModel().flatRows
          </button>
        </div>
      </Box>
    </div>
  )
}

function Filter({
  column,
  table,
}: {
  column: Column<any, any>
  table: ReactTable<any>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  if(column.id === 'actions') return (<div></div>)

  return typeof firstValue === 'number' ? (
    <div className="d-flex table-filter-space-x-2">
      <InputBase
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="table-filter-w-24 table-filter-border-shadow-rounded"
      />
      <InputBase
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={e =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="table-filter-w-24 table-filter-border-shadow-rounded"
        inputProps={{ 'aria-label': 'search' }}
      />
    </div>
  ) : (
    <InputBase
      value={(columnFilterValue ?? '') as string}
      onChange={e => column.setFilterValue(e.target.value)}
      placeholder={`Wyszukaj...`}
      className="table-filter-w-36 table-filter-border-shadow-rounded"
      inputProps={{ 'aria-label': 'search' }}
    />
  )
}
