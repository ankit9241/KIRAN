import React from 'react';
import { FaFolder } from 'react-icons/fa';

const SubjectList = ({ subjects, activeSubject, onSubjectClick }) => {
  return (
    <div className="space-y-2">
      {subjects.map((subject) => (
        <button
          key={subject.id}
          onClick={() => onSubjectClick(subject.id)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
            ${activeSubject === subject.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
        >
          <FaFolder className="w-5 h-5 text-gray-400" />
          <span className="font-medium">{subject.name}</span>
        </button>
      ))}
    </div>
  );
};

export default SubjectList;
