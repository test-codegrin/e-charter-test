export default function Loader({ text = "Almost there..." }) {
  return (
    <section className="h-[80vh] w-full flex flex-col items-center justify-center">
      <div className="text-xl font-semibold text-primary-500">
        {text}
      </div>
     <div className="w-[25rem] h-1 bg-gray-300 rounded overflow-hidden relative mt-4"> 
        <div className="absolute h-full w-1/3 bg-primary-400 animate-loading" /> 
        </div>
    </section>
  );
}

