import 'tailwindcss/tailwind.css';

declare module 'tailwindcss/tailwind.css' {
  const content: any;
  export default content;
}

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}
