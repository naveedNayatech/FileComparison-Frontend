import React from 'react';
import { CSVLink } from 'react-csv';
import {Button } from 'antd';


const ExportReportToCSV = ({csvData, fileName, category}) => {

    let result = csvData.map((data, index) => {

        return {
            'Sr No':index + 1,
            'ID':data?.ID,
            'Patient Name':data?.PatientName,
            'D.O.B':data?.DOB,
            'Svc Date': data?.SvcDate,
            'Comment':data?.comment,
            'ECW Claim No.':data?.ecwClaimNo,
            'Category': category
          }
    })


  return (
    <Button type="primary"> 
        <CSVLink data={result} filename={fileName}> <span className='text-white'>Download .csv</span></CSVLink> 
    </Button>
  )
}

export default ExportReportToCSV;