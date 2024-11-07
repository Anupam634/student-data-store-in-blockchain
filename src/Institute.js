import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import { contractABI, contractAddress } from './contract/ethereumconfig';
import { jsPDF } from 'jspdf';
import './Institute.css';

const Institute = () => {
  const [certificateDetails, setCertificateDetails] = useState({
    uid: '',
    candidateName: '',
    courseName: '',
    orgName: '',
    cgpa: '',
  });
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [ipfsHash, setIpfsHash] = useState('');
  const [certificateId, setCertificateId] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');

  // Initialize Web3 and Contract
  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
      setContract(contractInstance);
    } else {
      console.error('MetaMask is not installed');
    }
  }, []);

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        console.log(`Connected MetaMask account: ${accounts[0]}`);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  // Upload to Pinata
  const uploadToPinata = async (pdfFile) => {
    const pinataApiUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const apiKey = 'b0568259042e8532ab9d';  // Original Pinata API key
    const apiSecret = 'bb5b6f6e1486d3cf267225821e1a0f6b6047436f9bd90b7650a8515df743a189';  // Original Pinata API secret

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const response = await axios.post(pinataApiUrl, formData, {
        headers: {
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret,
        },
      });
      const ipfsHash = response.data.IpfsHash;
      setIpfsHash(ipfsHash);
      console.log(`File uploaded to Pinata: ${ipfsHash}`);
      return ipfsHash;
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
    }
  };

  // Generate Certificate PDF
  const generateCertificatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(20);
    doc.text('Certificate of Completion', 20, 30);

    // Add certificate details
    doc.setFontSize(16);
    doc.text(`UID: ${certificateDetails.uid}`, 20, 50);
    doc.text(`Name: ${certificateDetails.candidateName}`, 20, 60);
    doc.text(`Course: ${certificateDetails.courseName}`, 20, 70);
    doc.text(`Organization: ${certificateDetails.orgName}`, 20, 80);
    doc.text(`CGPA: ${certificateDetails.cgpa}`, 20, 90);

    const pdfOutput = doc.output('blob');
    setPdfFile(pdfOutput);
    return pdfOutput;
  };

  // Generate Certificate with MetaMask Transaction
  const handleGenerateCertificate = async () => {
    if (web3 && contract && account) {
      try {
        const pdfFile = generateCertificatePDF();
        const ipfsHash = await uploadToPinata(pdfFile);

        const dataToHash = `${certificateDetails.uid}${certificateDetails.candidateName}${certificateDetails.courseName}${certificateDetails.orgName}${certificateDetails.cgpa}`;
        const certificateId = Web3.utils.sha3(dataToHash);
        setCertificateId(certificateId);

        // Send transaction without custom fee, letting MetaMask set the gas price
        const receipt = await contract.methods
          .generateCertificate(
            certificateId,
            certificateDetails.uid,
            certificateDetails.candidateName,
            certificateDetails.courseName,
            certificateDetails.orgName,
            certificateDetails.cgpa,
            ipfsHash
          )
          .send({ from: account });

        // Capture transaction hash
        setTransactionHash(receipt.transactionHash);
        console.log(`Certificate successfully generated with Certificate ID: ${certificateId}`);
      } catch (error) {
        console.error('Error generating certificate:', error);
      }
    } else {
      alert('Please connect to MetaMask first');
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCertificateDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  return (
    <div>
      <h2>Institute Certificate Generation</h2>
      <button onClick={connectMetaMask}>
        {account ? `Connected: ${account}` : 'Connect to MetaMask'}
      </button>
      <form>
        <div>
          <label>UID:</label>
          <input type="text" name="uid" value={certificateDetails.uid} onChange={handleInputChange} />
        </div>
        <div>
          <label>Name:</label>
          <input type="text" name="candidateName" value={certificateDetails.candidateName} onChange={handleInputChange} />
        </div>
        <div>
          <label>Course Name:</label>
          <input type="text" name="courseName" value={certificateDetails.courseName} onChange={handleInputChange} />
        </div>
        <div>
          <label>Organization Name:</label>
          <input type="text" name="orgName" value={certificateDetails.orgName} onChange={handleInputChange} />
        </div>
        <div>
          <label>CGPA:</label>
          <input type="text" name="cgpa" value={certificateDetails.cgpa} onChange={handleInputChange} />
        </div>
        <button type="button" onClick={handleGenerateCertificate}>Generate Certificate</button>
      </form>

      {certificateId && <div>Certificate ID: {certificateId}</div>}

      {transactionHash && (
        <div>
          <h3>Transaction Details</h3>
          <a
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Transaction on sepolia Etherscan
          </a>
        </div>
      )}

      {pdfFile && (
        <div>
          <h3>Generated Certificate</h3>
          <embed src={URL.createObjectURL(pdfFile)} width="100%" height="600px" />
        </div>
      )}
    </div>
  );
};

export default Institute;
