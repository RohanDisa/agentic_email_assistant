import { useState } from "react";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import ToDoList from './Components/ToDoList';
import ReplyAssistant from './components/ReplyAssistant';
import ChatDraft from './components/ChatDraft';
import EmailSearchChat from './Components/EmailSearchChat';
// Global styles to reset any default margins/padding
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
  
  html {
    margin: 0;
    padding: 0;
  }
`;

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const scaleHover = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.05); }
`;

// Styled Components
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #581c87 0%, #1e3a8a 50%, #312e81 100%);
  padding: 1.5rem 0 3rem 0;
  margin: 0;
  width: 100vw;
  box-sizing: border-box;
  overflow-x: hidden;
  
  @media (min-width: 768px) {
    padding: 2rem 0 4rem 0;
  }
`;

const BackgroundElement = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
`;

const FloatingOrb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(48px);
  animation: ${pulse} 4s ease-in-out infinite;
  
  &.orb-1 {
    top: -10rem;
    right: -8rem;
    width: 20rem;
    height: 20rem;
    background-color: rgba(168, 85, 247, 0.2);
  }
  
  &.orb-2 {
    top: 20rem;
    left: -8rem;
    width: 24rem;
    height: 24rem;
    background-color: rgba(59, 130, 246, 0.2);
    animation-delay: 1s;
  }
  
  &.orb-3 {
    bottom: 5rem;
    right: 5rem;
    width: 16rem;
    height: 16rem;
    background-color: rgba(99, 102, 241, 0.2);
    animation-delay: 2s;
  }
`;

const MainContainer = styled.div`
  max-width: 90rem;
  margin: 0 auto;
  position: relative;
  z-index: 10;
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
  
  @media (max-width: 1200px) {
    max-width: 75rem;
    padding: 0 0.75rem;
  }
  
  @media (max-width: 992px) {
    max-width: none;
    width: 100%;
    padding: 0 0.5rem;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const TitleWrapper = styled.div`
  display: inline-block;
  padding: 4px;
  background: linear-gradient(to right, #c084fc, #60a5fa);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
`;

const TitleContainer = styled.div`
  background-color: #111827;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  background: linear-gradient(to right, #c084fc, #60a5fa, #818cf8);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #d1d5db;
  font-size: 1.125rem;
  margin-top: 1rem;
  max-width: 32rem;
  margin-left: auto;
  margin-right: auto;
`;

const TabNavigation = styled.nav`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
  
  @media (min-width: 768px) {
    gap: 1rem;
    padding: 0;
  }
`;

const TabButton = styled.button`
  position: relative;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid;
  backdrop-filter: blur(8px);
  cursor: pointer;
  
  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
  }
  
  &:hover {
    transform: scale(1.05);
  }
  
  ${props => props.$active ? `
    background: linear-gradient(to right, #9333ea, #2563eb);
    color: white;
    box-shadow: 0 25px 50px -12px rgba(168, 85, 247, 0.25);
    border-color: #c084fc;
  ` : `
    background-color: rgba(255, 255, 255, 0.1);
    color: #e5e7eb;
    border-color: rgba(255, 255, 255, 0.2);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      color: white;
    }
  `}
`;

const MainContent = styled.main`
  backdrop-filter: blur(24px);
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  background: linear-gradient(to right, rgba(147, 51, 234, 0.05), rgba(37, 99, 235, 0.05));
  padding: 4px;
`;

const ContentContainer = styled.div`
  background-color: rgba(17, 24, 39, 0.5);
  border-radius: 1.5rem;
  min-height: 300px;
  backdrop-filter: blur(8px);
  padding: 1.5rem;
  
  @media (min-width: 768px) {
    min-height: 400px;
    padding: 2rem;
  }
`;

const ContentBox = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.1);
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 3rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
`;

const FeatureIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
  color: ${props => props.color};
`;

const FeatureTitle = styled.h3`
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
`;

