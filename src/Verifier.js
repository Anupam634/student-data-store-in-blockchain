import React, { useState } from 'react';
import Web3 from 'web3';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import jsPDF from 'jspdf';

const Verifier = () => {
  const [certificateId, setCertificateId] = useState('');
  const [certificateDetails, setCertificateDetails] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize Web3 and Contract Details
  const web3 = new Web3(window.ethereum);
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
			},
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
		"name": "generateCertificate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "certificates",
		"outputs": [
			{
				"internalType": "string",
				"name": "uid",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "candidate_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "course_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "org_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "cgpa_total",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfs_hash",
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
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // Verify Certificate ID
  const handleCertificateVerification = async () => {
    if (!certificateId) {
      setValidationMessage('Please enter a valid Certificate ID!');
      return;
    }
    setLoading(true);

    try {
      const isVerified = await contract.methods.isVerified(certificateId).call();
      if (isVerified) {
        const certData = await contract.methods.getCertificate(certificateId).call();
        setCertificateDetails({
          uid: certData[0],
          candidateName: certData[1],
          courseName: certData[2],
          orgName: certData[3],
          cgpa: certData[4],
          ipfsHash: certData[5]
        });
        setValidationMessage('Certificate validated successfully!');
      } else {
        setValidationMessage('Invalid Certificate! It might be tampered or not exist.');
      }
    } catch (error) {
      setValidationMessage('Error validating certificate. Please try again.');
    }

    setLoading(false);
  };

  // Generate Certificate Details PDF
  const generateCertificatePDF = () => {
    const doc = new jsPDF();
    doc.text("Certificate Details", 10, 10);
    doc.text(`UID: ${certificateDetails.uid}`, 10, 20);
    doc.text(`Candidate Name: ${certificateDetails.candidateName}`, 10, 30);
    doc.text(`Course Name: ${certificateDetails.courseName}`, 10, 40);
    doc.text(`Organization: ${certificateDetails.orgName}`, 10, 50);
    doc.text(`CGPA: ${certificateDetails.cgpa}`, 10, 60);
    doc.text(`IPFS Hash: ${certificateDetails.ipfsHash}`, 10, 70);
    doc.save("certificate_details.pdf");
  };

  return (
    <div>
      <h2>Verifier: Validate Certificate</h2>
      <div>
        <h3>Verify Certificate using Certificate ID</h3>
        <input
          type="text"
          placeholder="Enter Certificate ID"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
        />
        <button onClick={handleCertificateVerification} disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Certificate'}
        </button>
      </div>
      
      {validationMessage && <p>{validationMessage}</p>}

      {certificateDetails && (
        <div>
          <h3>Certificate Details</h3>
          <p>UID: {certificateDetails.uid}</p>
          <p>Candidate Name: {certificateDetails.candidateName}</p>
          <p>Course Name: {certificateDetails.courseName}</p>
          <p>Organization: {certificateDetails.orgName}</p>
          <p>CGPA: {certificateDetails.cgpa}</p>
          <p>IPFS Hash: {certificateDetails.ipfsHash}</p>
          <button onClick={generateCertificatePDF}>Download Certificate Details as PDF</button>
        </div>
      )}
    </div>
  );
};

export default Verifier;
