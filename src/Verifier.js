import React, { useState } from 'react';
import Web3 from 'web3';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import axios from 'axios';
import jsPDF from 'jspdf';

const Verifier = () => {
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificateId, setCertificateId] = useState('');
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [certificateDetails, setCertificateDetails] = useState({});

  // Web3 setup
  const web3 = new Web3(window.ethereum);

  // Import ABI and contract address
  const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "certificate_id",
          "type": "string"
        }
      ],
      "name": "certificateGenerated",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_certificate_id",
          "type": "string"
        }
      ],
      "name": "getCertificate",
      "outputs": [
        {
          "internalType": "string",
          "name": "_uid",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_candidate_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_course_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_org_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_cgpa_total",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_ipfs_hash",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_certificate_id",
          "type": "string"
        }
      ],
      "name": "isVerified",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
  const contractAddress = "0x0cf84e004aa54c389ecb0337230aec0ae88287c7";

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCertificateFile(file);
      setFileData(URL.createObjectURL(file));
    }
  };

  // Extract certificate data (Stubbed, replace with real extraction or backend call)
  const extractCertificateData = (file) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/extract_certificate', { file })
        .then(response => {
          resolve(response.data);
        })
        .catch(err => reject(err));
    });
  };

  // Handle certificate verification using certificate ID
  const handleCertificateVerification = async () => {
    if (!certificateId) {
      setValidationMessage('Please enter a valid Certificate ID!');
      return;
    }
    setLoading(true);
    try {
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const result = await contract.methods.isVerified(certificateId).call();

      if (result) {
        setValidationMessage('Certificate validated successfully!');
        // Fetch full certificate details
        const certificateData = await contract.methods.getCertificate(certificateId).call();
        const certificateDetails = {
          uid: certificateData[0],
          candidateName: certificateData[1],
          courseName: certificateData[2],
          orgName: certificateData[3],
          cgpa: certificateData[4],
          ipfsHash: certificateData[5]
        };
        setCertificateDetails(certificateDetails);
      } else {
        setValidationMessage('Invalid Certificate! Certificate might be tampered.');
      }
    } catch (error) {
      setValidationMessage('Error validating certificate. Please try again.');
    }
    setLoading(false);
  };

  // Handle certificate verification using the uploaded PDF
  const handlePdfVerification = async () => {
    if (!certificateFile) {
      setValidationMessage('Please upload a certificate first!');
      return;
    }
    setLoading(true);
    try {
      const extractedData = await extractCertificateData(certificateFile);
      const { uid, candidateName, courseName, orgName, cgpa } = extractedData;

      // Create certificate ID from extracted data
      const dataToHash = `${uid}${candidateName}${courseName}${orgName}${cgpa}`;
      const certificateId = web3.utils.sha3(dataToHash);
      setCertificateId(certificateId);

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const result = await contract.methods.isVerified(certificateId).call();
      setValidationMessage(result ? 'Certificate validated successfully!' : 'Invalid Certificate! Certificate might be tampered.');

      // Fetch full certificate details
      if (result) {
        const certificateData = await contract.methods.getCertificate(certificateId).call();
        const certificateDetails = {
          uid: certificateData[0],
          candidateName: certificateData[1],
          courseName: certificateData[2],
          orgName: certificateData[3],
          cgpa: certificateData[4],
          ipfsHash: certificateData[5]
        };
        setCertificateDetails(certificateDetails);
      }
    } catch (error) {
      setValidationMessage('Error validating certificate. Please try again.');
    }
    setLoading(false);
  };

  // Generate PDF with certificate details
  const generateCertificatePDF = () => {
    const doc = new jsPDF();

    // Add certificate details to the PDF
    doc.text("Certificate Details", 10, 10);
    doc.text(`UID: ${certificateDetails.uid}`, 10, 20);
    doc.text(`Candidate Name: ${certificateDetails.candidateName}`, 10, 30);
    doc.text(`Course Name: ${certificateDetails.courseName}`, 10, 40);
    doc.text(`Organization: ${certificateDetails.orgName}`, 10, 50);
    doc.text(`CGPA: ${certificateDetails.cgpa}`, 10, 60);
    doc.text(`IPFS Hash: ${certificateDetails.ipfsHash}`, 10, 70);

    // Save the PDF
    doc.save("certificate_details.pdf");
  };

  return (
    <div>
      <h2>Verifier: Validate Certificate</h2>

      <div>
        <h3>Verify Certificate using PDF</h3>
        <input type="file" accept="application/pdf" onChange={handleFileUpload} />
        <button onClick={handlePdfVerification} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify PDF Certificate'}
        </button>

        {fileData && (
          <div style={{ height: '750px' }}>
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.6.347/build/pdf.worker.min.js`}>
              <Viewer fileUrl={fileData} />
            </Worker>
          </div>
        )}

        {validationMessage && <p>{validationMessage}</p>}
      </div>

      <div>
        <h3>OR</h3>
        <h4>Verify Certificate using Certificate ID</h4>
        <input
          type="text"
          placeholder="Enter Certificate ID"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
        />
        <button onClick={handleCertificateVerification} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Certificate ID'}
        </button>

        {validationMessage && <p>{validationMessage}</p>}
      </div>

      <div>
        {certificateDetails.uid && (
          <div>
            <button onClick={generateCertificatePDF}>Download Certificate Details as PDF</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verifier;
