import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

// Animations
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Component Content Styles
const ComponentContent = styled.div`
  padding: 1.5rem;
  text-align: left;
  color: #9ca3af;
`;

const ComponentTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
  text-align: center;
`;

const ComponentDescription = styled.p`
  text-align: center;
  margin-bottom: 2rem;
`;

// Reply Draft-specific styles
const DraftList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
`;

const DraftItem = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${slideIn} 0.3s ease-out;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  cursor: pointer; // Indicate it's clickable

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  ${props => props.isExpanded && `
    border-color: #3b82f6; // Highlight when expanded
    background-color: rgba(255, 255, 255, 0.08);
  `}
`;

const DraftHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const MessageId = styled.span`
  color: #6b7280;
  font-size: 0.75rem;
  font-family: monospace;
`;

const ReplyStatus = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
  font-size: 0.75rem;
  background-color: ${props => props.needsReply ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'};
  color: ${props => props.needsReply ? '#ef4444' : '#22c55e'};
`;

const DraftContent = styled.div`
  color: #e5e7eb;
  font-size: 0.875rem;
  line-height: 1.5;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 0.375rem;
  border-left: 3px solid #3b82f6;
  margin: 0.5rem 0;
  white-space: pre-wrap;
  user-select: text; /* Allow text selection within the draft */
`;

const DraftMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
`;

// New styles for the original message details
const OriginalMessageDetails = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  animation: ${fadeIn} 0.5s ease-out;

  h4 {
    color: white;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: #b0b0b0;
    white-space: pre-wrap; /* Preserve formatting for body */
  }

  strong {
    color: #e5e7eb;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #9ca3af;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #f87171;
  padding: 2rem;
  background-color: rgba(248, 113, 113, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(248, 113, 113, 0.2);
`;

const ReplyAssistant = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDraftId, setExpandedDraftId] = useState(null); // New state for expanded item

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/gmail/reply_drafts');
      if (!response.ok) {
        throw new Error(`Failed to fetch reply drafts: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("Fetched data:", data); // For debugging: check the structure of data
      setDrafts(data.reply_drafts); // Assuming your backend returns { reply_drafts: [...] }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching drafts:", err.message);
      // Fallback data for demonstration if API fails
      setDrafts([
        {
          id: 1,
          message_id: "19811dc22e0d0e77",
          reply_draft: "Thank you for your inquiry. I'll review your request and get back to you within 24 hours.",
          needs_reply: true,
          processed_at: "2024-01-15T10:30:00Z",
          sender: "Alice Smith <alice@example.com>",
          subject: "Regarding your project proposal",
          body: "Hi,\n\nI hope this email finds you well. I'm writing to follow up on the project proposal we discussed last week. Could you please provide an update on its status?\n\nBest regards,\nAlice"
        },
        {
          id: 2,
          message_id: "29822ec33f1e1f88",
          reply_draft: "Hi there! I've received your application and will process it shortly. You should hear back from us by the end of the week.",
          needs_reply: true,
          processed_at: "2024-01-14T14:20:00Z",
          sender: "Job Applications <jobs@company.com>",
          subject: "Your application for Software Engineer",
          body: "Dear Applicant,\n\nWe have received your application for the Software Engineer position. Our team will review your qualifications and get back to you soon.\n\nThank you for your interest.\n\nSincerely,\nThe HR Team"
        },
        {
          id: 3,
          message_id: "39833fd44g2f2g99",
          reply_draft: "Great to hear from you! Let me check our availability for the meeting you requested and I'll send you some time slots.",
          needs_reply: false,
          processed_at: "2024-01-12T09:15:00Z",
          sender: "Bob Johnson <bob@anotherco.com>",
          subject: "Meeting request for Q3 review",
          body: "Hi,\n\nCould we schedule a meeting next week to discuss the Q3 review? Please let me know your availability.\n\nThanks,\nBob"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  // Toggle expanded state
  const toggleExpand = (id) => {
    setExpandedDraftId(expandedDraftId === id ? null : id);
  };

  if (loading) {
    return (
      <ComponentContent>
        <ComponentTitle>AI Reply Drafts</ComponentTitle>
        <LoadingSpinner>Loading your reply drafts...</LoadingSpinner>
      </ComponentContent>
    );
  }

  if (error && drafts.length === 0) {
    return (
      <ComponentContent>
        <ComponentTitle>AI Reply Drafts</ComponentTitle>
        <ErrorMessage>
          Error loading reply drafts: {error}
        </ErrorMessage>
      </ComponentContent>
    );
  }

  return (
    <ComponentContent>
      <ComponentTitle>AI Reply Drafts</ComponentTitle>
      {drafts.length === 0 ? (
        <ComponentDescription>No reply drafts found. AI-generated replies will appear here once emails are analyzed!</ComponentDescription>
      ) : (
        <>
          <ComponentDescription>You have {drafts.length} AI-generated reply draft{drafts.length !== 1 ? 's' : ''}</ComponentDescription>
          <DraftList>
            {drafts.map((draft) => (
              <DraftItem
                key={draft.id}
                onClick={() => toggleExpand(draft.id)} // Add onClick to toggle expansion
                isExpanded={expandedDraftId === draft.id} // Pass prop for styling
              >
                <DraftHeader>
                  <MessageId>Message ID: {draft.message_id}</MessageId>
                  <ReplyStatus needsReply={draft.needs_reply}>
                    {draft.needs_reply ? 'Needs Reply' : 'Optional'}
                  </ReplyStatus>
                </DraftHeader>
                <DraftContent>{draft.reply_draft}</DraftContent>
                <DraftMeta>
                  <span>Generated by AI</span>
                  <span>
                    {draft.processed_at && `Processed: ${formatDate(draft.processed_at)}`}
                  </span>
                </DraftMeta>

                {/* Conditionally render original message details */}
                {expandedDraftId === draft.id && (
                  <OriginalMessageDetails>
                    <h4>Original Message</h4>
                    <p><strong>From:</strong> {draft.sender}</p>
                    <p><strong>Subject:</strong> {draft.subject}</p>
                    <p><strong>Body:</strong> <br/>{draft.body}</p>
                  </OriginalMessageDetails>
                )}
              </DraftItem>
            ))}
          </DraftList>
        </>
      )}
    </ComponentContent>
  );
};

export default ReplyAssistant;