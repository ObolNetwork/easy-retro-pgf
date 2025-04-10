export const Banner = () => {
    return (
      <div
        className="
          flex justify-center items-center gap-2 
          w-full h-[40px] flex-shrink-0 
          bg-primary-600
        "
      >
        <p
          className="
            text-center text-black 
            font-sans text-sm md:text-base font-medium
          "
        >
          The first OBOL RAF has already concluded, please stay tuned for the next round{" "}
          <a
            href="https://blog.obol.org/raf1-results/"
            target="_blank"
            rel="noopener noreferrer"
            className="
              font-sans font-bold text-black underline 
              decoration-solid decoration-black 
              decoration-1 underline-offset-2
            "
          >
            View Results
          </a>
        </p>
      </div>
    );
  };