import React from 'react';
import { CSVLink } from 'react-csv';
import {Button } from 'antd';


const ExportReportToCSV = ({csvData, fileName, category}) => {

    let result = csvData.map((data, index) => {
        return {
            'Sr No':index + 1,
            'Visit ID':data?.visitId,
            'Patient Name':data?.name,
            'D.O.B':data?.dob,
            'Visit Date':data?.visitDate,
            'Claim No': data?.claimNo,
            'Status':data?.status,
          }
    })


  return (
    <Button type="primary"> 
        <CSVLink data={result} filename={fileName}> <span className='text-white'>Download .csv</span></CSVLink> 
    </Button>
  )
}

export default ExportReportToCSV;