const Footer = styled.footer`
  text-align: center;
  margin-top: 4rem;
`;

const FooterContent = styled.div`
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: inline-block;
`;

const FooterText = styled.p`
  color: #9ca3af;
  font-size: 0.875rem;
  
  .heart {
    color: #f87171;
  }
  
  .vite {
    color: #c084fc;
    font-weight: 600;
  }
  
  .react {
    color: #60a5fa;
    font-weight: 600;
  }
`;

// Component Content Styles
const ComponentContent = styled.div`
  padding: 1.5rem;
  text-align: center;
  color: #9ca3af;
`;

const ComponentTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ComponentDescription = styled.p`
  /* Default paragraph styling */
`;

// Mock components for demonstration
// const ToDoList = () => (
//   <ComponentContent>
//     <ComponentTitle>To-Do List</ComponentTitle>
//     <ComponentDescription>Your tasks will appear here</ComponentDescription>
//   </ComponentContent>
// );

// const ReplyAssistant = () => (
//   <ComponentContent>
//     <ComponentTitle>Reply Assistant</ComponentTitle>
//     <ComponentDescription>AI-powered email replies</ComponentDescription>
//   </ComponentContent>
// );

// const ChatDraft = () => (
//   <ComponentContent>
//     <ComponentTitle>Chat to Draft</ComponentTitle>
//     <ComponentDescription>Convert conversations to drafts</ComponentDescription>
//   </ComponentContent>
// );

// const EmailSearchChat = () => (
//   <ComponentContent>
//     <ComponentTitle>Ask About Emails</ComponentTitle>
//     <ComponentDescription>Search and query your emails</ComponentDescription>
//   </ComponentContent>
// );

const TABS = [
  { name: "✅ To-Dos", component: <ToDoList /> },
  { name: "✨ Reply Assistant", component: <ReplyAssistant /> },
  { name: "💬 Chat to Draft", component: <ChatDraft /> },
  { name: "🔍 Ask About Emails", component: <EmailSearchChat /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <GlobalStyle />
      <AppContainer>
      {/* Animated background elements */}
      <BackgroundElement>
        <FloatingOrb className="orb-1" />
        <FloatingOrb className="orb-2" />
        <FloatingOrb className="orb-3" />
      </BackgroundElement>
      
      <MainContainer>
        <Header>
          <TitleWrapper>
            <TitleContainer>
              <Title>Inbox Companion</Title>
            </TitleContainer>
          </TitleWrapper>
          <Subtitle>
            Your intelligent assistant for organizing emails, managing tasks, and crafting perfect responses
          </Subtitle>
        </Header>

        {/* Tab Navigation */}
        <TabNavigation>
          {TABS.map((tab, idx) => (
            <TabButton
              key={idx}
              onClick={() => setActiveTab(idx)}
              $active={activeTab === idx}
            >
              {tab.name}
            </TabButton>
          ))}
        </TabNavigation>

        {/* Main Content */}
        <MainContent>
          <ContentWrapper>
            <ContentContainer>
              <ContentBox>
                {TABS[activeTab].component}
              </ContentBox>
            </ContentContainer>
          </ContentWrapper>
        </MainContent>

        {/* Feature Cards */}
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon color="#c084fc">⚡</FeatureIcon>
            <FeatureTitle>Lightning Fast</FeatureTitle>
            <FeatureDescription>Process emails and tasks with incredible speed and efficiency</FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon color="#60a5fa">🤖</FeatureIcon>
            <FeatureTitle>AI-Powered</FeatureTitle>
            <FeatureDescription>Smart suggestions and automated responses using advanced AI</FeatureDescription>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon color="#818cf8">🔒</FeatureIcon>
            <FeatureTitle>Secure</FeatureTitle>
            <FeatureDescription>Your data is protected with enterprise-grade security</FeatureDescription>
          </FeatureCard>
        </FeatureGrid>

        
      </MainContainer>
    </AppContainer>
    </>
  );
}