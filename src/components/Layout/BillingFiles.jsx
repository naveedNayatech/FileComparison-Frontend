import { useState, useEffect } from 'react';
import { Upload, Button, Card, Form, message, Space, Row, Col, Table, Spin } from 'antd';
import { TeamOutlined, UploadOutlined } from '@ant-design/icons';
import ExportReportToCSV from '../ExportReportToCSV';
import { CheckCircleOutlined, ExclamationCircleOutlined, CopyOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import '../FileUpload.css';
import axios from 'axios';

const BillingFiles = () => {
  const [epicFile, setEPICFile] = useState(null);
  const [ecwFile, setEcwFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [resultData, setResultData] = useState([]);
  const [stats, setStats] = useState();
  const [selectedCategory, setSelectedCategory] = useState('completelyMatched'); 

  useEffect(() => {
    if(epicFile && ecwFile){
      handleSubmit();
    }
  }, [selectedCategory])
  

  const handleReferenceChange = ({ fileList }) => {
    setEPICFile(fileList[0]?.originFileObj || null); // Correctly set the file object
  };

  const handleEcwChange = ({ fileList }) => {
    setEcwFile(fileList[0]?.originFileObj || null); // Correctly set the file object
  };

  const handleSubmit = async () => {
    if (!epicFile || !ecwFile) {
      message.error('Please upload both files before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('epicFile', epicFile);
    formData.append('ecwFile', ecwFile);

    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.post('http://localhost:3000/api/compare', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      if (response) {
        setResultData(response?.data?.[selectedCategory]);
        setStats(response?.data?.stats);
        message.success('Files processed successfully');
      } else {
        message.error('Error processing files');
      }
    } catch (error) {
      message.error('An error occurred while processing the files');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Sr. No.',
      dataIndex: 'Sr',
      key: 'Sr',
    },
    {
      title: 'ID',
      dataIndex: 'ID',
      key: 'ID',
    },
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Date of Birth (DOB)',
      dataIndex: 'DOB',
      key: 'DOB',
    },
    {
      title: 'Svc Date',
      dataIndex: 'Svc',
      key: 'Svc',
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment'
    },
    {
      title: 'ECW Claim No.',
      dataIndex: 'ecwClaimNo',
      key: 'ecwClaimNo',
    },
  ];

  // Conditionally add the CPT Code column
if (selectedCategory === "patientBilling") {
  columns.splice(6, 0, {
    title: 'CPT Code',
    dataIndex: 'CPT',
    key: 'CPT',
  });
}


  const data = resultData && resultData.map((data, index) => ({
    key: index + 1,
    Sr: index + 1,
    ID: data?.ID,
    patientName: data?.PatientName?.lastName +' '+ data?.PatientName?.firstName, 
    Svc: data?.SvcDate,
    DOB: data?.DOB,
    CPT: data?.CPTCode,
    comment: data?.comment,
    ecwClaimNo: data?.ecwClaimNo
  }));

  return (
    <>
    <div className="app-container">
      <Card title="File Comparison" className="card-container" headStyle={{ color: 'white' }}>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Form.Item label={<span className="custom-label">Reference File (EPIC)</span>}>
                <Upload
                  accept='.xlsx'
                  name="epicFile"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleReferenceChange}
                  itemRender={(originNode, file) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#FFF', fontSize: '14px', marginRight: '10px' }}>
                        {originNode !== null && file?.name}
                      </span>
                    </div>
                  )}
                >
                  <Button icon={<UploadOutlined />}>Upload Reference File</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label={<span className="custom-label">ECW File</span>}>
                <Upload
                  accept=".xlsx"
                  name="ecwFile"
                  maxCount={1}
                  beforeUpload={() => false}
                  onChange={handleEcwChange}
                  onRemove={() => setEcwFile(null)}
                  itemRender={(originNode, file) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ color: '#FFF', fontSize: '14px', marginRight: '10px' }}>
                        {file?.name}
                      </span>
                    </div>
                  )}
                >
                  <Button icon={<UploadOutlined />}>Upload ECW File</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Submit
                  </Button>
                  <Button htmlType="button" onClick={() => { setEPICFile(null); setEcwFile(null); setResultData([])}}>
                    Reset
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        {responseTime && !loading && (
          <p style={{color: 'white', margin: '0px', padding: '0px', float: 'right'}}>API Response Time: {(responseTime / 1000).toFixed(2)} secs</p>
        )}
      </Card>
      

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && resultData?.length > 0 && (
        <Row style={{marginTop: '20px'}}>
        <Col>
          <Card
            title={
              <span className="card-title">
                <CheckCircleOutlined /> Completely Matched Records
              </span>
            }
            className="completely-matched-card"
            style={{ textAlign: 'center', width: '250px' }}
          >
            <h1 className="card-body">{stats?.completelyMatchedCount}</h1>
          </Card>
        </Col>
        &nbsp;&nbsp;&nbsp;
        <Col>
          <Card
            title={
              <span className="card-title">
                <ExclamationCircleOutlined /> Missing Records
              </span>
            }
            className="missing-card"
            style={{ textAlign: 'center', width: '250px' }}
          >
            <h1 className="card-body">{stats?.missingCount}</h1>
          </Card>
        </Col>
        &nbsp;&nbsp;&nbsp;
        <Col>
          <Card
            title={
              <span className="card-title">
                <CopyOutlined /> Duplicate Records
              </span>
            }
            className="duplicate-card"
            style={{ textAlign: 'center', width: '250px' }}
          >
            <h1 className="card-body">{stats?.duplicateCount}</h1>
          </Card>
        </Col>
        &nbsp;&nbsp;&nbsp;
        <Col>
          <Card
            title={
              <span className="card-title">
                <CloseCircleOutlined /> Mistakes
              </span>
            }
            className="mistake-card"
            style={{ textAlign: 'center', width: '250px' }}
          >
            <h1 className="card-body">{stats?.mistakeCount}</h1>
          </Card>
        </Col>
        &nbsp;&nbsp;&nbsp;
        <Col>
          <Card
            title={
              <span className="card-title">
                <TeamOutlined /> Patient Billing
              </span>
            }
            className="billing-card"
            style={{ textAlign: 'center', width: '250px' }}
          >
            <h1 className="card-body">{stats?.patientBillingCount}</h1>
          </Card>
        </Col>
      </Row>
      )}
    </div>
    
    

    {!loading && resultData?.length > 0 &&  (
      <div className="tableSection">
      <div className="row-display">  
        <h3>Comparison Result</h3>
        <div className="tabs">
          <button
            className={selectedCategory === 'completelyMatched' ? 'active' : ''}
            onClick={() => setSelectedCategory('completelyMatched')}
          >
            Completely Matched
          </button>
          <button
            className={selectedCategory === 'mistakes' ? 'active' : ''}
            onClick={() => setSelectedCategory('mistakes')}
          >
            Mistakes
          </button>
          <button
            className={selectedCategory === 'duplicates' ? 'active' : ''}
            onClick={() => setSelectedCategory('duplicates')}
          >
            Duplicate
          </button>
          <button
            className={selectedCategory === 'missing' ? 'active' : ''}
            onClick={() => setSelectedCategory('missing')}
          >
            Missing
          </button>
          <button
            className={selectedCategory === 'patientBilling' ? 'active' : ''}
            onClick={() => setSelectedCategory('patientBilling')}
          >
            Patient Billing
          </button>
         
        </div>
        <div> 
          {/* <Button type='primary'>Download .xlsx</Button> */}
          <ExportReportToCSV
            csvData={resultData}
            fileName={'File Comparison Report '+ moment().format('MM/DD/YYYY')+'.csv'}
            category={selectedCategory}
            />
        </div>
      </div>


        <Table
          dataSource={data}
          columns={columns}
          rowKey="patientName"
          pagination={false}
        />
      </div>
      )}
    </>
  );
};

export default BillingFiles;
