import Topbar from '@/components/Topbar/Topbar';
import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div><Topbar />
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        
      <h1 className="text-3xl md:text-4xl font-bold text-green-400 mb-8">
        Contact
      </h1>

      {/* Informații de contact */}
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg shadow-green-500/20">
        <h2 className="text-xl font-semibold text-green-300 mb-4">
          Hai să vorbim
        </h2>
        <div className="flex flex-col gap-4">
          {/* Email */}
          <a
            href="mailto:tudorvladuceanu@gmail.com"
            className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
          >
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l9 6 9-6m0 10V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2z"
              />
            </svg>
            tudorvladuceanu@gmail.com
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/VladuceanuTudor"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
          >
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.164 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.349-1.087.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.683-.103-.253-.446-1.27.098-2.646 0 0 .84-.27 2.75 1.025A9.563 9.563 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.295 2.747-1.025 2.747-1.025.546 1.376.203 2.393.1 2.646.641.699 1.03 1.592 1.03 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"
              />
            </svg>
            github.com/VladuceanuTudor
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/tudorvladuceanu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
          >
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163C8.735 0 8.332.013 7.052.07 5.766.128 4.326.393 3.042 1.677 1.758 2.961 1.493 4.401 1.435 5.687.013 8.332 0 8.735 0 12s.013 3.668.07 4.948c.058 1.286.323 2.726 1.607 4.01 1.284 1.284 2.724 1.549 4.01 1.607 1.28.057 1.683.07 4.948.07s3.668-.013 4.948-.07c1.286-.058 2.726-.323 4.01-1.607 1.284-1.284 1.549-2.724 1.607-4.01.057-1.28.07-1.683.07-4.948s-.013-3.668-.07-4.948c-.058-1.286-.323-2.726-1.607-4.01-1.284-1.284-2.724-1.549-4.01-1.607C15.668.013 15.265 0 12 0z"
              />
            </svg>
            instagram.com/tudorvladuceanu
          </a>

          {/* Locație */}
          <a
            href="https://www.google.com/maps/search/?api=1&query=București,+România"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
          >
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            București, România
          </a>

          {/* LinkedIn
          <a
            href="https://linkedin.com/in/exemplu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
          >
            <svg
              className="w-5 h-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 0H5a5 5 0 00-5 5v14a5 5 0 005 5h14a5 5 0 005-5V5a5 5 0 00-5-5zM8 19H5V8h3v11zM6.5 6.732c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zM20 19h-3v-5.604c0-3.368-4-3.113-4 0V19h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"
              />
            </svg>
            linkedin.com/in/exemplu
          </a> */}

          {/* Telefon */}
          <a
            href="tel:+40774003734"
            className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
          >
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            +40 774 003 734
          </a>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ContactPage;