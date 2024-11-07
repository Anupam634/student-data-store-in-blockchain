import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import instituteLogo from './assets/institute_logo.png';
import companyLogo from './assets/company_logo.jpg';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const Subtitle = styled.h2`
  margin-bottom: 40px;
`;

const ImageButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const ImageButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 230px;
    margin-bottom: 10px;
  }

  &:hover {
    opacity: 0.8;
  }
`;

function Home() {
  const navigate = useNavigate();

  const handleInstituteClick = () => {
    sessionStorage.setItem('profile', 'Institute');
    navigate('/login');
  };

  const handleVerifierClick = () => {
    sessionStorage.setItem('profile', 'Verifier');
    navigate('/login');
  };

  return (
    <Container>
      <Title>Certificate Validation System</Title>
      <Subtitle>Select Your Role</Subtitle>
      <ImageButtonContainer>
        <ImageButton onClick={handleInstituteClick}>
          <img src={instituteLogo} alt="Institute Logo" />
          <button>Institute</button>
        </ImageButton>
        <ImageButton onClick={handleVerifierClick}>
          <img src={companyLogo} alt="Company Logo" />
          <button>Verifier</button>
        </ImageButton>
      </ImageButtonContainer>
    </Container>
  );
}

export default Home;
