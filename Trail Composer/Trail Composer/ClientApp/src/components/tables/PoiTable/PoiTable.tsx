import React, { useContext, useEffect, useRef } from 'react';

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import Paper from '@mui/material/Paper'
import { Checkbox } from '@mui/material';

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender, Column,
} from '@tanstack/react-table'

import TablePaginationActions from '../actions';
import { makeData, RowData } from './makeData';
import {Table as ReactTable} from "@tanstack/table-core/build/lib/types";
import InputBase from "@mui/material/InputBase";
import { AppContext, AppContextValueType } from '../../../App';

export  function PoiTable() {
  const appData = useContext<AppContextValueType>(AppContext);
  const rowNumFaker = useRef(100000);
  
  function flattenData(freshData: RowData[]): RowData[] {    
    return freshData.map(row => {
      return {
        name: row.name,
        longitude: row.longitude,
        latitude: row.latitude,
        countryId: row.countryId,
        subRows: row.subRows,
        country: appData?.CountryNamesMap?.get(row.countryId) || 'nieznany kraj',
        poiTypeIds: row.poiTypeIds,
        poiTypes: row.poiTypeIds.map(poiTypeId => appData?.PoiTypesMap?.get(poiTypeId)).join(', ')
      };
    });
  };

  const [data, setData] = React.useState(() => flattenData(makeData(rowNumFaker.current)));
  const refreshData = () => setData(() => flattenData(makeData(rowNumFaker.current)));

  const rerender = React.useReducer(() => ({}), {})[1];

  useEffect(() => {
    console.log(appData);
    console.log(appData?.POITypes);
    console.log(appData?.Countries);
    
    setData(() => flattenData(makeData(rowNumFaker.current)));
  }, [appData]);

  const columns = React.useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        accessorKey: 'name',
        cell: (info: { getValue: () => any; }) => info.getValue(),
        header: () => <span>Nazwa</span>,
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
        id: 'select',
        cell: ({row}) => <Checkbox
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          indeterminate={row.getIsSomeSelected()}
          onChange={row.getToggleSelectedHandler()}
          sx={{
            color: "#141614",
            '&.Mui-checked': {
              color: "#0E901B",
              },
          }}
        />,
        header: () => <span>Select</span>,
      }
    ],
    [appData]
  );
  
  /*data.forEach(row => {
    console.log(row);
  });*/

  return (
    <>
      <LocalTable {...{ data, columns }} />
      <hr />
      <div>
        <button onClick={() => rerender()}>Force Rerender</button>
      </div>
      <div>
        <button onClick={() => refreshData()}>Refresh Data</button>
      </div>
    </>
  )
}

function LocalTable({
  data,
  columns,
}: {
  data: RowData[]
  columns: ColumnDef<RowData>[]
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
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    //
    debugTable: true,
  })

  const { pageSize, pageIndex } = table.getState().pagination

  return (
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <TableCell key={cell.id}>
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
