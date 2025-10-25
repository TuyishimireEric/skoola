
import React, { ChangeEvent } from 'react'
import Pagination from '@mui/material/Pagination';
interface Props{
    count:number,
    ActivePage:number,
    onPageChange:(event: ChangeEvent<unknown>,page:number)=>void;
}
const PaginationTab = ({count,onPageChange,ActivePage}:Props) => {

  return (
<Pagination  count={count} variant="outlined" size='small' page={ActivePage} onChange={onPageChange}   sx={{
    '& .MuiPaginationItem-root': {
      color:'#965f2c',
      borderColor:'#965f2c',
    },
    '& .Mui-selected': {
      backgroundColor:(theme)=>`${theme.palette.primary.light}`,
      color: 'white',
    },
    '& .MuiPaginationItem-root:hover': {
      backgroundColor:(theme)=>`${theme.palette.primary.contrastText}`,
      color:'white'
    },
  
  }} />)
}

export default PaginationTab