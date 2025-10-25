import React from "react";
import { Link } from "react-router-dom";
import { useActiveUser } from '../contexts/ActiveUserContext'

function ChevronRight() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M9 6L15 12L9 18'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function ProblemCard({ problem }) {
  const { uuid } = useActiveUser()
  return (
    <div className='ios-card p-4 rounded-xl'>
      <div className='flex items-start gap-4'>
        <div className='flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f0ff] to-[#dbeeff] flex items-center justify-center'>
          <svg
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M12 5v14'
              stroke='#0b5ed7'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <path
              d='M5 12h14'
              stroke='#0b5ed7'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='font-semibold text-lg'>{problem.title}</h3>
              <div className='text-sm muted mt-1'>
                {problem.tests ?? "N/A"} tests
              </div>
            </div>
            <div>
              <Link
                to={`/submit/${uuid || 'your-uuid'}/${problem.id}`}
                className='ios-button'
              >
                Submit <ChevronRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
