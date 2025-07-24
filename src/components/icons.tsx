import type { SVGProps } from 'react';

export function AsistenciaAvivaLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
        <rect width="24" height="24" rx="6" fill="#23CD7D"/>
        <path d="M12 4C8.68629 4 6 6.68629 6 10V14C6 17.3137 8.68629 20 12 20C15.3137 20 18 17.3137 18 14V10C18 6.68629 15.3137 4 12 4Z" fill="#F8FAFC" stroke="#374151" strokeWidth="1.5"/>
        <path d="M12 6.5C9.51472 6.5 7.5 8.51472 7.5 11V13C7.5 15.4853 9.51472 17.5 12 17.5C14.4853 17.5 16.5 15.4853 16.5 13V11C16.5 8.51472 14.4853 6.5 12 6.5Z" fill="#23CD7D"/>
        <path d="M12 9.5C11.1716 9.5 10.5 10.1716 10.5 11C10.5 11.8284 11.1716 12.5 12 12.5C12.8284 12.5 13.5 11.8284 13.5 11C13.5 10.1716 12.8284 9.5 12 9.5Z" fill="#F8FAFC"/>
    </svg>
  );
}
