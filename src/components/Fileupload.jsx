import { useState} from 'react';
import './FileUpload.css';
import BillingFiles from './Layout/BillingFiles';
import HospitalFiles from './Layout/HospitalFiles';
import {Select} from 'antd';

const FileUpload = () => {
  const [billingCategory, setBillingCategory] = useState('Billing'); 

  const handleChange = (value) => {
    setBillingCategory(value);
  };

  return (
    <>
    <div className="row-display" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '50%',
        margin: 'auto',
      }}>
        <h2 style={{color: 'white'}}>{billingCategory} Files Comparison</h2>
        <Select
          defaultValue="Billing"
          style={{
            width: 180,
          }}
          onChange={handleChange}
          options={[
            {
              value: 'Billing',
              label: 'Billing Files',
            },
            {
              value: 'Hospital',
              label: 'Hospital Files',
            },
          ]}
        />
      </div>

      {billingCategory === 'Billing' ? <BillingFiles /> : <HospitalFiles /> }
    </>
  )
};

export default FileUpload;
