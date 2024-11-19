import { useState, useEffect } from 'react';
import { Upload, Button, Card, Form, message, Space, Row, Col, Table, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ExportHospitalReportToCSV from '../ExportHospitalReportToCSV';
import { CheckCircleOutlined, ExclamationCircleOutlined, CopyOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import '../FileUpload.css';
import axios from 'axios';

const HospitalFiles = () => {
  const [pmdFile, setPMDFile] = useState(null);
  const [ecwFile, setEcwFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [resultData, setResultData] = useState([]);
  const [stats, setStats] = useState();
  const [selectedCategory, setSelectedCategory] = useState('matchedRecords'); 

  useEffect(() => {
    if(pmdFile && ecwFile){
      handleSubmit();
    }
  }, [selectedCategory])
  

  const handleReferenceChange = ({ fileList }) => {
    setPMDFile(fileList[0]?.originFileObj || null); // Correctly set the file object
  };

  const handleEcwChange = ({ fileList }) => {
    setEcwFile(fileList[0]?.originFileObj || null); // Correctly set the file object
  };

  const handleSubmit = async () => {
    if (!pmdFile || !ecwFile) {
      message.error('Please upload both files before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('pmdFile', pmdFile);
    formData.append('ecwFile', ecwFile);

    setLoading(true);
    const startTime = Date.now();

    try {
      const response = await axios.post('http://localhost:3000/api/hospital/compare', formData, {
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
      title: 'Visit ID',
      dataIndex: 'visitId',
      key: 'visitId',
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
        title: 'Visit Date',
        dataIndex: 'visitDate',
        key: 'visitDate',
      },
      {
        title: 'Charges in PMD',
        dataIndex: 'chargesFound',
        key: 'chargesFound',
      },
      // {
      //   title: 'CPT Found in ECW',
      //   dataIndex: 'foundCPTs',
      //   key: 'foundCPTs',
      // },
      {
        title: 'Claim No',
        dataIndex: 'claimNo',
        key: 'claimNo',
      },
      {
        title: 'PMD Provider',
        dataIndex: 'pmdProvider',
        key: 'pmdProvider',
      },
      {
        title: 'ECW Provider',
        dataIndex: 'ecwProvider',
        key: 'ecwProvider',
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status'
      },
  ];




  const data = resultData && resultData.map((data, index) => ({
    key: index + 1,
    Sr: index + 1,
    visitId: data?.visitId,
    patientName: data?.name, 
    DOB: data?.dob,
    visitDate: data?.visitDate,
    chargesFound: data?.charges && data?.charges.length > 0 ? (
      <span>
          {data?.charges.map((charge, index) => (
              <span key={index}>
                  {charge}
                  {index < data?.charges.length - 1 && ', '} {/* Add comma except for the last item */}
              </span>
          ))}
      </span>
  ) : 'N/A',
//   foundCPTs: data?.foundCPTs && data?.foundCPTs.length > 0 ? (
//     <span>
//         {data?.foundCPTs.map((charge, index) => (
//             <span key={index}>
//                 {charge}
//                 {index < data?.foundCPTs.length - 1 && ', '} {/* Add comma except for the last item */}
//             </span>
//         ))}
//     </span>
// ) : 'N/A',
    claimNo: data?.claimNo,
    pmdProvider: data?.pmdProvider || 'N/A',
    ecwProvider: data?.ecwProvider || 'N/A',
    status: data?.status,
  }));

  return (
    <>
    <div className="app-container">
      <Card title="File Comparison" className="card-container" headStyle={{ color: 'white' }}>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Form.Item label={<span className="custom-label">Reference File (PMD)</span>}>
                <Upload
                   accept=".xlsx, .csv"
                  name="pmdFile"
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
                   accept=".xlsx, .csv"
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
                  <Button htmlType="button" onClick={() => { setPMDFile(null); setEcwFile(null); setResultData([])}}>
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
            <h1 className="card-body">{stats?.matchedCount}</h1>
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
                <ExclamationCircleOutlined /> Mistake Records
              </span>
            }
            className="mistake-card"
            style={{ textAlign: 'center', width: '250px' }}
          >
            <h1 className="card-body">{stats?.mistakesCount}</h1>
          </Card>
        </Col>
        &nbsp;&nbsp;&nbsp;
        <Col>
          <Card
            title={
              <span className="card-title">
                <ExclamationCircleOutlined /> Duplicate Records
              </span>
            }
            className="duplicate-card"
            style={{ textAlign: 'center', width: '250px' }}
          >
            <h1 className="card-body">{stats?.duplicatesCount}</h1>
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
            className={selectedCategory === 'matchedRecords' ? 'active' : ''}
            onClick={() => setSelectedCategory('matchedRecords')}
          >
            Completely Matched
          </button>
          
          <button
            className={selectedCategory === 'missingRecords' ? 'active' : ''}
            onClick={() => setSelectedCategory('missingRecords')}
          >
            Missing Records
          </button>

          <button
            className={selectedCategory === 'mistakeRecords' ? 'active' : ''}
            onClick={() => setSelectedCategory('mistakeRecords')}
          >
            Mistakes Records
          </button>

          <button
            className={selectedCategory === 'duplicateRecords' ? 'active' : ''}
            onClick={() => setSelectedCategory('duplicateRecords')}
          >
            Duplicate Records
          </button>
        </div>
        <div> 
          {/* <Button type='primary'>Download .xlsx</Button> */}
          <ExportHospitalReportToCSV
            csvData={resultData}
            fileName={'Billing Comparison Report '+ moment().format('MM/DD/YYYY')+'.csv'}
            category={selectedCategory}
            />
        </div>
      </div>


        <Table
          dataSource={data}
          columns={columns}
          rowKey="visitId"
          pagination={false}
        />
      </div>
      )}
    </>
  );
};

export default HospitalFiles;
