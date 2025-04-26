import React, { useState, useEffect } from 'react';
import '../assets/css/Reading.css';

const IELTSReadingPage = () => {
  const [readingPassage, setReadingPassage] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);


  useEffect(() => {
    fetch("http://localhost:8080/readingSuggestion")
      .then((response) => response.json())
      .then((response) => {
        setReadingPassage(response.paragraph);
        setQuestions(response.questions);
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []); 


  useEffect(() => {
    const initialAnswers = questions.map(question => {
      if (question.type.toLowerCase() === 'matching features') {
        return {};
      } else if (
        question.type.toLowerCase() === 'which paragraph contains' ||
        question.type.toLowerCase() === 'summary completion'
      ) {
        return Array(question.items?.length || question.summary?.split(/__________/).length - 1).fill('');
      } else {
        return '';
      }
    });
    setAnswers(initialAnswers);
  }, [questions]);

  const handleAnswerChange = (questionIndex, value, answerIndex) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      if (answerIndex !== undefined) {
        const newArray = [...newAnswers[questionIndex]];
        newArray[answerIndex] = value;
        newAnswers[questionIndex] = newArray;
      } else {
        newAnswers[questionIndex] = value;
      }
      return newAnswers;
    });
  };

  const handleMatchingChange = (questionIndex, itemIndex, value) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      const newMatch = { ...newAnswers[questionIndex] };
      newMatch[itemIndex] = value;
      newAnswers[questionIndex] = newMatch;
      return newAnswers;
    });
  };

  const renderQuestion = (question, index) => {
    switch (question.type.toLowerCase()) {
      case 'yes/no/not given':
      case 'true/false/not given':
        const options = question.type.toLowerCase() === 'yes/no/not given'
          ? ['Yes', 'No', 'Not Given']
          : ['True', 'False', 'Not Given'];
        return (
          <div className="question">
            <p>{question.text}</p>
            <div className="options">
              {options.map(opt => (
                <label key={opt}>
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={opt}
                    checked={answers[index] === opt}
                    onChange={() => handleAnswerChange(index, opt)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        );

      case 'which paragraph contains':
        const paragraphCount = readingPassage.split('\n').filter(p => p.trim()).length;
        return (
          <div className="question">
            <p>{question.text}</p>
            <ul>
              {question.items.map((item, idx) => (
                <li key={idx}>
                  {idx + 1}. {item}
                  <select
                    value={answers[index]?.[idx] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value, idx)}
                  >
                    <option value="">Select paragraph...</option>
                    {Array.from({ length: paragraphCount }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Paragraph {i + 1}</option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        );

        case 'matching information':
        const paragraphCount2 = readingPassage.split('\n').filter(p => p.trim()).length;
        return (
          <div className="question">
            <p>{question.text}</p>
            <ul>
              
                <li >
                 
                  <select
                    value={answers[index]?.[0] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value, 0)}
                  >
                    <option value="">Select paragraph...</option>
                    {Array.from({ length: paragraphCount2 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>Paragraph {i + 1}</option>
                    ))}
                  </select>
                </li>
            </ul>
          </div>
        );



      case 'short answer':
      case 'sentence completion':
        return (
          <div className="question">
            <p>{question.text}</p>
            <input
              type="text"
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            />
          </div>
        );

      case 'matching features':
        return (
          <div className="question">
            <p>{question.text}</p>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Feature</th>
                </tr>
              </thead>
              <tbody>
                {question.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.text}</td>
                    <td>
                      <select
                        value={answers[index]?.[idx] || ''}
                        onChange={(e) => handleMatchingChange(index, idx, e.target.value)}
                      >
                        <option value="">Select...</option>
                        {item.options.map((opt, optIdx) => (
                          <option key={optIdx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'multiple choice':
        return (
          <div className="question">
            <p>{question.text}</p>
            <div className="options">
              {question.options.map((option, idx) => (
                <label key={idx}>
                  <input
                    type="radio"
                    name={`q${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={() => handleAnswerChange(index, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );



      case 'summary completion':
        return (
          <div className="question">
            <p>{question.text}</p>
            <div className="summary-text">
              {question.summary.split(/__________/).map((part, idx, arr) => (
                <React.Fragment key={idx}>
                  {part}
                  {idx < arr.length - 1 && (
                    <input
                      type="text"
                      value={answers[index]?.[idx] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value, idx)}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Unknown question type: {question.type}</div>;
    }
  };

  const groupQuestionsByType = () => {
    const grouped = {
      'yes/no/not given': [],
      'true/false/not given': [],
      'which paragraph contains': [],
      'short answer': [],
      'sentence completion': [],
      'matching features': [],
      'multiple choice': [],
      'summary completion': [],
      'matching information':[]
    };

    questions.forEach((question, index) => {
      grouped[question.type.toLowerCase()]?.push({ ...question, index });
    });

    return grouped;
  };

  const groupedQuestions = groupQuestionsByType();

  return (
    <div className="ielts-reading-container">
      <h1>IELTS Reading Practice</h1>

      <div className="reading-passage">
        <h2>Reading Passage</h2>
        {readingPassage.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
          <p key={idx}>{paragraph.trim()}</p>
        ))}
      </div>

      <div className="questions-section">
        <h2>Questions</h2>
        {Object.entries(groupedQuestions).map(([type, questions]) => (
          questions.length > 0 && (
            <div key={type} className="question-group">
              <h3>{type.split('/').map(word => word.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(' / ')}</h3>
              {questions.map((question, idx) => (
                <div key={`${type}-${idx}`} className="question-container">
                  {['yes/no/not given', 'true/false/not given', 'short answer', 'sentence completion', 'multiple choice'].includes(type) && (
                    <p className="question-number">{question.index + 1}.</p>
                  )}
                  {renderQuestion(question, question.index)}
                </div>
              ))}
            </div>
          )
        ))}
      </div>

      <button className="submit-btn" onClick={() => console.log('Answers:', answers)}>
        Submit Answers
      </button>
    </div>
  );
};

export default IELTSReadingPage;
